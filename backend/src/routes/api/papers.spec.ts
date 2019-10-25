import * as request from "supertest";
import { PaperUserRole } from "../../types/paperUsers";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { ApiServer } from "../../server";

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

describe("POST /papers/:id/users", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const validResponse = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(validResponse.status).not.toEqual(404);

    const rejectResponse = await request(server.server)
      .post("/v1/papers/2/users")
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(rejectResponse.status).toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to create another Owner", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "owner2@u.nus.edu",
        role: PaperUserRole.Owner
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Marker", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "marker2@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Student", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "student2@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(response.status).toEqual(201);
  });

  it("should not allow creating a duplicate PaperUser", async () => {
    const markerResponse = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(markerResponse.status).toEqual(201);

    const studentResponse = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(studentResponse.status).toEqual(400);
  });

  // it("should create a new user if email does not exist", async () => {});
});

describe("POST /papers/:id/script_templates", () => {
  // Roles
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  // Constraints
  it("should create a Script Template", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplateData);
    expect(response.status).toEqual(201);
  });

  it("should not allow a second Script Template", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplateData);
    expect(response.status).toEqual(400);
  });
});

describe("POST /papers/:id/scripts", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("GET /papers/:id/scripts", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
