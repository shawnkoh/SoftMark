import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import ormconfig from "../ormconfig";
import routes from "./routes";
const Sentry = require("@sentry/node");

const corsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === "production" ? /.*softmark\.io.*/ : "*"
};

export class ApiServer {
  public connection: Connection | null = null;
  public server: Server | null = null;

  async initialize(port: number = 3001) {
    this.connection = await createConnection(ormconfig);

    const app = express();
    Sentry.init({
      dsn: "https://5b635a518aa84ef592e783e2436ad7f4@sentry.io/1832519"
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(bodyParser.json({ limit: "20mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors(corsOptions));
    app.use(helmet());
    if (process.env.NODE_ENV !== "test") {
      console.log(`Express server has started on port ${port}.`);
      app.use(morgan("dev"));
    }
    app.use("/", routes);
    app.use(Sentry.Handlers.errorHandler());

    this.server = app.listen(port);
    this.server.timeout = 1200000;
  }

  async close() {
    this.connection && (await this.connection.close());
    this.server && this.server.close();
  }
}

export default ApiServer;
