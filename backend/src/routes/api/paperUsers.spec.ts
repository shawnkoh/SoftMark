import * as request from "supertest";
import { ApiServer } from "../../server";
import {
  synchronize,
  loadFixtures,
  getToken,
  getPasswordlessToken,
  getAuthorizationToken
} from "../../utils/tests";

let server: ApiServer;
let ownerAccessToken: string;
let markerAccessToken: string;
let studentAccessToken: string;
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

describe("PATCH paper_users/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const validResponse = await request(server.server)
      .patch("/v1/paper_users/2")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(validResponse.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const res = await request(server.server)
      .patch("/v1/paper_users/2")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const res = await request(server.server)
      .patch("/v1/paper_users/2")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });
});

describe("DELETE paper_users/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .delete("/v1/paper_users/2")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const res = await request(server.server)
      .delete("/v1/paper_users/2")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const res = await request(server.server)
      .delete("/v1/paper_users/2")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });
});

describe("PATCH paper_users/:id/undiscard", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .patch("/v1/paper_users/2/undiscard")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const res = await request(server.server)
      .patch("/v1/paper_users/2/undiscard")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const res = await request(server.server)
      .patch("/v1/paper_users/2/undiscard")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(res.status).toEqual(404);
  });
});
