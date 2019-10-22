import * as request from "supertest";
import { PaperUserRole } from "../../types/paperUsers";
import {
  synchronize,
  loadFixtures,
  getToken,
  getPasswordlessToken,
  getAuthorizationToken
} from "../../utils/tests";
import { ApiServer } from "../../server";

let server: ApiServer;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  await loadFixtures(server);
});

afterAll(async () => {
  await server.close();
});

describe("POST papers/:id/users", () => {
  it("should allow an Owner to access this route if he owns the paper", async () => {
    const { accessToken } = await getToken(
      server,
      "owner@u.nus.edu",
      "setMeUp?"
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    expect(res.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const { accessToken } = await getToken(
      server,
      "marker@u.nus.edu",
      "setMeUp?"
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const authorizationToken = await getAuthorizationToken(
      server,
      "student@u.nus.edu"
    );
    const { accessToken } = await getPasswordlessToken(
      server,
      authorizationToken
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });

  it("should allow an Owner to create another Owner", async () => {
    const { accessToken } = await getToken(
      server,
      "owner@u.nus.edu",
      "setMeUp?"
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "owner2@u.nus.edu",
        role: PaperUserRole.Owner
      });
    expect(res.status).toEqual(201);
  });

  it("should allow an Owner to create another Marker", async () => {
    const { accessToken } = await getToken(
      server,
      "owner@u.nus.edu",
      "setMeUp?"
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "marker2@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(res.status).toEqual(201);
  });

  it("should allow an Owner to create another Student", async () => {
    const { accessToken } = await getToken(
      server,
      "owner@u.nus.edu",
      "setMeUp?"
    );
    const res = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "student2@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(res.status).toEqual(201);
  });

  it("should not allow creating a duplicate PaperUser", async () => {
    const { accessToken } = await getToken(
      server,
      "owner@u.nus.edu",
      "setMeUp?"
    );
    const markerResponse = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(markerResponse.status).toEqual(201);

    const studentResponse = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(studentResponse.status).toEqual(400);
  });

  // it("should create a new user if email does not exist", async () => {});
});
