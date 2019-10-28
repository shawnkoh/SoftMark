import * as request from "supertest";
import { getRepository } from "typeorm";

import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import { Allocation } from "../../entities/Allocation";

let server: ApiServer;
let fixtures: Fixtures;
let scriptTemplate: ScriptTemplate;
let q1: QuestionTemplate;
let q1a: QuestionTemplate;
let q1b: QuestionTemplate;
let q2: QuestionTemplate;
let allocation: Allocation;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);
  scriptTemplate = new ScriptTemplate();
  scriptTemplate.paperId = 1;

  q1 = new QuestionTemplate(scriptTemplate, "1", null);
  q1a = new QuestionTemplate(scriptTemplate, "1a", 1.5, q1);
  q1b = new QuestionTemplate(scriptTemplate, "1b", 1.5, q1);
  q2 = new QuestionTemplate(scriptTemplate, "2", 6);

  allocation = new Allocation();
  allocation.paperUser = fixtures.marker;
  allocation.questionTemplate = q1;

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(q1);
  await getRepository(QuestionTemplate).save(q1a);
  await getRepository(QuestionTemplate).save(q1b);
  await getRepository(QuestionTemplate).save(q2);
  await getRepository(Allocation).save(allocation);
});

afterAll(async () => {
  await server.close();
});

describe("DELETE /allocations/:id", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/allocations/${allocation.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/allocations/${allocation.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/allocations/${allocation.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should delete the Allocation", async () => {
    const response = await request(server.server)
      .delete(`/v1/allocations/${allocation.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(204);
    const deletedAllocation = await getRepository(Allocation).findOne(
      allocation.id
    );
    expect(deletedAllocation).toBeUndefined();
  });
});
