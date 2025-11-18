import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next))
      .then((result) => result)
      .catch((err) => next(err));
  };
};
