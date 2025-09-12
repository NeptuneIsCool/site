const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const wurl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`;

async function setTransport() {
  await connection.setTransport("/epoxy/index.mjs", [{ wisp: wurl }]);
}
setTransport();

const { ScramjetController } = $scramjetLoadController();
const cramjet = new ScramjetController({
  prefix: "/scramjet/",
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
  },
});

try {
  if (navigator.serviceWorker) {
    cramjet.init();
    navigator.serviceWorker.register("./sw.js");
  } else {
    console.warn("Service workers not supported");
  }
} catch (error) {
  console.error("Service worker registration failed:", error);
}

function search(input) {
  const template = "https://search.brave.com/search?q=%s";
  try {
    return new URL(input).toString();
  } catch (err) {}
  try {
    const url = new URL(`http://${input}`);
    return url.hostname.includes(".")
      ? url.toString()
      : template.replace("%s", encodeURIComponent(input));
  } catch (err) {}
  return template.replace("%s", encodeURIComponent(input));
}

const form = document.getElementById("idk");
/** @type {HTMLInputElement} */
const input = document.getElementById("url");
const overlay = document.getElementById("overlay");
const navbar = document.querySelector(".nav");

let frame = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const surl = input.value.trim();
  if (!surl) return;

  const final = search(surl);

  if (!frame) {
    frame = document.createElement("iframe");
    overlay.appendChild(frame);
  }

  const navHeight = navbar.offsetHeight;
  frame.style.marginTop = navHeight + "px";
  frame.style.height = `calc(100% - ${navHeight}px)`;

  const toHide = document.querySelectorAll(".search-bar, .logo-wrap");
  toHide.forEach((el) => (el.style.display = "none"));

  overlay.style.display = "block";
  navbar.classList.add("nav-small");
  document.body.classList.add("nav-small-active");

  frame.src = cramjet.encodeUrl(final);
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    form.dispatchEvent(new Event("submit"));
  }
});
