import React, { createRef, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

type ReactShadowRootProps = {
  mode: "open" | "closed";
  delegatesFocus?: boolean;
  declarative?: boolean;
  stylesheets?: CSSStyleSheet[];
  children?: React.ReactNode;
};

const ReactShadowRoot: React.FC<ReactShadowRootProps> = ({
  children,
  mode = "open",
  stylesheets,
  declarative = false,
  delegatesFocus = false,
}) => {
  const shadowRoot = useRef(null);
  const placeholder = createRef();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    //  @ts-ignore
    shadowRoot.current = placeholder.current.parentNode.attachShadow({
      delegatesFocus,
      mode,
    });

    if (stylesheets) {
      shadowRoot.current.adoptedStyleSheets = stylesheets;
    }

    setInitialized(true);
  }, []);

  if (!initialized) {
    if (declarative) {
      return (
        // @ts-ignore
        <template ref={placeholder} shadowroot={mode}>
          {children}
        </template>
      );
    }

    // @ts-ignore
    return <span ref={placeholder}></span>;
  }

  return ReactDOM.createPortal(children, shadowRoot.current);
};

export default ReactShadowRoot;
