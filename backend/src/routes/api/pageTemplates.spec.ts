import request from "supertest";
import { getRepository } from "typeorm";

import { PageTemplate } from "../../entities/PageTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { isPageTemplateData } from "../../types/pageTemplates";

let server: ApiServer;
let fixtures: Fixtures;
const scriptTemplate = new ScriptTemplate(1);
let page1: PageTemplate;
let page2: PageTemplate;
let page3: PageTemplate;
const q1 = new QuestionTemplate(scriptTemplate, "1", null);
const q1a = new QuestionTemplate(scriptTemplate, "1a", 1.5, q1);
const q1b = new QuestionTemplate(scriptTemplate, "1b", 1.5, q1);
const q2 = new QuestionTemplate(scriptTemplate, "2", 6);
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  fixtures = await loadFixtures(server);

  page1 = await fixtures.createPageTemplate(scriptTemplate);
  page2 = await fixtures.createPageTemplate(scriptTemplate);
  page3 = await fixtures.createPageTemplate(scriptTemplate);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(PageTemplate).save([page1, page2, page3]);
  await getRepository(QuestionTemplate).save([q1, q1a, q1b, q2]);
});

afterAll(async () => {
  await server.close();
});

describe("GET /page_templates/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/page_templates/${q1.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/page_templates/${q1.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/page_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should return PageTemplateData", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/page_templates/${q1.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(200);
    expect(isPageTemplateData(response.body.pageTemplate)).toBe(true);
  });
});
