import * as request from "supertest";
import { getRepository } from "typeorm";

import { PageQuestionTemplate } from "../../entities/PageQuestionTemplate";
import { PageTemplate } from "../../entities/PageTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import {
  PageQuestionTemplatePostData,
  isPageQuestionTemplateData
} from "../../types/pageQuestionTemplates";
import { QuestionTemplatePostData } from "../../types/questionTemplates";
import {
  isScriptTemplateData,
  ScriptTemplatePatchData
} from "../../types/scriptTemplates";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
let scriptTemplate: ScriptTemplate;

beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate(fixtures.paper);
  await getRepository(ScriptTemplate).save(scriptTemplate);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH /script_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return ScriptTemplateData", async () => {
    const patchData: ScriptTemplatePatchData = {
      name: "abc"
    };
    const response = await request(server.server)
      .patch(`${fixtures.api}/script_templates/${scriptTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    expect(isScriptTemplateData(response.body.scriptTemplate)).toBe(true);
  });
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
      score: null
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
      score: 5
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
      score: 2
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
  });
});

describe("POST /script_templates/:id/page_question_templates", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/page_question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/page_question_templates`
      )
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/page_question_templates`
      )
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return PageQuestionTemplateData", async () => {
    const page1 = new PageTemplate(scriptTemplate);
    const q1 = new QuestionTemplate(scriptTemplate, "1", 5);
    await getRepository(PageTemplate).save(page1);
    await getRepository(QuestionTemplate).save(q1);

    const postData: PageQuestionTemplatePostData = {
      pageTemplateId: page1.id,
      questionTemplateId: q1.id
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/page_question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    expect(isPageQuestionTemplateData(response.body.pageQuestionTemplate)).toBe(
      true
    );
  });

  it("should not allow duplicate PageQuestionTemplates", async () => {
    const page1 = new PageTemplate(scriptTemplate);
    const q1 = new QuestionTemplate(scriptTemplate, "1", 5);
    await getRepository(PageTemplate).save(page1);
    await getRepository(QuestionTemplate).save(q1);
    const pageQuestionTemplate = new PageQuestionTemplate(page1, q1);
    await getRepository(PageQuestionTemplate).save(pageQuestionTemplate);

    const postData: PageQuestionTemplatePostData = {
      pageTemplateId: page1.id,
      questionTemplateId: q1.id
    };
    const response = await request(server.server)
      .post(
        `${fixtures.api}/script_templates/${scriptTemplate.id}/page_question_templates`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(400);
  });
});
