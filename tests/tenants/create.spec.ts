import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";

describe("POST/tenants", () => {
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
    it("Should return a 201 status code", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      const response = await request(app).post("/tenants").send(tenantData);

      expect(response.statusCode).toBe(201);
    });
  });
});
