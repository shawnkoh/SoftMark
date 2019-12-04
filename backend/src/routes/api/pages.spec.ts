import request from "supertest";
import { getRepository } from "typeorm";
import { Page } from "../../entities/Page";
import { Script } from "../../entities/Script";
import { ApiServer } from "../../server";
import {
  AnnotationLine,
  AnnotationPostData,
  isAnnotationData
} from "../../types/annotations";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

const exampleAnnotation: AnnotationLine[] = [
  {
    color: "#ff0000",
    points: [],
    type: "source-over",
    width: 5
  }
];

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

  script = new Script(
    fixtures.paper,
    "A0185892L.pdf",
    "stub",
    fixtures.student
  );
  // TODO: Mock imageStub properly
  page = new Page(script, "imageStub", 1);

  await getRepository(Script).save(script);
  await getRepository(Page).save(page);
});

afterAll(async () => {
  await server.close();
});

describe("PUT /pages/:id/annotations", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return AnnotationData", async () => {
    // TODO: Mock layer properly
    const postData: AnnotationPostData = {
      layer: exampleAnnotation
    };
    const response = await request(server.server)
      .put(`${fixtures.api}/pages/${page.id}/annotations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(postData);
    expect(response.status).toEqual(201);
    const data = response.body.annotation;
    expect(isAnnotationData(data)).toBe(true);
  });
});
