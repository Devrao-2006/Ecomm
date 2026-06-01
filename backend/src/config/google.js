import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { prisma } from './db.prisma.js';
import { logger } from '../core/utils/logger.js';

export function configureGoogleOAuth() {
  if (!env.googleClientId || !env.googleClientSecret) {
    console.warn('Google OAuth not configured - missing client ID/secret');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) {
            return done(new Error('Google profile has no email'), null);
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email,
                passwordHash: null,
                provider: 'google',
                roles: ['user'],
                emailVerified: true,
                adminApproved: true,
              }
            });
            logger.info(`[Google OAuth] New user created and auto-verified: ${email}`);
          } else if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
              }
            });
            logger.info(`[Google OAuth] Existing user auto-verified via Google: ${email}`);
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}