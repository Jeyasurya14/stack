import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({
    app: "{{PROJECT_NAME}}",
    framework: "elysia",
    db: "{{DB}}",
    message: "Hello from Polystack!",
  }))
  .listen(Number(process.env.PORT) || 3000);

console.log(`{{PROJECT_NAME}} running on http://localhost:${app.server?.port}`);
