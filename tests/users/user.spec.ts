import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { isjwt } from "../utils";

describe("GET/auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //database truncate
    jwks.start();

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Give all fields", () => {
    //   it("Shoul login the user");

    it("Should return the 200 status code", async () => {
      const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });
  });

  it("Should return the user data", async () => {
    //Register user
    const userData = {
      firstName: "Deepak",
      lastName: "yadav",
      email: "yzdeepak@gmail.com",
      password: "secret",
    };

    const userRepository = connection.getRepository(User);
    const data = await userRepository.save({
      ...userData,
      role: Roles.CUSTOMER,
    });
    //generate token

    const accesstoken = jwks.token({ sub: String(data.id), role: data.role });
    //add token to cookie
    const response = await request(app)
      .get("/auth/self")
      .set("Cookie", [`accessToken=${accesstoken}`])
      .send();

    //assert

    //check if user id matches with register user
    expect((response.body as Record<string, string>).id).toBe(data.id);
  });
  it("SHould not return the password field", async () => {
    //Register user
    const userData = {
      firstName: "Deepak",
      lastName: "yadav",
      email: "yzdeepak@gmail.com",
      password: "secret",
    };

    const userRepository = connection.getRepository(User);
    const data = await userRepository.save({
      ...userData,
      role: Roles.CUSTOMER,
    });
    //generate token

    const accesstoken = jwks.token({ sub: String(data.id), role: data.role });
    //add token to cookie
    const response = await request(app)
      .get("/auth/self")
      .set("Cookie", [`accessToken=${accesstoken}`])
      .send();

    //assert

    //check if user id matches with register user
    expect(response.body as Record<string, string>).not.toHaveProperty(
      "password",
    );
  });

  it("Should return 401 status code if token does not exists", async () => {
    const userData = {
      firstName: "Deepak",
      lastName: "yadav",
      email: "yzdeepak@gmail.com",
      password: "secret",
    };

    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      role: Roles.CUSTOMER,
    });

    const response = await request(app).get("/auth/self").send();

    //assert

    expect(response.statusCode).toBe(401);
  });
});
