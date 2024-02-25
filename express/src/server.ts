import express, { Express, Request, Response, Router } from "express";
import { rss } from "./rss";

const app: Express = express();
const api = express.Router();
const port = 3000;
const STATIC_PATH = process.env.STATIC_PATH || "/dev/null";
// TODO: read static path from env
// TODO: create pm2 ecosystem config file

app.use("*", (req, _, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

api.use("/rss", rss);

api.use("*", (req, res) => {
  res.sendStatus(404);
});

app.use("/api", api);

app.get("*", express.static('public'));

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
