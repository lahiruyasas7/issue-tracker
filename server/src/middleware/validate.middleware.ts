import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestField = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, field: RequestField = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[field]);

      //Type-safe assignments
      if (field === "body") {
        req.body = parsed;
      } else {
        // store safely instead of overriding
        (req as any).validated = (req as any).validated || {};
        (req as any).validated[field] = parsed;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        res.status(422).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }
      next(err);
    }
  };
