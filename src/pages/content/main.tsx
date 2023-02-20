import { createRoot } from "react-dom/client";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import App from "./components/App";

import css from "@assets/style/tailwind.scss";

refreshOnUpdate("pages/content/components/App");

const root = document.createElement("div");
root.id = "quickee-root";
document.body.append(root);

const shadow = root.attachShadow({ mode: "open" });

const shadowDiv = document.createElement("div");
shadowDiv.id = "quickee-shadow-root";
shadowDiv.innerHTML = `<style>${css}</style>`;

shadow.append(shadowDiv);

createRoot(shadow).render(<App />);
