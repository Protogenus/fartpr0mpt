export type PromptItem = {
  title: string;
  tags: string[];
  target: string;
};

export const COUNTER_TARGETS = [73, 404, 9];

export const PROMPTS: PromptItem[] = [
  {
    title: "master-prompt-log-collector.md",
    tags: ["sealed", "md", "ops"],
    target: "[SEALED ENTRY]\nFILE: master-prompt-log-collector.md\nCIPHER: POLYALPHA\nKEY: ROTATING\nPAYLOAD: REDACTED\nSTATUS: SEALED",
  },
  {
    title: "cookie-monster.md",
    tags: ["sealed", "ops", "payload"],
    target: "[SEALED ENTRY]\nFILE: cookie-monster.md\nACCESS: COOKIE-LOCKED\nPAYLOAD: EXFIL SEQUENCE\nSTATUS: RESTRICTED",
  },
  {
    title: "ghost-relay.txt",
    tags: ["txt", "relay", "net"],
    target: "[SEALED ENTRY]\nFILE: ghost-relay.txt\nRELAYS: 8\nLATENCY: 14ms\nSTATUS: STABLE",
  },
  {
    title: "nullmail-fragments.json",
    tags: ["json", "mail", "sealed"],
    target: "[SEALED ENTRY]\nFILE: nullmail-fragments.json\nSHARDS: 12\nCHECKSUM: VERIFIED\nSTATUS: FRAGMENTED",
  },
];

export const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%*+-=<>/\\|";

export const HEX_ROWS = [
  [
    ["A7", "F4", "3C", "52"],
    ["B1", "90", "B7", "0E"],
    ["C5", "A1", "8D", "4F"],
    ["D9", "6C", "33", "E7"],
    ["ED", "9A", "2B", "5F"],
    ["F1", "C8", "14", "D6"],
    ["03", "71", "89", "B2"],
    ["15", "4E", "0D", "FA"],
    ["27", "63", "1C", "95"],
    ["39", "E2", "7A", "4B"],
    ["4B", "88", "D1", "3E"],
    ["5D", "A9", "5C", "B4"],
    ["8B", "42", "1F", "C9"],
    ["E3", "7A", "5D", "24"],
    ["1C", "9B", "F6", "3E"],
    ["6A", "D5", "08", "B2"],
    ["9F", "21", "4C", "87"],
    ["B4", "5E", "D9", "13"],
    ["72", "A6", "3B", "F8"],
    ["0E", "C3", "85", "2D"],
    ["4A", "11", "99", "FF"],
    ["2B", "6C", "E0", "53"],
    ["11", "AA", "33", "CC"],
    ["44", "55", "66", "77"],
    ["88", "99", "00", "BB"],
    ["DD", "EE", "FF", "12"],
    ["A1", "B2", "C3", "D4"],
    ["E5", "F6", "07", "18"],
  ],
  [
    ["6F", "29", "8E", "F1"],
    ["81", "6D", "C3", "57"],
    ["93", "A0", "7D", "92"],
    ["A5", "4F", "E8", "5A"],
    ["B7", "D3", "76", "1F"],
    ["C9", "AA", "8C", "E4"],
    ["DB", "39", "C7", "62"],
    ["ED", "F5", "0B", "9E"],
    ["FF", "41", "CC", "78"],
    ["11", "23", "B6", "F0"],
    ["23", "5D", "81", "AE"],
    ["35", "34", "D9", "67"],
    ["88", "1B", "4F", "A2"],
    ["C6", "7D", "31", "E5"],
    ["2E", "94", "B8", "0A"],
    ["59", "F2", "6B", "D7"],
    ["A3", "41", "17", "8C"],
    ["E9", "35", "74", "2F"],
    ["1D", "86", "CA", "50"],
    ["64", "B9", "0F", "93"],
    ["9B", "28", "5C", "E1"],
    ["F5", "A7", "33", "78"],
    ["9A", "BC", "DE", "F0"],
    ["12", "34", "56", "78"],
    ["90", "AB", "CD", "EF"],
    ["01", "23", "45", "67"],
    ["89", "AC", "BD", "CE"],
    ["DF", "E0", "F1", "02"],
  ],
  [
    ["47", "E2", "B5", "18"],
    ["59", "93", "4A", "DF"],
    ["6B", "7C", "A5", "30"],
    ["7D", "8F", "C1", "2D"],
    ["8F", "B8", "74", "E9"],
    ["A1", "1A", "F3", "86"],
    ["B3", "5E", "CB", "42"],
    ["C5", "97", "D4", "8A"],
    ["D7", "3F", "C6", "71"],
    ["E9", "E4", "19", "B2"],
    ["FB", "5D", "80", "F7"],
    ["0D", "2C", "9E", "D1"],
    ["4C", "B3", "2A", "75"],
    ["8D", "16", "F9", "3E"],
    ["C2", "58", "A4", "E7"],
    ["0B", "91", "3F", "6A"],
    ["54", "D8", "82", "1C"],
    ["97", "25", "E6", "4B"],
    ["3A", "7F", "B1", "09"],
    ["6E", "C4", "95", "D2"],
    ["A9", "37", "F3", "18"],
    ["E1", "8B", "44", "2D"],
    ["55", "66", "77", "88"],
    ["99", "AA", "BB", "CC"],
    ["DD", "EE", "FF", "00"],
    ["11", "22", "33", "44"],
    ["55", "66", "77", "88"],
    ["99", "AA", "BB", "CC"],
  ],
  [
    ["1F", "64", "A7", "3B"],
    ["31", "8E", "F2", "05"],
    ["43", "CC", "79", "40"],
    ["55", "B5", "18", "73"],
    ["67", "EA", "2F", "96"],
    ["79", "51", "C8", "0D"],
    ["8B", "B4", "AF", "62"],
    ["9D", "37", "DD", "4E"],
    ["AF", "91", "F8", "25"],
    ["C1", "AA", "6C", "E3"],
    ["D3", "B0", "5F", "C2"],
    ["E5", "39", "87", "A2"],
    ["2F", "7C", "B5", "09"],
    ["61", "DA", "93", "4E"],
    ["A8", "15", "F7", "32"],
    ["D4", "5B", "8E", "C0"],
    ["19", "6F", "2A", "E3"],
    ["5C", "98", "01", "76"],
    ["8F", "B2", "45", "1D"],
    ["C3", "3E", "9A", "57"],
    ["F0", "89", "24", "A5"],
    ["12", "67", "DB", "38"],
    ["AC", "BD", "CE", "DF"],
    ["E0", "F1", "02", "13"],
    ["24", "35", "46", "57"],
    ["68", "79", "8A", "9B"],
    ["AC", "BD", "CE", "DF"],
    ["E0", "F1", "02", "13"],
  ],
];

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function shuffleArray<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  }
}

export function randomHash(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
