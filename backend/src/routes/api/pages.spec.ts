import * as request from "supertest";
import { getRepository } from "typeorm";

import { Page } from "../../entities/Page";
import { Script } from "../../entities/Script";
import { ApiServer } from "../../server";
import { isAnnotationData, AnnotationPostData } from "../../types/annotations";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let script: Script;
let page: Page;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  script = new Script(fixtures.paper, fixtures.student);
  page = new Page(script);

  await getRepository(Script).save(script);
  await getRepository(Page).save(page);
});

afterAll(async () => {
  await server.close();
});

describe("POST /pages/:id/annotations", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`/v1/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return AnnotationData", async () => {
    // TODO: Mock layer properly
    const postData: AnnotationPostData = {
      layer: JSON.stringify({
        stub: "temp"
      })
    };
    const response = await request(server.server)
      .post(`/v1/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    const data = response.body.annotation;
    expect(isAnnotationData(data)).toBe(true);
  });
});
