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
import { Duplicate, Create, Thunder, Close } from "@assets/icons";

type CommandBarProps = {
  children?: React.ReactNode;
  container?: HTMLElement;
};

const CommandBar: React.FC<CommandBarProps> = ({ children, container }) => {
  const actions = [
    {
      id: "optimize-tab",
      name: "Optimize",
      keywords: "optimize-tab",
      section: "Shortcuts",
      icon: <Thunder />,
      perform: () => {
        chrome.runtime.sendMessage({
          type: "OPTIMIZE_TAB",
        });
      },
    },
    {
      id: "new-tab",
      name: "New Tab",
      icon: <Create />,
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
      icon: <Duplicate />,
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
      <KBarPortal container={container}>
        <KBarPositioner className="z-[130] backdrop-blur-sm">
          <KBarAnimator className="bg-white text-slate-600 max-w-[600px] w-full rounded-lg overflow-hidden hide-scroll-bar shadow-[0px_6px_20px_rgba(0,0,0,20%)]">
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
      return {
        ...createAction({
          name: tab.title,
          subtitle: tab.url,
          keywords: tab.title,
          section: "Opened Tabs",
          perform: () => openSelectedTab(tab.id),
          icon: (
            <img
              className="inline-block h-5 w-5 rounded-full ring-1 ring-white"
              src={tab.favIconUrl}
              alt=""
            />
          ),
        }),
        tabId: tab.id,
      };
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

  const closeTab = async (tabId: number) => {
    try {
      await chrome.runtime.sendMessage({
        type: "CLOSE_TAB",
        payload: { tabId },
      });
      setTabs((tabs) => tabs.filter((tab) => tab.id !== tabId));
    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider ">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item as any}
            active={active}
            closeTab={closeTab}
          />
        )
      }
    />
  );
};

type ResultItemProps = {
  action: ActionImpl & { tabId: number };
  active: boolean;
  closeTab: (tabId: number) => void;
};

const ResultItem = React.forwardRef(
  ({ action, active, closeTab }: ResultItemProps, ref: any) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-1 justify-between cursor-pointer px-4 py-3 border-l-2 ${
          active
            ? "bg-slate-200 border-black"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex gap-2 items-center">
          <>
            {action.icon && action.icon}
            <div className="flex flex-col truncate">
              <span>{action.name}</span>
            </div>
          </>
        </div>

        <div className={`flex items-center justify-end gap-1`}>
          {active && action.subtitle && (
            <span className="text-xs text-gray-400 truncate">
              {action.subtitle}
            </span>
          )}

          {action.shortcut?.length && (
            <div
              aria-hidden
              className="grid gap-1 items-center grid-flow-col p-0.5"
            >
              {action.shortcut.map((shortcut) => (
                <kbd
                  className="bg-slate-200 text-black rounded-sm uppercase"
                  key={shortcut}
                >
                  {shortcut}
                </kbd>
              ))}
            </div>
          )}

          {active && action.section !== "Shortcuts" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(action.tabId);
              }}
            >
              <Close className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    );
  }
);
