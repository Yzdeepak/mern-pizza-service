import request from "supertest";

import app from "../../src/app";

describe("POST /auth/register", () => {
  describe("Give all fields", () => {
    it("should return the 201 status code", async () => {
      //AAA

      //Arrange
      const userData = {
        firstName: "Deepak",
        lastName: "yadav",
        email: "yzdeepak31@gmail.com",
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
        email: "yzdeepak31@gmail.com",
        password: "secret",
      };

      //Act

      const response = await request(app).post("/auth/register");

      //Asset
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });
  });
  describe("Fields are missing", () => {});
});
