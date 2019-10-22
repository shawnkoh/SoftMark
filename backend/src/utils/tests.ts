import ApiServer from "../server";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";
import { hashSync } from "bcryptjs";
import supertest = require("supertest");

export async function synchronize(apiServer: ApiServer) {
  if (!apiServer.connection) {
    throw new Error("Connection failed to initialise");
  }
  await apiServer.connection.synchronize(true);
}

export async function loadFixtures(apiServer: ApiServer) {
  const paper = new Paper();
  paper.name = "CS1010 Midterms";

  const users: User[] = [];

  const owner = new User();
  owner.email = "owner@u.nus.edu";
  owner.password = hashSync("setMeUp?");
  users.push(owner);

  const marker = new User();
  marker.email = "marker@u.nus.edu";
  marker.password = hashSync("setMeUp?");
  users.push(marker);

  const student = new User();
  student.email = "student@u.nus.edu";
  users.push(student);

  const paperUsers: PaperUser[] = [];
  let paperUser = new PaperUser();
  paperUser.paper = paper;
  paperUser.user = owner;
  paperUser.role = PaperUserRole.Owner;
  paperUsers.push(paperUser);

  paperUser = new PaperUser();
  paperUser.paper = paper;
  paperUser.user = marker;
  paperUser.role = PaperUserRole.Marker;
  paperUsers.push(paperUser);

  paperUser = new PaperUser();
  paperUser.paper = paper;
  paperUser.user = student;
  paperUser.role = PaperUserRole.Student;
  paperUsers.push(paperUser);

  await getRepository(User).insert(users);
  await getRepository(Paper).insert(paper);
  await getRepository(PaperUser).insert(paperUsers);
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
