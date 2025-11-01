const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
  // --- Google Strategy ---
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback', // Relative to server root
  },
  async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      providerId: profile.id,
      provider: 'google',
      displayName: profile.displayName,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
    };

    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'google' });

      if (user) {
        done(null, user); // User exists
      } else {
        user = await User.create(newUser); // Create new user
        done(null, user);
      }
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  }));

  // --- GitHub Strategy (Similar logic) ---
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    // ... logic for GitHub User creation/lookup ...
    const newUser = {
      providerId: profile.id,
      provider: 'github',
      displayName: profile.displayName || profile.username,
      // GitHub sometimes requires extra scope for email
    };
    try {
        let user = await User.findOne({ providerId: profile.id, provider: 'github' });
        if (user) {
            done(null, user);
        } else {
            user = await User.create(newUser);
            done(null, user);
        }
    } catch (err) {
        done(err, null);
    }
  }));

  // --- Session Serialization ---
  // Passport saves the user ID to the session cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Passport retrieves the full user object from the database using the ID
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err, null);
    });
  });
};
