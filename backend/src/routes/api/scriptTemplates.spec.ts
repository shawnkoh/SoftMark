import request from "supertest";
import { getRepository } from "typeorm";
import { Paper } from "../../entities/Paper";
import { Question } from "../../entities/Question";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import { PaperUserRole } from "../../types/paperUsers";
import {
  isQuestionTemplateData,
  QuestionTemplateData,
  QuestionTemplatePostData
} from "../../types/questionTemplates";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

let server: ApiServer;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let fixtures: Fixtures;
let scriptTemplate: ScriptTemplate;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
  await getRepository(ScriptTemplate).save(scriptTemplate);
});

afterAll(async () => {
  await server.close();
});

describe("DELETE /script_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH /script_templates/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("POST /script_templates/:id/question_templates", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow creating a Question Template with no score and no parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "1",
      pageCovered: "1, 2, 3",
      score: null,
      topOffset: null,
      leftOffset: null
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });

  it("should allow creating a Question Template with a score and no parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "2",
      score: 5,
      topOffset: 50,
      leftOffset: 50
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });

  it("should allow creating a Question Template with a score and a parent", async () => {
    const postData: QuestionTemplatePostData = {
      name: "1a",
      score: 2,
      topOffset: 50,
      leftOffset: 50
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });

  it("should return QuestionTemplateData", async () => {
    const postData: QuestionTemplatePostData = {
      name: "1",
      score: 7,
      topOffset: 50,
      leftOffset: 50
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    const data: QuestionTemplateData = response.body.questionTemplate;
    expect(isQuestionTemplateData(data)).toBe(true);
  });

  it("should create a Question for all the existing Paper's Scripts", async () => {
    const paper1Scripts = [];
    for (let i = 1; i <= 5; i++) {
      const student = (await fixtures.createPaperUser(PaperUserRole.Student))
        .paperUser;
      const script = new Script(
        fixtures.paper,
        `SCRIPT${i}.pdf`,
        `SCRIPT${i}.pdf`,
        student
      );
      paper1Scripts.push(script);
    }
    const paper2 = new Paper("CS1010J");
    await getRepository(Paper).save(paper2);
    const paper2Scripts = [];
    for (let i = 6; i <= 10; i++) {
      const student = (await fixtures.createPaperUser(
        PaperUserRole.Student,
        paper2
      )).paperUser;
      const script = new Script(
        paper2,
        `SCRIPT${i}.pdf`,
        `SCRIPT${i}.pdf`,
        student
      );
      paper2Scripts.push(script);
    }
    await getRepository(Script).save(paper1Scripts.concat(paper2Scripts));

    const postData: QuestionTemplatePostData = {
      name: "1",
      score: 7,
      displayPage: 1,
      topOffset: 50,
      leftOffset: 50
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    const data: QuestionTemplateData = response.body.questionTemplate;

    const count = await getRepository(Question).count({
      questionTemplateId: data.id
    });

    expect(count).toBe(paper1Scripts.length);
  });
});
