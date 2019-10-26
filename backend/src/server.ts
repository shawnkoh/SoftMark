import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import { Server } from "http";
import * as morgan from "morgan";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import routes from "./routes";
import ormconfig from "../ormconfig";

export class ApiServer {
  public connection: Connection | null = null;
  public server: Server | null = null;

  async initialize() {
    this.connection = await createConnection(ormconfig);

    const app = express();
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cors());
    app.use(helmet());
    app.use(morgan("dev"));
    app.use("/", routes);

    this.server = app.listen(3000);

    console.log(
      "Express server has started on port 3000. Open http://localhost:3000/users to see results"
    );
  }

  async close() {
    this.connection && (await this.connection.close());
    this.server && this.server.close();
  }
}

export default ApiServer;
