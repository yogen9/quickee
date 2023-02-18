import {
  ActionImpl,
  createAction,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
  useRegisterActions,
} from "kbar";
import React, { useState, useMemo, useEffect } from "react";
import "@pages/content/components/CommandBar/index.css";
import "@pages/content/style.css";

export default function CommandBar(props) {
  const actions = [
    {
      id: "new-tab",
      name: "New Tab",
      shortcut: ["n"],
      keywords: "new-tab",
      section: "Shortcuts",
      perform: () => navigator.clipboard.writeText(window.location.href),
    },
    {
      id: "duplicate-tab",
      name: "Duplicate Tab",
      shortcut: ["d"],
      keywords: "duplicate-tab",
      section: "Shortcuts",
      perform: () => navigator.clipboard.writeText(window.location.href),
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator className="bg-white text-slate-600 shadow-2xl max-w-xl w-full rounded-lg overflow-hidden hide-scroll-bar">
            <KBarSearch
              placeholder="Type a command or search…"
              className="bg-white text-slate-600 w-full px-4 py-3 box-border border-none outline-none"
            />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>

      {props.children}
    </KBarProvider>
  );
}

function RenderResults() {
  const { results } = useMatches();

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

  const actions = useMemo(() => {
    return tabs.map((tab) => {
      return createAction({
        name: tab.title,
        keywords: tab.title,
        perform: () => window.open(tab.url),
        icon: (
          <img
            className="inline-block h-5 w-5 rounded-full ring-1 ring-white"
            src={tab.favIconUrl}
            alt=""
          />
        ),
      });
    });
  }, [tabs]);

  useRegisterActions(actions, [actions]);

  useEffect(() => {
    fetchAllOpenedTabs();
  }, []);

  const fetchAllOpenedTabs = async () => {
    try {
      const tabs = await chrome.runtime.sendMessage({ type: "GET_ALL_TABS" });
      setTabs(tabs);
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: "$command",
            }}
          >
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
}

const ResultItem = React.forwardRef(
  ({ action, active }: { action: ActionImpl; active: boolean }, ref: any) => {
    return (
      <div ref={ref} style={getResultStyle(active)}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {action.icon && action.icon}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>{action.name}</span>
          </div>
        </div>
        {action.shortcut?.length ? (
          <div
            aria-hidden
            style={{ display: "grid", gridAutoFlow: "column", gap: "4px" }}
          >
            {action.shortcut.map((shortcut) => (
              <kbd
                style={{
                  background: "rgba(255, 255, 255, .1)",
                  color: "$secondary",
                  padding: "4px 8px",
                  textTransform: "uppercase",
                }}
                key={shortcut}
              >
                {shortcut}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

const iconStyle = {
  fontSize: "20px",
  position: "relative",
  top: "-2px",
};

const getResultStyle = (active) => {
  return {
    padding: "12px 16px",
    background: active ? "rgba(255, 255, 255, 0.1)" : "$command",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 0,
    cursor: "pointer",
    color: active ? "$primary" : "$secondary",
  };
};
