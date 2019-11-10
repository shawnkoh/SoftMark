import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import ormconfig from "../ormconfig";
import routes from "./routes";

export class ApiServer {
  public connection: Connection | null = null;
  public server: Server | null = null;

  async initialize(port: number = 3001) {
    this.connection = await createConnection(ormconfig);

    const app = express();
    app.use(bodyParser.json({ limit: "20mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors());
    app.use(helmet());
    if (process.env.NODE_ENV !== "test") {
      console.log(`Express server has started on port ${port}.`);
      app.use(morgan("dev"));
    }
    app.use("/", routes);

    this.server = app.listen(port);
  }

  async close() {
    this.connection && (await this.connection.close());
    this.server && this.server.close();
  }
}

export default ApiServer;
