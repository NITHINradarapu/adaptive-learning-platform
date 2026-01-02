import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import User, { IUser } from '../models/User';
import config from './config';

/**
 * Passport Local Strategy for Login
 * Authenticates users using email and password
 */
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email (include password field)
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Authentication successful
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Passport Local Strategy for Registration
 * Creates new user account
 */
passport.use(
  'local-register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          return done(null, false, { message: 'Email already registered' });
        }

        // Create new user
        const user = await User.create({
          name: req.body.name,
          email,
          password,
          role: req.body.role || 'student',
          learnerBackground: req.body.learnerBackground || 'beginner',
          careerGoal: req.body.careerGoal || 'Other',
        });

        // Registration successful
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Passport JWT Strategy for Protected Routes
 * Validates JWT tokens and authenticates users
 */
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await User.findById(jwtPayload.id);
      
      if (!user) {
        return done(null, false);
      }

      // Authentication successful
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

/**
 * Serialize user for session (optional, for session-based auth)
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session (optional, for session-based auth)
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
