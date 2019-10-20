import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { PaperUser } from "../entities/PaperUser";

export async function create(request: Request, response: Response) {}

export async function index(request: Request, response: Response) {}

export async function show(request: Request, response: Response) {}

export async function discard(request: Request, response: Response) {}

export async function undiscard(request: Request, response: Response) {}
