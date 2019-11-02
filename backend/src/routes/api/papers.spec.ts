import request from "supertest";
import { getRepository, getManager } from "typeorm";

import { Allocation } from "../../entities/Allocation";
import { PaperUser } from "../../entities/PaperUser";
import { Question } from "../../entities/Question";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { User } from "../../entities/User";
import { isScriptTemplateData } from "../../types/scriptTemplates";
import { ApiServer } from "../../server";
import { PaperUserRole } from "../../types/paperUsers";
import { ScriptListData, isScriptData, ScriptData } from "../../types/scripts";
import { synchronize, loadFixtures, Fixtures } from "../../utils/tests";
import {
  isAllocationListData,
  AllocationListData
} from "../../types/allocations";

let server: ApiServer;
let fixtures: Fixtures;
beforeAll(async () => {
  server = new ApiServer();
  await server.initialize();
});

beforeEach(async () => {
  await synchronize(server);
  fixtures = await loadFixtures(server);
});

afterAll(async () => {
  await server.close();
});

describe("POST /papers/:id/users", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const validResponse = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(validResponse.status).not.toEqual(404);

    const rejectResponse = await request(server.server)
      .post(`${fixtures.api}/papers/2/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(rejectResponse.status).toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should allow a Paper's Owner to create another Owner", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "owner2@u.nus.edu",
        role: PaperUserRole.Owner
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Marker", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "marker2@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(response.status).toEqual(201);
  });

  it("should allow a Paper's Owner to create another Student", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "student2@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(response.status).toEqual(201);
  });

  it("should not allow creating a duplicate PaperUser", async () => {
    const markerResponse = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Marker
      });
    expect(markerResponse.status).toEqual(201);

    const studentResponse = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/users`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send({
        email: "duplicate@u.nus.edu",
        role: PaperUserRole.Student
      });
    expect(studentResponse.status).toEqual(400);
  });

  // it("should create a new user if email does not exist", async () => {});
});

describe("POST /papers/:id/script_templates", () => {
  // Roles
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  // Constraints
  it("should return ScriptTemplateData", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(response.status).toEqual(201);
    expect(isScriptTemplateData(response.body.scriptTemplate)).toBe(true);
  });

  it("should not allow a second Script Template", async () => {
    const first = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(first.status).toEqual(201);

    const second = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(second.status).toEqual(400);
  });
});

describe("GET /papers/:id/script_templates/active", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(
        `${fixtures.api}/papers/${fixtures.paper.id}/script_templates/active`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(
        `${fixtures.api}/papers/${fixtures.paper.id}/script_templates/active`
      )
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(
        `${fixtures.api}/papers/${fixtures.paper.id}/script_templates/active`
      )
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should return ScriptTemplateData", async () => {
    const scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
    await getRepository(ScriptTemplate).save(scriptTemplate);

    const response = await request(server.server)
      .get(
        `${fixtures.api}/papers/${fixtures.paper.id}/script_templates/active`
      )
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    expect(isScriptTemplateData(response.body.scriptTemplate)).toBe(true);
  });
});

describe("POST /papers/:id/scripts", () => {
  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return ScriptData", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptPostData);
    expect(response.status).toEqual(201);
    const data: ScriptData = response.body.script;
    expect(isScriptData(data)).toBe(true);
  });

  it("should create Questions based on the ScriptTemplate", async () => {
    const scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
    const q1 = new QuestionTemplate(scriptTemplate, "1", 7);
    const q2 = new QuestionTemplate(scriptTemplate, "2", null);
    const q2a = new QuestionTemplate(scriptTemplate, "2a", 3, q2);
    const q2b = new QuestionTemplate(scriptTemplate, "2b", 2, q2);

    await getRepository(ScriptTemplate).save(scriptTemplate);
    await getRepository(QuestionTemplate).save([q1, q2, q2a, q2b]);

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptPostData);
    expect(response.status).toEqual(201);
    const data: ScriptData = response.body.script;
    expect(isScriptData(data)).toBe(true);
    const count = await getRepository(Question).count({ scriptId: data.id });
    expect(count).toBe(4);
  });
});

describe("GET /papers/:id/scripts", () => {
  beforeEach(async () => {
    const student = new PaperUser(
      fixtures.paper,
      new User(fixtures.faker.internet.email()),
      PaperUserRole.Student
    );
    const scripts = [
      new Script(
        fixtures.paper,
        "A0185892L.pdf",
        "A0185892L",
        fixtures.student
      ),
      new Script(fixtures.paper, "A0123456L.pdf", "A0123456L", student)
    ];
    await getRepository(User).save(student.user!);
    await getRepository(PaperUser).save(student);
    await getRepository(Script).save(scripts);
  });

  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Owner to view all its scripts", async () => {
    const count = await getRepository(Script).count({
      where: { paper: fixtures.paper }
    });
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.scripts as ScriptListData[];
    expect(data.length).toEqual(count);
  });

  it("should allow a Paper's Marker to view all its scripts", async () => {
    const count = await getRepository(Script).count({
      where: { paper: fixtures.paper }
    });
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.scripts as ScriptListData[];
    expect(data.length).toEqual(count);
  });

  it("should restrict a Paper's Student to only view his scripts", async () => {
    const count = await getRepository(Script).count({
      where: { paper: fixtures.paper, student: fixtures.student }
    });
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/scripts`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.scripts as ScriptListData[];
    expect(data.length).toEqual(count);
  });
});

describe("GET /papers/:id/allocations", () => {
  beforeEach(async () => {
    const scriptTemplate = new ScriptTemplate(fixtures.paper, "sha256");
    const q1Template = new QuestionTemplate(scriptTemplate, "1", 5);
    const q2Template = new QuestionTemplate(scriptTemplate, "2", null);
    const q2aTemplate = new QuestionTemplate(scriptTemplate, "2a", 5);
    const q2bTemplate = new QuestionTemplate(scriptTemplate, "2b", 5);
    const q1Allocation = new Allocation(q1Template, fixtures.marker);
    const q2Allocation = new Allocation(q2Template, fixtures.marker);
    await getManager().transaction(async manager => {
      await manager.save(scriptTemplate);
      await manager.save([q1Template, q2Template, q2aTemplate, q2bTemplate]);
      await manager.save([q1Allocation, q2Allocation]);
    });
  });

  it("should allow a Paper's Owner to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/allocations`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should allow a Paper's Marker to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/allocations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).not.toEqual(404);
  });

  it("should not allow a Paper's Student to access this route", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/allocations`)
      .set("Authorization", fixtures.studentAccessToken)
      .send();
    expect(response.status).toEqual(404);
  });

  it("should return AllocationListData[]", async () => {
    const response = await request(server.server)
      .get(`${fixtures.api}/papers/${fixtures.paper.id}/allocations`)
      .set("Authorization", fixtures.markerAccessToken)
      .send();
    expect(response.status).toEqual(200);
    const data = response.body.allocations as AllocationListData[];
    expect(data.every(allocation => isAllocationListData(allocation))).toBe(
      true
    );
  });
});
