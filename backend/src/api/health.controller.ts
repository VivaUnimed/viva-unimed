import { Controller, Route, Get, Tags } from "tsoa";

@Route("/api")
@Tags("Health")
export class HealthController extends Controller {

  @Get("/health")
  async health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
