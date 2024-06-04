import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import cookieParser from "cookie-parser";
import tenantRouter from "./routes/tenants";
import userRouter from "./routes/user";

const app = express();
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", async (req, res, next) => {
  res.send("Welcome dear deepa_yav ");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // console.log(err);
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
