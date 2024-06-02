import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { User } from "../../src/entity/User";

describe("POST/users", () => {
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
    it("Should persist the user in the database", async () => {
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
        tenantId: 1,
      };
      //Add token to cookie
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //assert
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("Should create a manager  user in the database", async () => {
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
        tenantId: 1,
      };
      //Add token to cookie
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      //assert
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it.todo("Should return 403 if non admin user tries to create a user");
  });
});
