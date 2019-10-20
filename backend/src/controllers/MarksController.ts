import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedPaperUser } from "../utils/papers";

export async function create(request: Request, response: Response) {}

export async function update(request: Request, response: Response) {}

export async function discard(request: Request, response: Response) {}

export async function undiscard(request: Request, response: Response) {}