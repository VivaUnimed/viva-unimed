import { App } from "./app";
import { Config } from "./config";

async function main() {
  const config = Config.fromEnv();
  const app = new App(config);

  const onShudown = async () => {
    console.log("Shutting down server...");
    await app.stop();
    console.log("Bye 👋");
    process.exit(0);
  }

  process.on("SIGTERM", onShudown)
  process.on("SIGINT", onShudown)
  await app.start();
}

main();
