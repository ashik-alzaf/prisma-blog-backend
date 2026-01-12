import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMsg = "Internal Server Error";
  let errorDetails = err;
  //   PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMsg = "Your provide incorrect field type or missing fields";
  }
  //   PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMsg =
        "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMsg = "Foreign key constraint failed on the field";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMsg,
    error: errorDetails,
  });
}

export default errorHandler;
