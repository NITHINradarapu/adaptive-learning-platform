import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return (jwt.sign as any)(payload, config.jwtSecret, { expiresIn: config.jwtExpire });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
};
