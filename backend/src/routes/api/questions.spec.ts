import request from "supertest";
import { getRepository } from "typeorm";
import { Allocation } from "../../entities/Allocation";
import { Mark } from "../../entities/Mark";
import { PaperUser } from "../../entities/PaperUser";
import { Question } from "../../entities/Question";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { User } from "../../entities/User";
import { ApiServer } from "../../server";
import { isMarkData, MarkData, MarkPutData } from "../../types/marks";
import { PaperUserRole } from "../../types/paperUsers";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

let scriptTemplate: ScriptTemplate;
let q1Template: QuestionTemplate;
let q2Template: QuestionTemplate;
let q2aTemplate: QuestionTemplate;
let q1Allocation: Allocation;
let q2Allocation: Allocation;
let script: Script;
let q1: Question;
let q2: Question;
let q2a: Question;
beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);

  scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
  q1Template = new QuestionTemplate(scriptTemplate, "1", 10);
  q2Template = new QuestionTemplate(scriptTemplate, "2", null);
  q2aTemplate = new QuestionTemplate(
    scriptTemplate,
    "2a",
    7,
    "1, 2, 3",
    1,
    100,
    100,
    q2Template
  );
  q1Allocation = new Allocation(q1Template, fixtures.marker);
  q2Allocation = new Allocation(q2Template, fixtures.marker);

  script = new Script(
    fixtures.paper,
    "A0185892L.pdf",
    "stub",
    fixtures.student
  );
  q1 = new Question(script, q1Template);
  q2 = new Question(script, q2Template);
  q2a = new Question(script, q2aTemplate);

  await getRepository(ScriptTemplate).save(scriptTemplate);
  await getRepository(QuestionTemplate).save(q1Template);
  await getRepository(QuestionTemplate).save(q2Template);
  await getRepository(QuestionTemplate).save(q2aTemplate);
  await getRepository(Allocation).save(q1Allocation);
  await getRepository(Allocation).save(q2Allocation);
  await getRepository(Script).save(script);
  await getRepository(Question).save(q1);
  await getRepository(Question).save(q2);
  await getRepository(Question).save(q2a);
});

afterAll(async () => {
  await server.close();
});

describe("PUT /questions/:id/mark", () => {
  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow an allocated PaperUser to access this route", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow anyone who is not an allocated PaperUser to access this route", async () => {
    const { accessToken } = await fixtures.createPaperUser(
      PaperUserRole.Marker
    );
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", accessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return MarkData", async () => {
    const putData: MarkPutData = {
      score: q1Template.score! - 1
    };
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(putData);
    expect(response.status).toEqual(200);
    const data: MarkData = response.body.mark;
    expect(isMarkData(data)).toBe(true);
  });

  it("should not allow a score to be greater than the Question Template's score", async () => {
    const putData: MarkPutData = {
      score: q1Template.score! + 0.5
    };
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(putData);
    expect(response.status).toEqual(400);
  });

  it("should not allow a Mark to be created for a question without a score", async () => {
    const putData: MarkPutData = {
      score: 7
    };
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q2.id}/mark`)
      .set("Authorization", fixtures.markerAccessToken)
      .send(putData);
    expect(response.status).toEqual(400);
  });

  it("should allow allocation inheritance", async () => {
    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q2a.id}/mark`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should replace only the requester's mark", async () => {
    const mark = new Mark(q1, fixtures.marker, 10);
    const otherMarker = new PaperUser(
      fixtures.paper,
      new User("marker2@gmail.com"),
      PaperUserRole.Marker
    );
    const allocation = new Allocation(q1Template, otherMarker);
    await getRepository(Mark).save(mark);
    await getRepository(User).save(otherMarker.user!);
    await getRepository(PaperUser).save(otherMarker);
    await getRepository(Allocation).save(allocation);

    const accessToken =
      "Bearer " + otherMarker.user!.createAuthenticationTokens().accessToken;
    const putData: MarkPutData = {
      score: 5
    };

    const response = await request(server.server)
      .put(`${fixtures.api}/questions/${q1.id}/mark`)
      .set("Authorization", accessToken)
      .send(putData);
    expect(response.status).toEqual(200);
    const data: MarkData = response.body.mark;
    expect(data.id).not.toEqual(mark.id);
  });
});
