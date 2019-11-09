import faker from "faker";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import ApiServer from "../server";
import { PaperUserRole } from "../types/paperUsers";
import { ScriptPostData } from "../types/scripts";
import { ScriptTemplatePostData } from "../types/scriptTemplates";
faker.seed(127);

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

    this.scriptTemplatePostData = {
      sha256: "stub",
      imageUrls: ["abc", "def"]
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
