import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

describe("POST/auth/login", () => {
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
      it.todo("Shoul login the user");
    });
  });
});
