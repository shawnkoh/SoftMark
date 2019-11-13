import request from "supertest";
import { getRepository } from "typeorm";

import { PageTemplate } from "../../entities/PageTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { ApiServer } from "../../server";
import { isPageTemplateData } from "../../types/pageTemplates";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let scriptTemplate: ScriptTemplate;
let page1: PageTemplate;
let page2: PageTemplate;
let page3: PageTemplate;
let q1: QuestionTemplate;
let q1a: QuestionTemplate;
let q1b: QuestionTemplate;
let q2: QuestionTemplate;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
  page1 = new PageTemplate(scriptTemplate, "page1", 1);
  page2 = new PageTemplate(scriptTemplate, "page2", 2);
  page3 = new PageTemplate(scriptTemplate, "page3", 3);
  q1 = new QuestionTemplate(scriptTemplate, "1", null);
  q1a = new QuestionTemplate(
    scriptTemplate,
    "1a",
    1.5,
    "1, 2, 3",
    1,
    100,
    100,
    q1
  );
  q1b = new QuestionTemplate(
    scriptTemplate,
    "1b",
    1.5,
    "1, 2, 3",
    1,
    200,
    200,
    q1
  );
  q2 = new QuestionTemplate(scriptTemplate, "2", 6);

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
