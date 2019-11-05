import request from "supertest";
import { getRepository } from "typeorm";

import { Allocation } from "../../entities/Allocation";
import { Mark } from "../../entities/Mark";
import { PaperUserRole } from "../../types/paperUsers";
import { Question } from "../../entities/Question";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import {
  AllocationData,
  isAllocationData,
  AllocationPostData
} from "../../types/allocations";
import {
  QuestionTemplatePatchData,
  QuestionTemplateData,
  isQuestionTemplateData
} from "../../types/questionTemplates";
import { isQuestionData, QuestionData } from "../../types/questions";
import { PaperUser } from "../../entities/PaperUser";
import { addMinutes } from "date-fns";

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
  q1aTemplate = new QuestionTemplate(scriptTemplate, "1a", 1.5, q1Template);
  q1bTemplate = new QuestionTemplate(scriptTemplate, "1b", 1.5, q1Template);
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

  it("should return the parent's discardedAt if only the parent has been discarded", async () => {
    const discardedAt = new Date();
    scriptTemplate.discardedAt = discardedAt;
    await getRepository(ScriptTemplate).save(scriptTemplate);

    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1Template.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data: QuestionTemplateData = response.body.questionTemplate;
    expect(data.discardedAt).toBe(discardedAt.toJSON());
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
      parentName: q2Template.name
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

describe("GET /question_templates/:id/mark_question", () => {
  let question: Question;
  beforeEach(async () => {
    const allocation = new Allocation(q1Template, fixtures.marker);
    const script = new Script(
      fixtures.paper,
      "A0185892L.pdf",
      "A0185892L",
      fixtures.student
    );
    question = new Question(script, q1aTemplate);
    await getRepository(Allocation).save(allocation);
    await getRepository(Script).save(script);
    await getRepository(Question).save(question);
  });

  it("should allow an allocated Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow allocation inheritance", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow an unallocated Marker to access this route even if he is the owner", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return QuestionData", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.question as QuestionData;
    expect(isQuestionData(data)).toEqual(true);
  });

  it("should allow the same Marker to get the same Question", async () => {
    const student = (await fixtures.createPaperUser(PaperUserRole.Student))
      .paperUser;
    const script = new Script(
      fixtures.paper,
      "A1234567L.pdf",
      "A1234567L",
      student
    );
    const question = new Question(script, q1aTemplate);

    await getRepository(Script).save(script);
    await getRepository(Question).save(question);

    const first = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(first.status).toEqual(200);
    const firstData = first.body.question as QuestionData;

    const second = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(second.status).toEqual(200);
    const secondData = second.body.question as QuestionData;

    expect(firstData.id).toEqual(secondData.id);
  });

  it("should not allow another marker to get the same question within 30 minutes", async () => {
    const student = (await fixtures.createPaperUser(PaperUserRole.Student))
      .paperUser;
    const script = new Script(
      fixtures.paper,
      "A1234567L.pdf",
      "A1234567L",
      student
    );
    const question = new Question(script, q1aTemplate);

    const otherMarker = await fixtures.createPaperUser(PaperUserRole.Marker);
    const allocation = new Allocation(q1aTemplate, otherMarker.paperUser);

    await getRepository(Script).save(script);
    await getRepository(Question).save(question);
    await getRepository(PaperUser).save(otherMarker.paperUser);
    await getRepository(Allocation).save(allocation);

    const first = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(first.status).toEqual(200);
    const firstData = first.body.question as QuestionData;

    const second = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", otherMarker.accessToken)
      .send();
    expect(second.status).toEqual(200);
    const secondData = second.body.question as QuestionData;

    expect(firstData.id).not.toEqual(secondData.id);
  });

  it("should allow another marker to get the same question after 30 minutes", async () => {
    const student = (await fixtures.createPaperUser(PaperUserRole.Student))
      .paperUser;
    const script = new Script(
      fixtures.paper,
      "A1234567.pdf",
      "A1234567",
      student
    );
    const question = new Question(script, q1aTemplate);

    const otherMarker = await fixtures.createPaperUser(PaperUserRole.Marker);
    const allocation = new Allocation(q1aTemplate, otherMarker.paperUser);

    await getRepository(Script).save(script);
    await getRepository(Question).save(question);
    await getRepository(PaperUser).save(otherMarker.paperUser);
    await getRepository(Allocation).save(allocation);

    const first = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(first.status).toEqual(200);
    const firstData = first.body.question as QuestionData;

    question.currentMarkerUpdatedAt = addMinutes(
      new Date(firstData.currentMarkerUpdatedAt!),
      -31
    );
    await getRepository(Question).save(question);

    const second = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", otherMarker.accessToken)
      .send();
    expect(second.status).toEqual(200);
    const secondData = second.body.question as QuestionData;

    expect(firstData.id).toEqual(secondData.id);
  });

  it("should not return a question with a mark", async () => {
    const mark = new Mark(question, fixtures.marker, q1aTemplate.score! - 1);
    await getRepository(Mark).save(mark);

    const response = await request(server.server)
      .get(`${fixtures.api}/question_templates/${q1aTemplate.id}/mark_question`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(204);
  });
});
