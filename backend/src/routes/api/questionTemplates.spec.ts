import request from "supertest";
import { getRepository } from "typeorm";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import {
  AllocationData,
  AllocationPostData,
  isAllocationData
} from "../../types/allocations";
import {
  isQuestionTemplateData,
  QuestionTemplateData,
  QuestionTemplatePatchData
} from "../../types/questionTemplates";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let scriptTemplate: ScriptTemplate;
let q1Template: QuestionTemplate;
let q1aTemplate: QuestionTemplate;
let q1bTemplate: QuestionTemplate;
let q2Template: QuestionTemplate;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);
  scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");

  q1Template = new QuestionTemplate(scriptTemplate, "1", null);
  q1aTemplate = new QuestionTemplate(
    scriptTemplate,
    "1a",
    1.5,
    "1, 2, 3",
    1,
    100,
    100,
    q1Template
  );
  q1bTemplate = new QuestionTemplate(
    scriptTemplate,
    "1b",
    1.5,
    "1, 2, 3",
    1,
    200,
    200,
    q1Template
  );
  q2Template = new QuestionTemplate(scriptTemplate, "2", 6);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(q1Template);
  await getRepository(QuestionTemplate).save(q1aTemplate);
  await getRepository(QuestionTemplate).save(q1bTemplate);
  await getRepository(QuestionTemplate).save(q2Template);
});

afterAll(async () => {
  await server.close();
});

describe("GET /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should return QuestionTemplateData", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data: QuestionTemplateData = response.body.questionTemplate;
    expect(isQuestionTemplateData(data)).toBe(true);
  });
});

describe("PATCH /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow changing the Question Template's name, score and parent", async () => {
    const patchData: QuestionTemplatePatchData = {
      name: "3",
      score: 100,
      parentQuestionTemplateId: q2Template.id
    };
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1aTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data = response.body.questionTemplate as QuestionTemplateData;
    expect(data.name).toEqual(patchData.name);
    expect(data.score).toEqual(patchData.score);
    expect(data.parentQuestionTemplateId).toEqual(q2Template.id);
  });
});

describe("DELETE /question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should delete a Question Template", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/question_templates/${q2Template.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
    expect(response.body).toEqual({});
  });
});

describe("PATCH /question_templates/:id/undiscard", () => {
  beforeEach(async () => {
    await getRepository(QuestionTemplate).update(q1Template.id, {
      discardedAt: new Date()
    });
  });
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should restore a deleted Question Template", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/question_templates/${q1Template.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.questionTemplate as QuestionTemplateData;
    expect(data.discardedAt).toEqual(null);
  });
});

describe("POST /question_templates/:id/allocations", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return AllocationData", async () => {
    const postData: AllocationPostData = {
      paperUserId: fixtures.marker.id
    };
    const response = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    const data = response.body.allocation as AllocationData;
    expect(isAllocationData(data)).toEqual(true);
  });

  it("should not allow duplicate allocations", async () => {
    const postData: AllocationPostData = {
      paperUserId: fixtures.marker.id
    };
    const first = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(first.status).toEqual(201);

    const second = await request(server.server)
      .post(`${fixtures.api}/question_templates/${q1Template.id}/allocations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(second.status).toEqual(400);
  });
});
