import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 3000;

app.get("*", (req: Request, res: Response) => {
  res.send("Hello, this is Express + TypeScript");
  console.log(req.method, req.url);
});

app.listen(port, () => {
  console.log(`[Server]: I am running at https://localhost:${port}`);
});
