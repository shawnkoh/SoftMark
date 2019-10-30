import * as request from "supertest";
import { getRepository } from "typeorm";

import { Script } from "../../entities/Script";
import { ApiServer } from "../../server";
import { PaperUserRole } from "../../types/paperUsers";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
let script1: Script;
let script2: Script;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  script1 = new Script(fixtures.paper, fixtures.student);
  script2 = new Script(
    fixtures.paper,
    (await fixtures.createPaperUser(PaperUserRole.Student)).paperUser
  );
  await getRepository(Script).save([script1, script2]);
});

afterAll(async () => {
  await server.close();
});

describe("GET /scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Script's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Student to access another Student's Script", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/scripts/${script2.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("DELETE /scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/scripts/${script1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH /scripts/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
