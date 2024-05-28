import request from "supertest";

import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { truncateTables } from "../utils";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //database truncate

    await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Give all fields", () => {
    it("should return the 201 status code", async () => {
      //AAA

      //Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };

      //Act

      await request(app).post("/auth/register").send(userData);

      //Asset
    });

    it("Should return valid json response", async () => {
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };

      //Act

      const response = await request(app).post("/auth/register").send(userData);

      //Asset
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });
    it("should persisit the user in the database ", async () => {
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };

      //Act

      await request(app).post("/auth/register").send(userData);

      //Asset

      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
      expect(users[0].password).toBe(userData.password);
    });
  });
  describe("Fields are missing", () => {});
});
