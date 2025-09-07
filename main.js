function cloak() {
  localStorage.setItem("aboutblankEnabled", "true");

  const popup = window.open("about:blank", "_blank");
  if (!popup) {
    return;
  }

  const popupDoc = popup.document;
  const iframe = popupDoc.createElement("iframe");

  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    border: "none",
    margin: "0",
    padding: "0",
    overflow: "hidden"
  });

  iframe.src = window.location.href;
  popupDoc.body.style.margin = "0";
  popupDoc.body.appendChild(iframe);

  window.location.replace("https://classroom.google.com/");
}

cloak();
//ffeefwefwfwe rewergerg
