import { env } from '../../config/env.js';
import { sendMail } from '../../config/mailer.js';
import { generateRawToken, hashToken, verifyTokenHash } from '../../core/utils/token.js';
import { verificationEmail, welcomeEmail, adminPendingApprovalEmail } from '../../core/utils/emailTemplates.js';
import { logVerificationEvent } from '../../core/utils/auditLog.js';
import { User } from '../user/user.model.js';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/utils/logger.js';

function buildVerifyUrl(userId, rawToken, version) {
  const base = process.env.SERVER_URL || `http://localhost:${env.port}`;
  const params = new URLSearchParams({
    token: rawToken,
    uid: userId.toString(),
    v: String(version),
  });
  return `${base}/api/auth/verify-email?${params.toString()}`;
}

export async function issueVerificationToken(user, ip, userAgent) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.verificationTokenTtlMs);
  const newVersion = (user.verificationTokenVersion ?? 0) + 1; // invalidates old tokens

  user.verificationToken = tokenHash;
  user.verificationTokenExpiresAt = expiresAt;
  user.verificationTokenVersion = newVersion;
  await user.save();

  const verifyUrl = buildVerifyUrl(user._id, rawToken, newVersion);
  const { subject, html, text } = verificationEmail(user.name, verifyUrl);
  await sendMail({ to: user.email, subject, html, text });

  await logVerificationEvent({
    userId: user._id.toString(),
    event: 'token_issued',
    ip,
    userAgent,
    metadata: { expiresAt },
  });

  logger.info(`[Verification] Token issued for user ${user._id}`);
}

export async function consumeVerificationToken(rawToken, userId, version, ip, userAgent) {
  const user = await User.findById(userId);
  if (!user || !user.verificationToken) {
    if (user?.emailVerified) {
      return user; // idempotent
    }
    await logVerificationEvent({
      userId: userId ?? 'unknown',
      event: 'replayed',
      ip,
      userAgent,
      metadata: { reason: 'user_not_found_or_no_token' },
    });
    throw new AppError('Invalid or expired verification link', 400);
  }

  if (user.emailVerified) return user;

  if (Number(version) !== user.verificationTokenVersion) {
    await logVerificationEvent({
      userId: user._id.toString(),
      event: 'replayed',
      ip,
      userAgent,
      metadata: { reason: 'version_mismatch', provided: version, current: user.verificationTokenVersion },
    });
    throw new AppError('This verification link has been superseded. Please use the latest email.', 400);
  }

  if (user.verificationTokenExpiresAt < new Date()) {
    await logVerificationEvent({
      userId: user._id.toString(),
      event: 'expired',
      ip,
      userAgent,
    });
    throw new AppError('Verification link has expired. Please request a new one.', 400);
  }

  if (!verifyTokenHash(rawToken, user.verificationToken)) { // constant-time comparison
    await logVerificationEvent({
      userId: user._id.toString(),
      event: 'replayed',
      ip,
      userAgent,
      metadata: { reason: 'hash_mismatch' },
    });
    throw new AppError('Invalid verification link', 400);
  }

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  const { subject, html, text } = welcomeEmail(user.name);
  sendMail({ to: user.email, subject, html, text });

  await logVerificationEvent({
    userId: user._id.toString(),
    event: 'verified',
    ip,
    userAgent,
  });

  logger.info(`[Verification] User ${user._id} successfully verified`);
  return user;
}

export async function resendVerification(email, ip, userAgent) {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    logger.warn(`[Verification] Resend requested for unknown email (ip: ${ip})`);
    return; // silently return to prevent email enumeration
  }

  if (user.emailVerified) {
    logger.info(`[Verification] Resend requested for already-verified user ${user._id}`);
    return; // silently return
  }

  await issueVerificationToken(user, ip, userAgent);
}

export async function adminApproveUser(userId, adminId, ip) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  user.adminApproved = true;
  await user.save();

  await logVerificationEvent({
    userId: user._id.toString(),
    event: 'admin_approved',
    ip,
    metadata: { approvedBy: adminId },
  });

  logger.info(`[Verification] User ${user._id} approved by admin ${adminId}`);
  return user;
}
