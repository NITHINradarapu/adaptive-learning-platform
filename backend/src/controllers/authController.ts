import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

/**
 * @desc    Register a new user using Passport
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local-register', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error registering user'
      });
      return;
    }
    
    if (!user) {
      res.status(400).json({
        success: false,
        message: info?.message || 'Registration failed'
      });
      return;
    }
    
    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          learnerBackground: user.learnerBackground,
          careerGoal: user.careerGoal
        },
        token
      }
    });
  })(req, res, next);
};

/**
 * @desc    Login user using Passport
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = (req: Request, res: Response, next: NextFunction): void => {
  // Validate input
  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
    return;
  }
  
  passport.authenticate('local-login', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error logging in'
      });
      return;
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: info?.message || 'Invalid credentials'
      });
      return;
    }
    
    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          learnerBackground: user.learnerBackground,
          careerGoal: user.careerGoal,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak
        },
        token
      }
    });
  })(req, res, next);
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user as AuthUser | undefined;
    const user = await User.findById(authUser?.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          learnerBackground: user.learnerBackground,
          careerGoal: user.careerGoal,
          averageQuizScore: user.averageQuizScore,
          totalCoursesCompleted: user.totalCoursesCompleted,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req: Request, res: Response): void => {
  // With JWT, logout is handled client-side by removing the token
  // Optionally, you can implement token blacklisting here
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user as AuthUser | undefined;
    const { name, learnerBackground, careerGoal } = req.body;
    
    const user = await User.findById(authUser?.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Update fields
    if (name) user.name = name;
    if (learnerBackground) user.learnerBackground = learnerBackground;
    if (careerGoal) user.careerGoal = careerGoal;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};
