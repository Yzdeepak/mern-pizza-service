import request from "supertest";

import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //database truncate

    await connection.dropDatabase();
    await connection.synchronize();
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

      //Assert

      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
      // expect(users[0].password).toBe(userData.password);
    });

    it("should return an id of the created user", async () => {
      // Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // console.log(response);

      // Assert
      expect(response.body).toHaveProperty("id");
      const repository = connection.getRepository(User);
      const users = await repository.find();
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });
    it("should assign a customer role", async () => {
      // Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      //Assert

      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("Should store the hashed passwordnin the database", async () => {
      // Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      //assert
      const userRepository = connection.getRepository(User);

      const users = await userRepository.find();
      console.log(users[0].password);

      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it("should return 400 status code if email is already exist", async () => {
      // Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak@gmail.com",
        password: "secret",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      // Act

      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      //assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });
  describe("Fields are missing", () => {});
});
