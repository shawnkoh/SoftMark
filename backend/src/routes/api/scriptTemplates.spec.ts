import * as request from "supertest";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { getRepository } from "typeorm";
import { QuestionTemplatePostData } from "../../types/questionTemplates";

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
  await getRepository(ScriptTemplate).save(scriptTemplate);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH /script_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
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

describe("DELETE /script_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
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

describe("PATCH /script_templates/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
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

describe("POST /script_templates/:id/question_templates", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow creating a Question Template with no score and no parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "1",
      score: null
    };
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });

  it("should allow creating a Question Template with a score and no parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "2",
      score: 5
    };
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });

  it("should allow creating a Question Template with a score and a parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "1a",
      score: 2
    };
    const response = await request(server.server)
      .post(`/v1/script_templates/${scriptTemplate.id}/question_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });
});
