import * as request from "supertest";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { getRepository } from "typeorm";
import { QuestionTemplate } from "../../entities/QuestionTemplate";

let server: ApiServer;
let fixtures: Fixtures;
let scriptTemplate: ScriptTemplate;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate();
  scriptTemplate.paperId = 1;

  const q1 = new QuestionTemplate();
  q1.scriptTemplate = scriptTemplate;
  q1.name = "1";
  const q1a = new QuestionTemplate();
  q1a.scriptTemplate = scriptTemplate;
  q1a.name = "1a";
  q1a.parentQuestionTemplate = q1;
  q1a.score = 1.5;
  const q1b = new QuestionTemplate();
  q1b.scriptTemplate = scriptTemplate;
  q1b.name = "1b";
  q1b.parentQuestionTemplate = q1;
  q1b.score = 1.5;
  const q2 = new QuestionTemplate();
  q2.scriptTemplate = scriptTemplate;
  q2.name = "2";
  q2.score = 6;

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save([q1, q1a, q1b, q2]);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH script_templates/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("DELETE script_templates/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .delete(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH script_templates/:id/undiscard", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});
