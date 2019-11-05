import faker from "faker";
faker.seed(127);
import supertest from "supertest";
import { getRepository } from "typeorm";

import { User } from "../entities/User";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import ApiServer from "../server";
import { PaperUserRole } from "../types/paperUsers";
import { ScriptPostData } from "../types/scripts";
import { ScriptTemplatePostData } from "../types/scriptTemplates";
import { PageTemplate } from "../entities/PageTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";

export async function synchronize(apiServer: ApiServer) {
  if (!apiServer.connection) {
    throw new Error("Connection failed to initialise");
  }
  await apiServer.connection.synchronize(true);
}

export class Fixtures {
  // Other
  faker: Faker.FakerStatic;
  api = "/v1";

  // Instantiated
  public paper: Paper;
  public owner: PaperUser;
  public ownerAccessToken: string;
  public marker: PaperUser;
  public markerAccessToken: string;
  public student: PaperUser;
  public studentAccessToken: string;

  // Not instantiated
  public scriptTemplatePostData: ScriptTemplatePostData;
  public scriptPostData: ScriptPostData;

  public createScriptTemplate: (paper: Paper) => ScriptTemplate;
  public createPageTemplate: (
    scriptTemplate: ScriptTemplate
  ) => Promise<PageTemplate>;

  constructor(
    paper: Paper,
    owner: PaperUser,
    marker: PaperUser,
    student: PaperUser
  ) {
    this.faker = faker;
    this.paper = paper;
    this.owner = owner;
    this.ownerAccessToken =
      "Bearer " + owner.user!.createAuthenticationTokens().accessToken;
    this.marker = marker;
    this.markerAccessToken =
      "Bearer " + marker.user!.createAuthenticationTokens().accessToken;
    this.student = student;
    this.studentAccessToken =
      "Bearer " + student.user!.createAuthenticationTokens().accessToken;

    this.scriptTemplatePostData = { imageUrls: ["abc", "def"] };

    this.createScriptTemplate = (paper: Paper = this.paper) => {
      return new ScriptTemplate(paper);
    };

    this.createPageTemplate = async (scriptTemplate: ScriptTemplate) => {
      const count = await getRepository(ScriptTemplate).count(scriptTemplate);
      const imageUrl = "abc"; // TODO
      return new PageTemplate(scriptTemplate, imageUrl, count + 1);
    };

    // TODO: Mock imageUrls correctly
    this.scriptPostData = {
      filename: "A0185892L.pdf",
      sha256: "stub",
      imageUrls: ["page1ImageStub", "page2ImageStub", "page3ImageStub"]
    };
  }

  public async createPaperUser(role: PaperUserRole, paper?: Paper) {
    const user = new User(faker.internet.email());
    const paperUser = new PaperUser(paper || this.paper, user, role);
    await getRepository(User).save(user);
    await getRepository(PaperUser).save(paperUser);
    const accessToken =
      "Bearer " + user.createAuthenticationTokens().accessToken;
    return { paperUser, accessToken };
  }
}

export async function loadFixtures(apiServer: ApiServer): Promise<Fixtures> {
  const paper = new Paper("CS1010 Midterms");

  const paperUsers: PaperUser[] = [];
  const users: User[] = [];

  const owner = new PaperUser(
    paper,
    new User("owner@u.nus.edu", "setMeUp?"),
    PaperUserRole.Owner
  );
  users.push(owner.user!);
  paperUsers.push(owner);
  const marker = new PaperUser(
    paper,
    new User("marker@u.nus.edu", "setMeUp?"),
    PaperUserRole.Marker
  );
  users.push(marker.user!);
  paperUsers.push(marker);

  const student = new PaperUser(
    paper,
    new User("student@u.nus.edu"),
    PaperUserRole.Student
  );
  users.push(student.user!);
  paperUsers.push(student);

  await getRepository(User).save(users);
  await getRepository(Paper).save(paper);
  await getRepository(PaperUser).save(paperUsers);

  return new Fixtures(paper, owner, marker, student);
}

export async function getToken(
  server: ApiServer,
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const encoded = Buffer.from(`${email}:${password}`).toString("base64");
  const response = await supertest(server.server)
    .post("/v1/auth/token")
    .set("Authorization", `Basic ${encoded}`)
    .send();
  return response.body;
}

export async function getAuthorizationToken(
  server: ApiServer,
  email: string
): Promise<string> {
  const response = await supertest(server.server)
    .post("/v1/auth/passwordless")
    .send({ email });
  if (response.status !== 201) {
    throw new Error("Mock getAuthorizationToken failed");
  }
  const user = await getRepository(User).findOneOrFail({ email });
  return user.createAuthorizationToken();
}

export async function getPasswordlessToken(
  server: ApiServer,
  authorizationToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await supertest(server.server)
    .post("/v1/auth/token")
    .set("Authorization", `Bearer ${authorizationToken}`)
    .send();
  return response.body;
}
