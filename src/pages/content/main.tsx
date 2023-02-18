import { createRoot } from "react-dom/client";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import App from "./components/App";
import "@assets/style/tailwind.css";
import "@pages/content/style.css";

refreshOnUpdate("pages/content/components/App");

const root = document.createElement("div");
root.id = "cmd-tabs-root";
document.body.append(root);

createRoot(root).render(<App />);
