import { AppError } from '../../core/errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../core/utils/jwt.js';
import { hashPassword, comparePassword } from '../../core/utils/password.js';
import { User } from '../user/user.model.js';
import { env } from '../../config/env.js';

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

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      provider: 'local',
      roles: ['user'],
    });

    const accessToken = signAccessToken({ userId: user._id, roles: user.roles });
    const refreshToken = signRefreshToken({ userId: user._id });
    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new AppError('Invalid credentials', 401);
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
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) {
      throw new AppError('Refresh token missing', 401);
    }
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
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
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

    // After successful login via Google, redirect back to frontend
    res.redirect(env.clientUrl || '/');
  } catch (err) {
    next(err);
  }
}