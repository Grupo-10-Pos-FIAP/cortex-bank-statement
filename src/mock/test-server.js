import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import middleware from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const dbPath = path.join(__dirname, "db.json");
const routesPath = path.join(__dirname, "routes.json");
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(middleware);

const routes = jsonServer.rewriter(JSON.parse(readFileSync(routesPath, "utf8")));
server.use(routes);

server.use(router);

const PORT = process.env.MOCK_PORT || 8080;

server.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`✅ Mock Server (JSON Server v0.17.4) is running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("📋 Endpoints available:");
  console.log("   GET /account");
  console.log("   GET /account/:accountId/balance");
  console.log("   GET /account/:accountId/statement");
  console.log("   GET /account/:accountId/statement?startDate=...&endDate=...");
  console.log("   GET /transactions");
  console.log("   GET /accounts");
  console.log("=".repeat(50));
  console.log("💡 Tip: Use 'npm run start:mock' to start both mock server and frontend");
  console.log("=".repeat(50));
});
