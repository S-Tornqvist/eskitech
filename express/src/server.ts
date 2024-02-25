import express, { Express, Request, Response, Router } from "express";
import { rssFromCsv } from "./rss";

if (!process.env.PRODUCTS_CSV) {
  console.error("error: env PRODUCTS_CSV is unset");
  process.exit(1);
}

if (!process.env.STATIC_PATH) {
  console.error("error: env STATIC_PATH is unset");
  process.exit(1);
}

const CSV_PATH = process.env.PRODUCTS_CSV;
const STATIC_PATH = process.env.STATIC_PATH;
const PORT = process.env.PORT ?? 3000;

const app: Express = express();
const api = express.Router();

app.use("*", (req, _, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

api.use("/rss", rssFromCsv(CSV_PATH));

api.use("*", (req, res) => {
  res.sendStatus(404);
});

app.use("/api", api);

app.get("*", express.static(STATIC_PATH));

app.listen(PORT, () => {
  console.log(`[Server]: I am running at https://localhost:${PORT}`);
});
