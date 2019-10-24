import * as request from "supertest";
import { getRepository } from "typeorm";
import { ApiServer } from "../../server";
import {
  synchronize,
  loadFixtures,
  getToken,
  getPasswordlessToken,
  getAuthorizationToken
} from "../../utils/tests";
import { Paper } from "../../entities/Paper";
import { PaperUser } from "../../entities/PaperUser";
import { Script } from "../../entities/Script";
import { User } from "../../entities/User";
import { PaperUserRole } from "../../types/paperUsers";

let server: ApiServer;
let ownerAccessToken: string;
let markerAccessToken: string;
let studentAccessToken: string;
let script1: Script;
let script2: Script;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  await loadFixtures(server);
  ownerAccessToken = (await getToken(server, "owner@u.nus.edu", "setMeUp?"))
    .accessToken;
  markerAccessToken = (await getToken(server, "marker@u.nus.edu", "setMeUp?"))
    .accessToken;
  studentAccessToken = await getStudentAccessToken();

  const paper = await getRepository(Paper).findOneOrFail(1);
  script1 = new Script();
  script1.paper = paper;
  script1.paperUser = await getRepository(PaperUser).findOneOrFail(3);

  script2 = new Script();
  script2.paper = paper;
  script2.paperUser = new PaperUser();
  script2.paperUser.paper = paper;
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

const getStudentAccessToken = async () => {
  const authorizationToken = await getAuthorizationToken(
    server,
    "student@u.nus.edu"
  );
  const { accessToken } = await getPasswordlessToken(
    server,
    authorizationToken
  );
  return accessToken;
};

describe("GET scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should allow a Script's Student to access this route", async () => {
    const his = await request(server.server)
      .get(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(his.status).toEqual(200);

    const other = await request(server.server)
      .get(`/v1/scripts/${script2.id}`)
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(other.status).toEqual(404);
  });
});

describe("DELETE scripts/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).toEqual(204);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/scripts/${script1.id}`)
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH scripts/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).toEqual(200);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/scripts/${script1.id}/undiscard`)
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });
});
