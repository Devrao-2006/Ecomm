import { AppError } from '../../core/errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../core/utils/jwt.js';
import { hashPassword, comparePassword } from '../../core/utils/password.js';
import { prisma } from '../../config/db.prisma.js';
import { env } from '../../config/env.js';
import {
  issueVerificationToken,
  consumeVerificationToken,
  resendVerification,
  adminApproveUser,
} from './verification.service.js';
import { logVerificationEvent } from '../../core/utils/auditLog.js';

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = env.nodeEnv === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    let existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing && existing.emailVerified) {
      throw new AppError('Email already in use', 400);
    }

    let user = existing;
    if (!user) {
      const passwordHash = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          provider: 'local',
          roles: ['user'],
          emailVerified: false,
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          passwordHash: await hashPassword(password),
        }
      });
    }

    await issueVerificationToken(user, clientIp(req), req.headers['user-agent']);

    res.status(202).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.emailVerified) {
      await logVerificationEvent({
        userId: user.id.toString(),
        event: 'login_blocked',
        ip: clientIp(req),
        userAgent: req.headers['user-agent'],
        metadata: { reason: 'email_not_verified' },
      });
      throw new AppError(
        'Please verify your email address before logging in.',
        403,
        { code: 'EMAIL_NOT_VERIFIED' }
      );
    }

    if (env.requireAdminApproval && !user.adminApproved) {
      await logVerificationEvent({
        userId: user.id.toString(),
        event: 'login_blocked',
        ip: clientIp(req),
        userAgent: req.headers['user-agent'],
        metadata: { reason: 'pending_admin_approval' },
      });
      throw new AppError(
        'Your account is pending admin approval.',
        403,
        { code: 'PENDING_ADMIN_APPROVAL' }
      );
    }

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user.id });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token, uid, v } = req.query;

    if (!token || !uid || v === undefined) {
      throw new AppError('Invalid verification link', 400);
    }

    let user = await consumeVerificationToken(
      token,
      uid,
      Number(v),
      clientIp(req),
      req.headers['user-agent']
    );

    if (env.requireAdminApproval && !user.adminApproved) {
      return res.redirect(`${env.clientUrl}/login?info=pending_approval`);
    }

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user.id });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${env.clientUrl || '/'}`);
  } catch (err) {
    const code = err.statusCode === 400 ? 'invalid_link' : 'server_error';
    return res.redirect(`${env.clientUrl}/login?error=verify_${code}`);
  }
}

export async function resendVerificationHandler(req, res, next) {
  try {
    const { email } = req.body;
    if (email) {
      await resendVerification(email.toLowerCase(), clientIp(req), req.headers['user-agent']);
    }
    res.status(202).json({
      success: true,
      message: 'If that email address is registered and unverified, a new link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

export async function adminApproveUserHandler(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await adminApproveUser(userId, req.user.id, clientIp(req));
    res.json({
      success: true,
      message: `User ${user.email} has been approved.`,
      user: { id: user.id, email: user.email, adminApproved: user.adminApproved },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const decoded = verifyRefreshToken(token);
    let user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const newRefreshToken = signRefreshToken({ userId: user.id });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });
    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await prisma.user.updateMany({
          where: { id: decoded.userId, refreshToken: token },
          data: { refreshToken: null }
        });
      } catch {
        // Ignore invalid token during logout
      }
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next(err);
  }
}

export async function handleGoogleCallback(req, res, next) {
  try {
    let user = req.user;
    if (!user) {
      return res.redirect(`${env.clientUrl}/login?error=auth_failed`);
    }

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user.id });

    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(env.clientUrl || '/');
  } catch (err) {
    next(err);
  }
}