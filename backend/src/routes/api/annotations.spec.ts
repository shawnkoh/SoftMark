import * as request from "supertest";
import { getRepository } from "typeorm";

import { Annotation } from "../../entities/Annotation";
import { Page } from "../../entities/Page";
import { Script } from "../../entities/Script";
import { ApiServer } from "../../server";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";

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
  page = new Page(script);
  // TODO: Mock layer properly
  const layer = JSON.stringify({ temp: "blah" });
  annotation = new Annotation(page, fixtures.marker, layer);

  await getRepository(Script).save(script);
  await getRepository(Page).save(page);
  await getRepository(Annotation).save(annotation);
});

afterAll(async () => {
  await server.close();
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
