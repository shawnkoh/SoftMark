import * as request from "supertest";
import { ApiServer } from "../../server";
import {
  synchronize,
  loadFixtures,
  getToken,
  getPasswordlessToken,
  getAuthorizationToken
} from "../../utils/tests";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { getRepository } from "typeorm";
import { QuestionTemplate } from "../../entities/QuestionTemplate";

let server: ApiServer;
let ownerAccessToken: string;
let markerAccessToken: string;
let studentAccessToken: string;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
  await synchronize(server);
  await loadFixtures(server);
  ownerAccessToken = (await getToken(server, "owner@u.nus.edu", "setMeUp?"))
    .accessToken;
  markerAccessToken = (await getToken(server, "marker@u.nus.edu", "setMeUp?"))
    .accessToken;
  studentAccessToken = await getStudentAccessToken();

  const scriptTemplate = new ScriptTemplate();
  scriptTemplate.paperId = 1;

  const questionTemplates: QuestionTemplate[] = [];
  let questionTemplate = new QuestionTemplate();
  questionTemplate.scriptTemplate = scriptTemplate;
  questionTemplate.name = "1a";
  questionTemplate.marks = 2;
  questionTemplates.push(questionTemplate);

  questionTemplate = new QuestionTemplate();
  questionTemplate.scriptTemplate = scriptTemplate;
  questionTemplate.name = "1b";
  questionTemplate.marks = 3;
  questionTemplates.push(questionTemplate);

  questionTemplate = new QuestionTemplate();
  questionTemplate.scriptTemplate = scriptTemplate;
  questionTemplate.name = "2";
  questionTemplate.marks = 6;
  questionTemplates.push(questionTemplate);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(questionTemplates);
});

afterAll(async () => {
  await server.close();
});

const getStudentAccessToken = async () => {
  const authorizationToken = await getAuthorizationToken(
    server,
    "student@u.nus.edu"
  );
  const { accessToken } = await getPasswordlessToken(
    server,
    authorizationToken
  );
  return accessToken;
};

describe("PATCH script_templates/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("DELETE script_templates/:id", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .delete("/v1/script_templates/1")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .delete("/v1/script_templates/1")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .delete("/v1/script_templates/1")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });
});

describe("PATCH script_templates/:id/undiscard", () => {
  it("should allow a user to access this route if he is the Owner of the paper", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1/undiscard")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Marker to access this route", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1/undiscard")
      .set("Authorization", `Bearer ${markerAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Student to access this route", async () => {
    const response = await request(server.server)
      .patch("/v1/script_templates/1/undiscard")
      .set("Authorization", `Bearer ${studentAccessToken}`)
      .send();
    expect(response.status).toEqual(404);
  });
});
