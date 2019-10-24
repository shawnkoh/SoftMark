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

describe("GET users/:id", () => {
  it("should allow a User to get his own data", async () => {
    const response = await request(server.server)
      .get(`/v1/users/${fixtures.owner.userId}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should not allow a User to get another User's data", async () => {
    const response = await request(server.server)
      .get(`/v1/users/${fixtures.marker.userId}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
