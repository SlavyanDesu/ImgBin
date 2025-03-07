import { v4 as uuid } from "uuid";
import { Request, Response, NextFunction } from "express";

export const cookie = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.cookies.userId) {
    res.cookie("userId", uuid(), {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
  }
  next();
};
