import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/user.model.js'
import config from './config.js'

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) return done(null, false, { message: 'Invalid credentials' })
    if (!user.password) return done(null, false, { message: 'Please use social login' })
    
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return done(null, false, { message: 'Invalid credentials' })
    
    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: config.GOOGLE.CLIENT_ID,
  clientSecret: config.GOOGLE.CLIENT_SECRET,
  callbackURL: config.GOOGLE.CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id })
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        fullname: profile.displayName,
        avatar: profile.photos[0]?.value
      })
    }
    
    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})