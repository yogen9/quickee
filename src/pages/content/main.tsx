import { createRoot } from "react-dom/client";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import App from "./components/App";

refreshOnUpdate("pages/content/components/App");

const root = document.createElement("div");
root.id = "quickee-root";
document.body.append(root);

createRoot(root).render(<App />);
