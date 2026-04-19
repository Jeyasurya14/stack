#!/usr/bin/env node
import { run } from "../src/main.js";

run(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
