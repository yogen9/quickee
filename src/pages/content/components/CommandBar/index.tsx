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

const CommandBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const actions = [
    {
      id: "new-tab",
      name: "New Tab",
      shortcut: ["n"],
      keywords: "new-tab",
      section: "Shortcuts",
      perform: () => {
        chrome.runtime.sendMessage({
          type: "NEW_TAB",
        });
      },
    },
    {
      id: "duplicate-tab",
      name: "Duplicate Tab",
      shortcut: ["d"],
      keywords: "duplicate-tab",
      section: "Shortcuts",
      perform: () => {
        chrome.runtime.sendMessage({
          type: "DUPLICATE_TAB",
        });
      },
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="z-50 backdrop-blur-sm">
          <KBarAnimator className="bg-white text-slate-600 max-w-[600px] w-full rounded-[8px] overflow-hidden hide-scroll-bar shadow-[0px_6px_20px_rgba(0,0,0,20%)]">
            <KBarSearch
              placeholder="Type a command or search…"
              className="bg-white text-black w-full px-[16px] py-[12px] box-border border-none outline-none"
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
        perform: () => openSelectedTab(tab.id),
        icon: (
          <img
            className="inline-block h-[20px] w-[20px] rounded-full ring-1 ring-white"
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

  const openSelectedTab = async (tabId: number) => {
    try {
      await chrome.runtime.sendMessage({
        type: "OPEN_TAB",
        payload: { tabId },
      });
    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-[16px] py-[12px] text-xs text-gray-400 uppercase tracking-wider ">
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
        className={`flex items-center gap-[4px] justify-between cursor-pointer px-[16px] py-[12px] border-l-2 ${
          active
            ? "bg-slate-200 border-black"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex gap-[8px] items-center">
          {action.icon && action.icon}
          <div className="flex flex-col truncate">
            <span>{action.name}</span>
          </div>
        </div>

        {active && action.subtitle && (
          <span className="text-xs text-gray-400 truncate">
            {action.subtitle}
          </span>
        )}

        {action.shortcut?.length ? (
          <div
            aria-hidden
            className="grid gap-[4px] items-center grid-flow-col"
          >
            {action.shortcut.map((shortcut) => (
              <kbd
                className="bg-slate-200 text-black rounded-[2px] uppercase"
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
