import express from "express";
import { createServer, type Server } from "http";
import { Config } from "./config";
import { ErrorMiddleware } from "./api/middleware/error.middleware";
import { Router } from "express";
import { RegisterRoutes } from "./api/generated/routes/routes";
import swagger from "./api/generated/spec/swagger.json";
import swaggerUi from "swagger-ui-express";
import { Database } from "./db";

export class App {
  private app!: express.Application;
  private server!: Server;
  private database!: Database;

  constructor(private config: Config) {
    this.app = express();
    this.server = createServer(this.app);
    this.database = new Database(this.config);
    this.attachRoutes();
  }

  async start() {
    try {
      await this.database.start();
      await this.startServer();
    } catch (error) {
      console.log("Failed to start application", error);
      await this.stop();
    }
  }

  async startServer() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.server.on("error", (error) => {
          console.log("Server error", error);
          reject(error);
        });
        this.server.listen(this.config.SERVER_PORT, () => {
          console.log(`Server running on port ${this.config.SERVER_PORT}`);
          resolve();
        });
      } catch (error) {
        console.log("Failed starting server", error);
        reject(error)
      }
    });
  }

  async attachRoutes() {

    // Ativa página swagger em /api/docs
    this.app
      .use("/api/swagger.json", (req, res) => res.json(swagger))
      .use("/api/docs", swaggerUi.serve, swaggerUi.setup(swagger, {
        explorer: false,
        customSiteTitle: "Viva Unimed API Docs",
        swaggerOptions: {
          defaultModelsExpandDepth: -1,
          layout: "StandaloneLayout",
        },
      }));

    this.app
      .use(express.json())
      .use(express.urlencoded({ extended: true }));

    // Registra rotas geradas pelo tsoa
    const api = Router();
    RegisterRoutes(api);
    this.app.use(api);

    this.app.use(ErrorMiddleware)
  }

  async stop() {
    console.log("Stopping server...");
    this.server.close();
  }
}
