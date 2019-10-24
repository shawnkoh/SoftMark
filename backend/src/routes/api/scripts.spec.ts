import * as request from "supertest";
import { getRepository } from "typeorm";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { PaperUser } from "../../entities/PaperUser";
import { Script } from "../../entities/Script";
import { User } from "../../entities/User";
import { PaperUserRole } from "../../types/paperUsers";

let server: ApiServer;
let fixtures: Fixtures;
let script1: Script;
let script2: Script;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  script1 = new Script();
  script1.paper = fixtures.paper;
  script1.paperUser = fixtures.student;

  script2 = new Script();
  script2.paper = fixtures.paper;
  script2.paperUser = new PaperUser();
  script2.paperUser.paper = fixtures.paper;
  script2.paperUser.role = PaperUserRole.Student;
  script2.paperUser.user = new User();
  script2.paperUser.user.email = "badaboum@gmail.com";
  await getRepository(User).save(script2.paperUser.user);
  await getRepository(PaperUser).save(script2.paperUser);
  await getRepository(Script).save([script1, script2]);
});

afterAll(async () => {
  await server.close();
});

describe("GET scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should allow a Script's Student to access this route", async () => {
    const his = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(his.status).toEqual(200);

    const other = await request(server.server)
      .get(`/v1/scripts/${script2.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(other.status).toEqual(404);
  });
});

describe("DELETE scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH scripts/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
