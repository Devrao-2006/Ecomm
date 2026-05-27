import { AppError } from '../../core/errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../core/utils/jwt.js';
import { hashPassword, comparePassword } from '../../core/utils/password.js';
import { User } from '../user/user.model.js';
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

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.emailVerified) {
      throw new AppError('Email already in use', 400);
    }

    let user = existing;
    if (!user) {
      const passwordHash = await hashPassword(password);
      user = await User.create({
        name,
        email,
        passwordHash,
        provider: 'local',
        roles: ['user'],
        emailVerified: false,
      });
    } else {
      user.name = name;
      user.passwordHash = await hashPassword(password);
      await user.save();
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
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.emailVerified) {
      await logVerificationEvent({
        userId: user._id.toString(),
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
        userId: user._id.toString(),
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

    const accessToken = signAccessToken({ userId: user._id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      user: {
        id: user._id,
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

    const user = await consumeVerificationToken(
      token,
      uid,
      Number(v),
      clientIp(req),
      req.headers['user-agent']
    );

    if (env.requireAdminApproval && !user.adminApproved) {
      return res.redirect(`${env.clientUrl}/login?info=pending_approval`);
    }

    const accessToken = signAccessToken({ userId: user._id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user._id });
    user.refreshToken = refreshToken;
    await user.save();
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
      await resendVerification(email, clientIp(req), req.headers['user-agent']);
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
      user: { id: user._id, email: user.email, adminApproved: user.adminApproved },
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
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = signAccessToken({ userId: user._id, roles: user.roles });
    const newRefreshToken = signRefreshToken({ userId: user._id });
    user.refreshToken = newRefreshToken;
    await user.save();
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
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
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
    const user = req.user;
    if (!user) {
      return res.redirect(`${env.clientUrl}/login?error=auth_failed`);
    }

    const accessToken = signAccessToken({ userId: user._id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(env.clientUrl || '/');
  } catch (err) {
    next(err);
  }
}