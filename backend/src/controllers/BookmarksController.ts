import { Request, Response } from "express";

export async function create(request: Request, response: Response) {
  try {
    // response.status(201).json({ bookmark: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

// hard delete
export async function destroy(request: Request, response: Response) {
  try {
  } catch (error) {
    response.sendStatus(400);
  }

  try {
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
