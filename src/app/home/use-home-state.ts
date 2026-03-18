"use client";

import { useEffect, useRef, useState } from "react";
import {
  clamp,
  copyToClipboard,
  COUNTER_TARGETS,
  GLYPHS,
  pad,
  PROMPTS,
  randomHash,
  shuffleArray,
} from "./home-data";

type ProcessName = "fminer" | "rainbow" | "server";

type ProcessController = {
  name: ProcessName;
  stop: () => void;
};

export function useHomeState() {
  const [fartBalance, setFartBalance] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [uptime, setUptime] = useState("00:00:00");
  const [counterValues, setCounterValues] = useState([0, 0, 0]);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "> establishing uplink...",
    "> routing through shadow relays...",
    "> encrypting session keys...",
    "> ready.",
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [promptFilter, setPromptFilter] = useState("");
  const [promptOrder, setPromptOrder] = useState(PROMPTS.map((_, index) => index));
  const [displayedPrompts, setDisplayedPrompts] = useState(PROMPTS.map(() => "[SEALED ENTRY]"));
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const terminalOutputRef = useRef<HTMLPreElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const processRef = useRef<ProcessController | null>(null);
  const cleanupTimersRef = useRef<number[]>([]);

  const addTerminalLines = (...lines: string[]) => {
    setTerminalLines((current) => [...current, ...lines]);
  };

  const scheduleCleanup = (id: number) => {
    cleanupTimersRef.current.push(id);
  };

  const clearScheduledWork = () => {
    cleanupTimersRef.current.forEach((timerId) => {
      window.clearInterval(timerId);
      window.clearTimeout(timerId);
    });
    cleanupTimersRef.current = [];
  };

  useEffect(() => {
    const savedBalance = Number(window.localStorage.getItem("fartBalance") || "0");
    setFartBalance(savedBalance);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fartBalance", fartBalance.toString());
  }, [fartBalance]);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  useEffect(() => {
    const started = Date.now();
    const interval = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - started) / 1000);
      const hh = Math.floor(seconds / 3600);
      const mm = Math.floor((seconds % 3600) / 60);
      const ss = seconds % 60;
      setUptime(`${pad(hh)}:${pad(mm)}:${pad(ss)}`);
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    let frame = 0;
    const tick = (time: number) => {
      const progress = clamp((time - start) / duration, 0, 1);
      setCounterValues(COUNTER_TARGETS.map((target) => Math.round(target * progress)));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const now = performance.now();
    const items = PROMPTS.map((item) => ({ target: item.target, start: now + Math.random() * 900 }));
    const interval = window.setInterval(() => {
      const currentTime = performance.now();
      setDisplayedPrompts(
        items.map((item) => {
          const phase = clamp((currentTime - item.start) / 8200, 0, 1);
          const eased = phase * phase * (3 - 2 * phase);
          const reveal = Math.floor(eased * item.target.length);
          let output = "";

          for (let i = 0; i < item.target.length; i += 1) {
            const character = item.target[i];
            if (character === "\n") output += "\n";
            else if (i < reveal) output += character;
            else if (character === " ") output += Math.random() < 0.35 ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            else output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }

          if (phase >= 1) item.start = currentTime + 1200 + Math.random() * 900;
          return output;
        }),
      );
    }, 160);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalOutputRef.current?.scrollTo({ top: terminalOutputRef.current.scrollHeight });
  }, [terminalLines]);

  useEffect(() => {
    return () => {
      clearScheduledWork();
      document.body.classList.remove("trojan-chaos");
    };
  }, []);

  const filteredPromptIndexes = promptOrder.filter((index) => {
    const prompt = PROMPTS[index];
    const query = promptFilter.trim().toLowerCase();
    if (!query) return true;
    return prompt.title.toLowerCase().includes(query) || prompt.tags.join(",").toLowerCase().includes(query);
  });

  const handlePromptCopy = async (index: number) => {
    const ok = await copyToClipboard(PROMPTS[index].target);
    setCopiedPrompt(ok ? index : null);
    window.setTimeout(() => setCopiedPrompt(null), 900);
  };

  const stopActiveProcess = (showCancelled = true) => {
    processRef.current?.stop();
    processRef.current = null;
    clearScheduledWork();
    if (showCancelled) addTerminalLines("^C", "> operation cancelled by user.");
  };

  const startMiner = () => {
    addTerminalLines("> fminer v1.0.0 starting...", "> connecting to pool stratum+tcp://fart-pool.io:3333...");
    const startTimeout = window.setTimeout(() => {
      addTerminalLines("> connected.", "> authorized.", "> set difficulty: 128");
      scheduleCleanup(
        window.setInterval(() => {
          const hashrate = (20 + Math.random() * 5).toFixed(2);
          const temperature = Math.floor(65 + Math.random() * 10);
          const fan = Math.floor(40 + Math.random() * 20);
          addTerminalLines(
            Math.random() > 0.7
              ? `> [GPU0] Share accepted (${Math.floor(Math.random() * 100)}ms) diff: ${Math.floor(1000 + Math.random() * 5000)}`
              : `> [GPU0] ${hashrate} MH/s | T: ${temperature}C | Fan: ${fan}%`,
          );
        }, 1500),
      );
      scheduleCleanup(window.setInterval(() => setFartBalance((current) => current + (1 / 60) * 0.1), 100));
    }, 1000);

    scheduleCleanup(startTimeout);
    processRef.current = { name: "fminer", stop: () => addTerminalLines("> miner stopped.") };
  };

  const startRainbow = () => {
    addTerminalLines("> initiating rainbow table");
    const loadingInterval = window.setInterval(() => {
      setTerminalLines((current) => {
        const next = [...current];
        const last = next[next.length - 1] ?? "> initiating rainbow table";
        const dots = ((last.match(/\./g) ?? []).length + 1) % 5;
        next[next.length - 1] = `> initiating rainbow table${".".repeat(dots)}`;
        return next;
      });
    }, 500);
    scheduleCleanup(loadingInterval);

    const mainTimeout = window.setTimeout(() => {
      window.clearInterval(loadingInterval);
      addTerminalLines("> initiating rainbow table.... DONE", "> this can take several years. thank you for being patient.");
      const matches = [
        "5f4dcc3b5aa765d61d8327deb882cf00 : God",
        "0e339c631abcfbfb9d7c6aeeae1e7c89 : sex",
        "3f4dcc3b5aa765d61d8327deb882cf39 : love",
        "ej4dcc3b5aa765d61d8327deb882cf1u : cookie",
        "uf4dcc3b5aa765d61d8327deb882cfx0 : secret",
      ];
      let found = 0;
      const crackInterval = window.setInterval(() => {
        setTerminalLines((current) => {
          const next = [...current];
          if (next[next.length - 1]?.startsWith("> scanning:")) next[next.length - 1] = `> scanning: ${randomHash(32)}`;
          else next.push(`> scanning: ${randomHash(32)}`);
          return next;
        });
        if (found < matches.length && Math.random() > 0.75) addTerminalLines(`> match found: ${matches[found++]}`);
        if (found === matches.length) {
          window.clearInterval(crackInterval);
          addTerminalLines("> success: 5 of 5 hashes matched");
          processRef.current = null;
          clearScheduledWork();
        }
      }, 200);
      scheduleCleanup(crackInterval);
    }, 5000);

    scheduleCleanup(mainTimeout);
    processRef.current = { name: "rainbow", stop: () => undefined };
  };

  const startTrojan = () => {
    document.body.classList.add("trojan-chaos");
    addTerminalLines(
      "> executing server.exe...",
      "> listening on port 27374...",
      "> CONNECTED: 213.44.12.9",
      "> SubSeven 2.1 initialized.",
      "> SYSTEM_OVERRIDE: ENABLED.",
    );
    const timeout = window.setTimeout(() => {
      document.body.classList.remove("trojan-chaos");
      addTerminalLines("> connection lost.", "> system restoring...");
      processRef.current = null;
      clearScheduledWork();
    }, 8000);

    scheduleCleanup(timeout);
    processRef.current = { name: "server", stop: () => document.body.classList.remove("trojan-chaos") };
  };

  const handleTerminalCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;

    commandHistoryRef.current.push(command);
    historyIndexRef.current = commandHistoryRef.current.length;
    addTerminalLines(`guest@fartpr0mpt: ${command}`);

    const [cmd, ...args] = command.split(/\s+/);
    const normalized = command.toLowerCase();

    if (normalized === "light mode") return void (setTheme("light"), addTerminalLines("> theme switched to light mode"));
    if (normalized === "dark mode") return void (setTheme("dark"), addTerminalLines("> theme switched to dark mode"));
    if (cmd === "help") return void addTerminalLines("> available commands:", "  ls, dir, cat, clear, light mode, dark mode, fminer, rainbow, server.exe, shop, help");
    if (cmd === "clear") return void setTerminalLines(["> terminal cleared.", "> ready."]);
    if (cmd === "ls" || cmd === "dir") return void addTerminalLines("> contents:", "  README.md", "  config.sys", "  server.exe", "  passwd.db");

    if (cmd === "cat") {
      if (!args[0]) return void addTerminalLines("> usage: cat [filename]");
      if (args[0] === "README.md") return void addTerminalLines("Next.js site shell", "Interactive prompt dossier frontend.");
      if (args[0] === "config.sys") return void addTerminalLines("MEM=640K", "FILES=30", "BUFFERS=20");
      if (args[0] === "server.exe") return void addTerminalLines("Best not run this.");
      if (args[0] === "passwd.db") return void addTerminalLines("Error: Encrypted file.");
      return void addTerminalLines(`> file not found: ${args[0]}`);
    }

    if (cmd === "fminer" && !processRef.current) return void startMiner();

    if (cmd === "rainbow") {
      if (!args[0]) return void addTerminalLines("> usage: rainbow [filename]");
      if (!args[0].endsWith(".db")) return void addTerminalLines("> error: target must be a .db file");
      if (args[0] !== "passwd.db") return void addTerminalLines(`> hash match failed: hash not found in tables for ${args[0]}`);
      if (!processRef.current) startRainbow();
      return;
    }

    if ((cmd === "server.exe" || cmd === "./server.exe") && !processRef.current) return void startTrojan();

    if (cmd === "shop") {
      addTerminalLines("> opening store...");
      window.location.href = "/store";
      return;
    }

    addTerminalLines(`'${command}' is not recognized`);
  };

  const terminalHistoryUp = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setTerminalInput(commandHistoryRef.current[historyIndexRef.current] ?? "");
    }
  };

  const terminalHistoryDown = () => {
    if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
      historyIndexRef.current += 1;
      setTerminalInput(commandHistoryRef.current[historyIndexRef.current] ?? "");
    } else {
      historyIndexRef.current = commandHistoryRef.current.length;
      setTerminalInput("");
    }
  };

  return {
    copiedPrompt,
    counterValues,
    displayedPrompts,
    fartBalance,
    filteredPromptIndexes,
    handlePromptCopy,
    handleTerminalCommand,
    processRef,
    promptFilter,
    setPromptFilter,
    setPromptOrder,
    setTerminalInput,
    shuffleArray,
    stopActiveProcess,
    terminalHistoryDown,
    terminalHistoryUp,
    terminalInput,
    terminalInputRef,
    terminalLines,
    terminalOutputRef,
    uptime,
    PROMPTS,
    setTheme,
    theme,
  };
}
