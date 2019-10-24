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
let ownerAccessToken: string;
let markerAccessToken: string;
let studentAccessToken: string;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  await loadFixtures(server);
  ownerAccessToken =
    "Bearer " +
    (await getToken(server, "owner@u.nus.edu", "setMeUp?")).accessToken;
  markerAccessToken =
    "Bearer " +
    (await getToken(server, "marker@u.nus.edu", "setMeUp?")).accessToken;
  studentAccessToken = "Bearer " + (await getStudentAccessToken());
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

describe("POST papers/:id/users", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const validResponse = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send();
    expect(validResponse.status).not.toEqual(404);

    const rejectResponse = await request(server.server)
      .post("/v1/papers/2/users")
      .set("Authorization", ownerAccessToken)
      .send();
    expect(rejectResponse.status).toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to create another Owner", async () => {
    const response = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send({
        email: "owner2@u.nus.edu",
        role: PaperUserRole.Owner
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Marker", async () => {
    const response = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send({
        email: "marker2@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Student", async () => {
    const response = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send({
        email: "student2@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(response.status).toEqual(201);
  });

  it("should not allow creating a duplicate PaperUser", async () => {
    const markerResponse = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(markerResponse.status).toEqual(201);

    const studentResponse = await request(server.server)
      .post("/v1/papers/1/users")
      .set("Authorization", ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(studentResponse.status).toEqual(400);
  });

  // it("should create a new user if email does not exist", async () => {});
});

describe("POST papers/:id/scripts", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/1/scripts`)
      .set("Authorization", ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/1/scripts`)
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/1/scripts`)
      .set("Authorization", studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("GET papers/:id/scripts", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/1/scripts`)
      .set("Authorization", ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/1/scripts`)
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/1/scripts`)
      .set("Authorization", studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
