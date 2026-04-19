import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) =>
  c.json({
    app: "{{PROJECT_NAME}}",
    framework: "hono",
    db: "{{DB}}",
    message: "Hello from Polystack!",
  })
);

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port });
console.log(`{{PROJECT_NAME}} running on http://localhost:${port}`);
