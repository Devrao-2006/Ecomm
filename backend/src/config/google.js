import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { User } from '../modules/user/user.model.js';

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

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              passwordHash: null,
              provider: 'google',
              roles: ['user'],
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}