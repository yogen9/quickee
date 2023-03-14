import React from "react";
import CommandBar from "../CommandBar";

const App = () => {
  const quickeeShadowRoot = document
    .getElementById("quickee-root")
    .shadowRoot.getElementById("quickee-shadow-root");

  return <CommandBar container={quickeeShadowRoot} />;
};

export default App;
