/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";

export const error = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ message: "Internal Server Error" });
};
