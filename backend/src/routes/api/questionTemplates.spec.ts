import * as request from "supertest";
import { getRepository } from "typeorm";

import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import {
  QuestionTemplatePatchData,
  QuestionTemplateData,
  isQuestionTemplateData
} from "../../types/questionTemplates";

let server: ApiServer;
let fixtures: Fixtures;
let scriptTemplate: ScriptTemplate;
let q1: QuestionTemplate;
let q1a: QuestionTemplate;
let q1b: QuestionTemplate;
let q2: QuestionTemplate;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate();
  scriptTemplate.paperId = 1;

  q1 = new QuestionTemplate();
  q1.scriptTemplate = scriptTemplate;
  q1.name = "1";

  q1a = new QuestionTemplate();
  q1a.scriptTemplate = scriptTemplate;
  q1a.name = "1a";
  q1a.parentQuestionTemplate = q1;
  q1a.score = 1.5;

  q1b = new QuestionTemplate();
  q1b.scriptTemplate = scriptTemplate;
  q1b.name = "1b";
  q1b.parentQuestionTemplate = q1;
  q1b.score = 1.5;

  q2 = new QuestionTemplate();
  q2.scriptTemplate = scriptTemplate;
  q2.name = "2";
  q2.score = 6;

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(q1);
  await getRepository(QuestionTemplate).save(q1a);
  await getRepository(QuestionTemplate).save(q1b);
  await getRepository(QuestionTemplate).save(q2);
});

afterAll(async () => {
  await server.close();
});

describe("GET /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should return QuestionTemplateData", async () => {
    const response = await request(server.server)
      .get(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(200);
    expect(isQuestionTemplateData(response.body.questionTemplate));
  });
});

describe("PATCH /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow changing the Question Template's name, score and parent", async () => {
    const patchData: QuestionTemplatePatchData = {
      name: "3",
      score: 100,
      parentName: q2.name
    };
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1a.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data = response.body.questionTemplate as QuestionTemplateData;
    expect(data.name).toEqual(patchData.name);
    expect(data.score).toEqual(patchData.score);
    expect(data.parentQuestionTemplateId).toEqual(q2.id);
  });
});

describe("DELETE /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/question_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should delete a Question Template", async () => {
    const response = await request(server.server)
      .delete(`/v1/question_templates/${q2.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
    expect(response.body).toEqual({});
  });
});

describe("PATCH /question_templates/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q1.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should restore a deleted Question Template", async () => {
    const response = await request(server.server)
      .patch(`/v1/question_templates/${q2.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.questionTemplate as QuestionTemplateData;
    expect(data.discardedAt).toEqual(null);
  });
});
