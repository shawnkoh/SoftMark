import request from "supertest";
import { getRepository } from "typeorm";

import { Allocation } from "../../entities/Allocation";
import { Mark } from "../../entities/Mark";
import { Question } from "../../entities/Question";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import { MarkPatchData, MarkData, isMarkData } from "../../types/marks";
import { PaperUserRole } from "../../types/paperUsers";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let scriptTemplate: ScriptTemplate;
let q1Template: QuestionTemplate;
let q2Template: QuestionTemplate;
let q2aTemplate: QuestionTemplate;
let q1Allocation: Allocation;
let q2Allocation: Allocation;
let script: Script;
let q1: Question;
let q2: Question;
let q2a: Question;

let q1Mark: Mark;
let q2aMark: Mark;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
  q1Template = new QuestionTemplate(scriptTemplate, "1", 10);
  q2Template = new QuestionTemplate(scriptTemplate, "2", null);
  q2aTemplate = new QuestionTemplate(scriptTemplate, "2a", 7, q2Template);
  q1Allocation = new Allocation(q1Template, fixtures.marker);
  q2Allocation = new Allocation(q2Template, fixtures.marker);

  script = new Script(
    fixtures.paper,
    "A0185892L.pdf",
    "stub",
    fixtures.student
  );
  q1 = new Question(script, q1Template);
  q2 = new Question(script, q2Template);
  q2a = new Question(script, q2aTemplate);

  q1Mark = new Mark(q1, fixtures.marker, 5);
  q2aMark = new Mark(q2a, fixtures.marker, 5);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(q1Template);
  await getRepository(QuestionTemplate).save(q2Template);
  await getRepository(QuestionTemplate).save(q2aTemplate);
  await getRepository(Allocation).save(q1Allocation);
  await getRepository(Allocation).save(q2Allocation);
  await getRepository(Script).save(script);
  await getRepository(Question).save(q1);
  await getRepository(Question).save(q2);
  await getRepository(Question).save(q2a);
  await getRepository(Mark).save(q1Mark);
  await getRepository(Mark).save(q2aMark);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH /marks/:id", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow an allocated PaperUser to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow anyone who is not an allocated PaperUser to access this route", async () => {
    const markerAccessToken = (await fixtures.createPaperUser(
      PaperUserRole.Marker
    )).accessToken;

    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return MarkData", async () => {
    const patchData: MarkPatchData = {
      score: q1Template.score! - 1
    };
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data: MarkData = response.body.mark;
    expect(isMarkData(data)).toBe(true);
  });

  it("should not allow a score to be greater than the Question Template's score", async () => {
    const patchData: MarkPatchData = {
      score: q1Template.score! + 0.5
    };
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(400);
  });

  it("should allow allocation inheritance", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q2aMark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });
});

describe("DELETE /marks/:id", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow an allocated PaperUser to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow anyone who is not an allocated PaperUser to access this route", async () => {
    const markerAccessToken = (await fixtures.createPaperUser(
      PaperUserRole.Marker
    )).accessToken;

    const response = await request(server.server)
      .delete(`${fixtures.api}/marks/${q1Mark.id}`)
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow allocation inheritance", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/marks/${q2aMark.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });
});

describe("PATCH /marks/:id/undiscard", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow anyone who is not an allocated PaperUser to access this route", async () => {
    const markerAccessToken = (await fixtures.createPaperUser(
      PaperUserRole.Marker
    )).accessToken;

    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}/undiscard`)
      .set("Authorization", markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow an allocated PaperUser to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow allocation inheritance", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q2aMark.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should return MarkData", async () => {
    const patchData: MarkPatchData = {
      score: q1Template.score! - 1
    };
    const response = await request(server.server)
      .patch(`${fixtures.api}/marks/${q1Mark.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data: MarkData = response.body.mark;
    expect(isMarkData(data)).toBe(true);
  });
});
