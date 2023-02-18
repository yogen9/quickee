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

const CommandBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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
        <KBarPositioner className="z-50">
          <KBarAnimator className="bg-white text-slate-600 shadow-2xl max-w-xl w-full rounded-lg overflow-hidden hide-scroll-bar">
            <KBarSearch
              placeholder="Type a command or search…"
              className="bg-white text-black w-full px-4 py-3 box-border border-none outline-none"
            />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};

export default CommandBar;

const RenderResults: React.FC = () => {
  const { results } = useMatches();

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

  const actions = useMemo(() => {
    return tabs.map((tab) => {
      return createAction({
        name: tab.title,
        subtitle: tab.url,
        keywords: tab.title,
        section: "Opened Tabs",
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
      console.error({ error });
    }
  };

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider ">
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
};

const ResultItem = React.forwardRef(
  ({ action, active }: { action: ActionImpl; active: boolean }, ref: any) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between cursor-pointer px-4 py-3 border-l-2 ${
          active
            ? "bg-slate-200 border-black"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex gap-2 items-center">
          {action.icon && action.icon}
          <div className="flex flex-col text-ellipsis">
            <span>{action.name}</span>
          </div>
        </div>

        {active && action.subtitle && (
          <span className="text-xs text-gray-400 text-ellipsis">
            {action.subtitle}
          </span>
        )}

        {action.shortcut?.length ? (
          <div aria-hidden className="grid gap-1 items-center grid-flow-col">
            {action.shortcut.map((shortcut) => (
              <kbd
                className="bg-slate-200 text-black rounded-sm uppercase"
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
