import * as request from "supertest";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);
});

afterAll(async () => {
  await server.close();
});

describe("GET /users/self", () => {
  it("should allow a User to get his own data", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/users/self`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });
});

describe("PATCH /users/self", () => {
  it("should allow a User to edit his own data", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/users/self`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });
});
