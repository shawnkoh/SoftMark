import * as request from "supertest";
import { getRepository } from "typeorm";

import { PageTemplate } from "../../entities/PageTemplate";
import { PageQuestionTemplate } from "../../entities/PageQuestionTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import {
  isPageQuestionTemplateData,
  PageQuestionTemplatePatchData,
  PageQuestionTemplateData
} from "../../types/pageQuestionTemplates";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
const scriptTemplate = new ScriptTemplate();
scriptTemplate.paperId = 1;
const page1 = new PageTemplate(scriptTemplate);
const page2 = new PageTemplate(scriptTemplate);
const page3 = new PageTemplate(scriptTemplate);
const q1 = new QuestionTemplate(scriptTemplate, "1", null);
const q1a = new QuestionTemplate(scriptTemplate, "1a", 1.5, q1);
const q1b = new QuestionTemplate(scriptTemplate, "1b", 1.5, q1);
const q2 = new QuestionTemplate(scriptTemplate, "2", 6);
const pageQuestionTemplate = new PageQuestionTemplate();
pageQuestionTemplate.pageTemplate = page1;
pageQuestionTemplate.questionTemplate = q1;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(PageTemplate).save(page1);
  await getRepository(PageTemplate).save(page2);
  await getRepository(PageTemplate).save(page3);
  await getRepository(QuestionTemplate).save(q1);
  await getRepository(QuestionTemplate).save(q1a);
  await getRepository(QuestionTemplate).save(q1b);
  await getRepository(QuestionTemplate).save(q2);
  await getRepository(PageQuestionTemplate).save(pageQuestionTemplate);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH /page_question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should update and return PageQuestionTemplateData", async () => {
    const patchData: PageQuestionTemplatePatchData = {
      pageTemplateId: page2.id,
      questionTemplateId: q2.id
    };
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data = response.body.pageQuestionTemplate;
    expect(isPageQuestionTemplateData(data)).toBe(true);
    expect(data).toMatchObject(patchData);
  });
});

describe("DELETE /page_question_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);

    // Reset pageQuestionTemplate.discardedAt so that other tests can continue
    await getRepository(PageQuestionTemplate).update(pageQuestionTemplate.id, {
      discardedAt: null
    });
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should discard the PageQuestionTemplate", async () => {
    const response = await request(server.server)
      .delete(`/v1/page_question_templates/${pageQuestionTemplate.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
    const entity = await getRepository(PageQuestionTemplate).findOneOrFail(
      pageQuestionTemplate.id
    );
    expect(entity.discardedAt).not.toBe(null);
  });
});

describe("PATCH /page_question_templates/:id/undiscard", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);

    // Reset pageQuestionTemplate.discardedAt so that other tests can continue
    await getRepository(PageQuestionTemplate).update(pageQuestionTemplate.id, {
      discardedAt: new Date()
    });
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}/undiscard`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}/undiscard`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return an undiscarded PageQuestionTemplateData", async () => {
    const response = await request(server.server)
      .patch(`/v1/page_question_templates/${pageQuestionTemplate.id}/undiscard`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data: PageQuestionTemplateData = response.body.pageQuestionTemplate;
    expect(isPageQuestionTemplateData(data)).toBe(true);
    expect(data.discardedAt).toBe(null);
  });
});
