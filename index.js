import express from "express";
import { createServer } from "node:http";
import { hostname } from "node:os";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { createBareServer } from "@tomphttp/bare-server-node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import wisp from "wisp-server-node";

const bare = createBareServer("/bare/");
const app = express();

app.use(express.static("public"));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/libcurl/", express.static(libcurlPath));
app.use("/bareasmodule/", express.static(bareModulePath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/scram/", express.static("scramjet"));

app.get("/list", async (req, res) => {
  const url = new URL(req.originalUrl, "http://localhost");
  const path = url.pathname;
  if (path === "/list" || path.startsWith("/list/")) {
    try {
      const listRequest = new Request("https://list-6ln.pages.dev" + path.slice(5) + url.search, { method: req.method, headers: req.headers });
      const response = await fetch(listRequest);
      const text = await response.text();
      const rewritten = text
        .replaceAll("https://storage.classroomsarecool.mex.com/images/", "/images/")
        .replaceAll("https://storage.classroomsarecool.mex.com/", "/storage/")
        .replaceAll("iframe?url=", "iframe#url=");
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(response.status).send(rewritten);
    } catch (e) {
      res.status(500).send("List server error: " + e.message);
    }
  } else {
    res.status(404).send("Not Found");
  }
});

const server = createServer();

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else app(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else socket.end();
});

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

server.on("listening", () => {
  const address = server.address();
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(`\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close();
  bare.close();
  process.exit(0);
}

server.listen({ port });
