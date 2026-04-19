import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    app: "{{PROJECT_NAME}}",
    framework: "express",
    db: "{{DB}}",
    message: "Hello from Polystack!",
  });
});

app.listen(port, () => {
  console.log(`{{PROJECT_NAME}} listening on http://localhost:${port}`);
});
