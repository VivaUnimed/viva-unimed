import express from "express";
import { createServer, type Server } from "http";
import { Config } from "./config";
import { ErrorMiddleware } from "./api/middleware/error.middleware";
import { Router } from "express";
import { RegisterRoutes } from "./api/generated/routes/routes";
import swagger from "./api/generated/spec/swagger.json";
import swaggerUi from "swagger-ui-express";
import { Database } from "./db";
import service from "./service";
import { JwtMiddleware } from "./api/middleware/jwt.middleware";
import cookieParser from "cookie-parser";
import { AppointmentMatchJob } from './jobs';

export class App {
  private app!: express.Application;
  private server!: Server;
  private database!: Database;
  private appointmentMatchJob: AppointmentMatchJob;

  /** Inicializa as instâncias básicas, configura o segredo do JWT e registra o roteamento */
  constructor(private config: Config) {
    this.app = express();
    this.server = createServer(this.app);
    this.database = new Database(this.config);
    service.auth.setSecret(this.config.JWT_SECRET);
    this.attachRoutes();
  }
  /** Orquestra a inicialização da conexão com o banco e o levantamento do servidor HTTP */
  async start() {
    try {
      await this.database.start();
      await this.startServer();
      await this.startJobs();
      await this.assertAdmin();
    } catch (error) {
      console.log("Failed to start application", error);
      await this.stop();
    }
  }

  async assertAdmin() {
    if(this.config.DEFAULT_ADMIN_EMAIL && this.config.DEFAULT_ADMIN_PASSWORD) {
      await service.user.assertAdminUser(
        this.config.DEFAULT_ADMIN_EMAIL,
        this.config.DEFAULT_ADMIN_PASSWORD,
      )
    }
  }

  async startJobs() {
    this.appointmentMatchJob = new AppointmentMatchJob({
      cron: this.config.APPOINTMENT_JOB_CRON,
    });
    this.appointmentMatchJob.start();
  }

  /** Inicia a escuta de requisições na porta configurada e trata erros de boot do servidor */
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
  /** Configura middlewares (Swagger, JSON, Cookies, Auth), rotas do TSOA e tratamento de erros */
  async attachRoutes() {

    // Configura a documentação interativa da API via Swagger UI
    console.log(`API Swagger: http://localhost:${this.config.SERVER_PORT}/api/docs`)
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

    // Middlewares para parsing de corpo de requisição (JSON e URL encoded)
    this.app
      .use(express.json())
      .use(express.urlencoded({ extended: true }));

    // Configuração de cookies e middleware global de validação de token JWT
    this.app
      .use(cookieParser())
      .use(JwtMiddleware);

    // Acopla as rotas auto-geradas pelo TSOA ao roteador do Express
    const api = Router();
    RegisterRoutes(api);
    this.app.use(api);
    // Middleware final para captura e formatação centralizada de erros
    this.app.use(ErrorMiddleware)
  }
  /** Finaliza o servidor HTTP */
  async stop() {
    console.log("Stopping server...");
    this.server.close();
  }
}
