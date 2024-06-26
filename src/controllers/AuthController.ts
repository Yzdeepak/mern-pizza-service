import { NextFunction, Request, RequestHandler, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";

import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private CredentialService: CredentialService,
  ) {}
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "*****",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      this.logger.info("User has been register", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      //persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, //very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 356, // 1y
        httpOnly: true, //very important
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body;

    this.logger.debug("New request to login a user", {
      email,
      password: "****",
    });

    //Check if username(email) exist in databse
    //Compare password
    //Generate token
    //Add token to Cookies
    //Return the response(id).

    try {
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      //
      const passwordMatch = await this.CredentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      //persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, //very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 356, // 1y
        httpOnly: true, //very important
      });

      this.logger.info("User has been logged in", { id: user.id });

      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    //token req.auth.id
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(
          400,
          "User with the token could not find",
        );
        next(error);
        return;
      }

      //persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      //Delete  old refresh token

      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, //very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 356, // 1y
        httpOnly: true, //very important
      });

      this.logger.info("User has been logged in", { id: user.id });

      res.json({ id: user.id });

      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info("Refresh token has been deleted", { id: req.auth.id });
      this.logger.info("User has been loggedOut", { id: req.auth.sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
