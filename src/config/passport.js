import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';
import User from '../models/user.model.js';
import config from './config.js';

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: (req) => {
    return req.headers.authorization?.split(' ')[1];

  },
  secretOrKey: config.JWT.ACCESS_SECRET
};

// Local Strategy Configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  
  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) return done(null, false, { message: 'Invalid credentials' });
    if (!(await user.comparePassword(password))) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google Strategy Configuration
passport.use(new GoogleStrategy({
  clientID: config.GOOGLE.CLIENT_ID,
  clientSecret: config.GOOGLE.CLIENT_SECRET,
  callbackURL: config.GOOGLE.CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        fullname: profile.displayName,
        avatar: profile.photos[0]?.value,
        isVerified: true
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// JWT Strategy Configuration
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload._id);
    
    if (!user) return done(null, false);
    if (user.passwordChangedAfter(jwtPayload.iat)) {
      return done(null, false, 'Password changed. Please reauthenticate.');
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Session Configuration (optional)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;