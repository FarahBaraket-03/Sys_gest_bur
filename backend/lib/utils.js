
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



export const generateToken = (userId, expiresIn = '1h') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const generateRefreshToken = (userId, expiresIn = '2d') => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn }
  );
};