import request from "supertest";
import { getManager, getRepository } from "typeorm";
import { Allocation } from "../../entities/Allocation";
import { PaperUser } from "../../entities/PaperUser";
import { Question } from "../../entities/Question";
import { QuestionTemplate } from "../../entities/QuestionTemplate";
import { Script } from "../../entities/Script";
import { ScriptTemplate } from "../../entities/ScriptTemplate";
import { User } from "../../entities/User";
import { ApiServer } from "../../server";
import {
  AllocationListData,
  isAllocationListData
} from "../../types/allocations";
import { PaperUserRole } from "../../types/paperUsers";
import { isScriptData, ScriptData, ScriptListData } from "../../types/scripts";
import {
  isScriptTemplateData,
  ScriptTemplatePostData
} from "../../types/scriptTemplates";
import { Fixtures, loadFixtures, synchronize } from "../../utils/tests";

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

  it("should return ScriptTemplateData", async () => {
    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(response.status).toEqual(201);
    expect(isScriptTemplateData(response.body.scriptTemplate)).toBe(true);
  });

  it("should create a new Script Template when there is none", async () => {
    const count = await getRepository(ScriptTemplate).count({
      paper: fixtures.paper
    });
    expect(count).toBe(0);

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(response.status).toEqual(201);
  });

  it("should discard the active Script Template and restore the existing Script Template when an existing one is uploaded", async () => {
    let existingScriptTemplate = new ScriptTemplate(fixtures.paper, "script1");
    existingScriptTemplate.discardedAt = new Date();
    let activeScriptTemplate = new ScriptTemplate(fixtures.paper, "script2");
    await getRepository(ScriptTemplate).save([
      existingScriptTemplate,
      activeScriptTemplate
    ]);

    const postData: ScriptTemplatePostData = {
      imageUrls: ["page1", "page2"],
      sha256: "script1"
    };

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(200);

    existingScriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      existingScriptTemplate.id
    );
    activeScriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      activeScriptTemplate.id
    );
    expect(existingScriptTemplate.discardedAt).toBe(null);
    expect(activeScriptTemplate.discardedAt).not.toBe(null);
  });

  it("should restore an existing Script Template when there are no active Script Templates and an existing Script Template was uploaded", async () => {
    const scriptTemplate = new ScriptTemplate(fixtures.paper, "script1");
    scriptTemplate.discardedAt = new Date();
    await getRepository(ScriptTemplate).save(scriptTemplate);
    const postData: ScriptTemplatePostData = {
      imageUrls: ["page1", "page2"],
      sha256: "script1"
    };

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(200);
  });

  it("should discard the existing Script Template and create a new one when a new Script Template is uploaded", async () => {
    let existingScriptTemplate = new ScriptTemplate(fixtures.paper, "script1");
    await getRepository(ScriptTemplate).save(existingScriptTemplate);

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(fixtures.scriptTemplatePostData);
    expect(response.status).toEqual(201);

    existingScriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      existingScriptTemplate.id
    );
    expect(existingScriptTemplate.discardedAt).not.toBe(null);
  });

  it("should not do anything if the user uploads the same Script Template as the active one", async () => {
    let existingScriptTemplate = new ScriptTemplate(fixtures.paper, "script1");
    await getRepository(ScriptTemplate).save(existingScriptTemplate);

    const postData: ScriptTemplatePostData = {
      imageUrls: ["page1", "page2", "page3"],
      sha256: "script1"
    };

    const response = await request(server.server)
      .post(`${fixtures.api}/papers/${fixtures.paper.id}/script_templates`)
      .set("Authorization", fixtures.ownerAccessToken)
      .send(postData);
    expect(response.status).toEqual(204);

    existingScriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      existingScriptTemplate.id
    );
    expect(existingScriptTemplate.discardedAt).toBe(null);
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
    const q2a = new QuestionTemplate(
      scriptTemplate,
      "2a",
      3,
      "1, 2, 3",
      1,
      100,
      100,
      q2
    );
    const q2b = new QuestionTemplate(
      scriptTemplate,
      "2b",
      2,
      "1, 2, 3",
      1,
      200,
      200,
      q2
    );

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
    // Only 2 leaves
    expect(count).toBe(2);
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
