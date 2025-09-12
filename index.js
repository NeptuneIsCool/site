import { createServer } from "node:http";
import { hostname } from "node:os";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import express from "express";
import wisp from "wisp-server-node";

const app = express();

app.use(express.static("public"));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/scram/", express.static("scram"));

app.get("/list", async (req, res) => {
	const url = new URL(req.originalUrl, "http://localhost");
	const path = url.pathname;
	if (path === "/list" || path.startsWith("/list/")) {
		try {
			const listRequest = new Request(
				"https://list-6ln.pages.dev" + path.slice(5) + url.search,
				{ method: req.method, headers: req.headers }
			);
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

const server = createServer(app);

server.on("upgrade", (req, socket, head) => {
	if (req.url.endsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
	} else {
		socket.end();
	}
});

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

server.listen(port, () => {
	console.log("Listening on:");
	console.log(`\thttp://localhost:${port}`);
	console.log(`\thttp://${hostname()}:${port}`);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	server.close(() => process.exit(0));
}
