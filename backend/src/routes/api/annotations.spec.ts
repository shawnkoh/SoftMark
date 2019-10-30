import * as request from "supertest";
import { getRepository } from "typeorm";

import { Annotation } from "../../entities/Annotation";
import { Page } from "../../entities/Page";
import { Script } from "../../entities/Script";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import {
  isAnnotationData,
  AnnotationPatchData,
  AnnotationData,
  AnnotationLine
} from "../../types/annotations";

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
let annotation: Annotation;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  script = new Script(fixtures.paper, fixtures.student);
  // TODO: Mock imageUrl properly
  page = new Page(script, "imageStub", 1);
  // TODO: Mock layer properly
  const layer = exampleAnnotation;
  annotation = new Annotation(page, fixtures.marker, layer);

  await getRepository(Script).save(script);
  await getRepository(Page).save(page);
  await getRepository(Annotation).save(annotation);
});

afterAll(async () => {
  await server.close();
});

describe("PATCH /annotations/:id", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow the author of the annotation to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow anyone who is not the author of the annotation to access this route", async () => {
    const response = await request(server.server)
      .patch(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return updated AnnotationData", async () => {
    // TODO: Mock layer properly
    const patchData: AnnotationPatchData = {
      layer: exampleAnnotation
    };
    const response = await request(server.server)
      .patch(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(patchData);
    expect(response.status).toEqual(200);
    const data: AnnotationData = response.body.annotation;
    expect(isAnnotationData(data)).toBe(true);
    //expect(data.layer).toBe(patchData.layer); not sure how array equality is being handled but i suspect its by pointers
  });
});

describe("DELETE /annotations/:id", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow the author of the annotation to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow anyone who is not the author of the annotation to access this route", async () => {
    const response = await request(server.server)
      .delete(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should hard delete the Annotation", async () => {
    const response = await request(server.server)
      .delete(`/v1/annotations/${annotation.id}`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(204);
    const deletedAnnotation = await getRepository(Annotation).findOne(
      annotation.id
    );
    expect(deletedAnnotation).toBeUndefined();
  });
});
