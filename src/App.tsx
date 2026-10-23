import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  CSSProperties,
} from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RepoForm from "@/components/readme/RepoForm";
import EmptyState from "@/components/readme/EmptyState";
import { useReadme } from "@/hooks/useReadme";
import type { ReadmeData, ReadmeView } from "@/types/readme.types";
import { renderMarkdown } from "@/utils/markdown";
import { createPdf } from "@/utils/createPdf";
import "@/styles/global.css";
import "@/styles/readme.css";

type SourceKind = "github" | "local" | "sample";
type ThemeMode = "light" | "dark";
type PageSize = "a4" | "letter";
type Orientation = "portrait" | "landscape";
type InputMode = "github" | "local" | "sample";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface HistoryEntry {
  id: string;
  title: string;
  repository: string;
  markdown: string;
  defaultBranch?: string;
  source: SourceKind;
  openedAt: number;
}

interface AppSettings {
  theme: ThemeMode;
  fontSize: number;
  contentWidth: number;
  pageSize: PageSize;
  orientation: Orientation;
  pdfFooter: string;
  filename: string;
  showOutline: boolean;
  showStats: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".md", ".markdown"];
const HISTORY_KEY = "cwad-repo-to-pdf:history";
const SETTINGS_KEY = "cwad-repo-to-pdf:settings";
const HISTORY_LIMIT = 8;

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  fontSize: 15,
  contentWidth: 900,
  pageSize: "a4",
  orientation: "portrait",
  pdfFooter: "Generated with cwad-repo-to-pdf",
  filename: "README",
  showOutline: true,
  showStats: true,
};

const SAMPLE_MARKDOWN = `# Sample Project

A practical sample README to test **cwad-repo-to-pdf**.

## Features

- GitHub README fetching
- Local Markdown upload
- PDF export
- Search and heading navigation

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

| Option | Description |
| --- | --- |
| Theme | Light or dark preview |
| Export | Save documentation as PDF |
| Search | Find text in Markdown |

## Example Task List

- [x] Render headings and paragraphs
- [x] Display tables and code blocks
- [ ] Connect your own repository

> A README should help developers understand a project quickly.

## Links and Images

- [GitHub](https://github.com)
- [Vite](https://vite.dev)

## Conclusion

Upload a Markdown file or enter a GitHub repository to get started.
`;

const APP_CSS = `
.appx{--app-text:#111827;--app-muted:#6b7280;--app-border:#e5e7eb;max-width:1180px;margin:0 auto;padding:0 24px;min-height:100vh;color:var(--app-text);background:#fff}
.appx *{box-sizing:border-box}.appx-hero{max-width:850px;margin:52px auto 35px;text-align:center}.appx-eyebrow{margin:0 0 10px;font-size:11px;font-weight:750;letter-spacing:.14em;color:#6b7280}.appx-hero h1{margin:0;font-size:clamp(30px,5vw,46px);line-height:1.12;letter-spacing:-.045em;overflow-wrap:anywhere}.appx-description{max-width:640px;margin:15px auto 25px;color:#6b7280;font-size:15px;line-height:1.7}
.appx-panel{padding:18px;border:1px solid var(--app-border);border-radius:10px;background:#f9fafb;text-align:left}.appx-tabs,.appx-toolbar,.appx-toolbar-group,.appx-actions,.appx-panel-head,.appx-doc-head,.appx-history-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.appx-tabs{margin-bottom:16px}.appx-btn,.appx-tab{border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#111827;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;min-height:35px;transition:background .15s,border-color .15s}.appx-btn:hover,.appx-tab:hover{background:#f3f4f6;border-color:#9ca3af}.appx-btn:disabled{opacity:.55;cursor:not-allowed}.appx-primary,.appx-tab.active{background:#111827;color:#fff;border-color:#111827}.appx-primary:hover,.appx-tab.active:hover{background:#374151;color:#fff}.appx-small{font-size:11px;padding:5px 8px;min-height:29px}.appx-danger{color:#b91c1c}
.appx-input,.appx-select{width:100%;border:1px solid #d1d5db;border-radius:6px;padding:9px 10px;background:#fff;color:#111827;font-size:13px;min-width:0}.appx-input:focus,.appx-select:focus{outline:2px solid #9ca3af;outline-offset:1px}.appx-upload{margin-top:14px;padding:18px;border:1px dashed #cbd5e1;border-radius:8px;text-align:center;background:#fff}.appx-upload.dragging,.appx.is-dragging .appx-upload{border-color:#111827;background:#f3f4f6}.appx-upload p{font-size:12px;color:#6b7280;line-height:1.6;margin:8px 0 0}.appx-selected{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;padding:10px;border:1px solid var(--app-border);border-radius:6px;text-align:left;overflow-wrap:anywhere;background:#fff;font-size:12px}.appx-alert{padding:10px 12px;border-radius:6px;margin:10px 0;font-size:13px;line-height:1.5}.appx-error{border:1px solid #fecaca;background:#fef2f2;color:#991b1b}.appx-success{border:1px solid #bbf7d0;background:#f0fdf4;color:#166534}.appx-status,.appx-hint{margin:9px 0 0;color:#6b7280;font-size:12px;line-height:1.6}
.appx-workspace{margin:38px 0 28px;min-width:0}.appx-panel-head{justify-content:space-between;align-items:flex-start;margin-bottom:15px}.appx-panel-head h2{font-size:20px;margin:0}.appx-panel-head p{margin:5px 0 0;color:#6b7280;font-size:12px;overflow-wrap:anywhere}.appx-actions{justify-content:flex-end}.appx-toolbar{justify-content:space-between;border:1px solid var(--app-border);border-bottom:0;border-radius:8px 8px 0 0;background:#f9fafb;padding:9px}.appx-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}.appx-layout.with-outline{grid-template-columns:220px minmax(0,1fr)}.appx-outline{align-self:start;position:sticky;top:10px;max-height:65vh;overflow:auto;padding:12px;border:1px solid var(--app-border);border-radius:8px;background:#fff}.appx-outline h3,.appx-settings h3,.appx-history h3{font-size:13px;margin:0 0 10px}.appx-outline-list{display:flex;flex-direction:column;gap:2px}.appx-outline-row{display:flex;gap:4px;align-items:flex-start}.appx-outline-link{flex:1;min-width:0;border:0;background:transparent;text-align:left;padding:6px;border-radius:4px;color:#4b5563;font-size:12px;line-height:1.4;cursor:pointer;overflow-wrap:anywhere}.appx-outline-link:hover,.appx-outline-link.active{background:#f3f4f6;color:#111827}.appx-outline-link.l2{padding-left:15px}.appx-outline-link.l3{padding-left:24px}.appx-outline-link.l4{padding-left:33px}.appx-outline-link.l5,.appx-outline-link.l6{padding-left:40px}.appx-copy-section{border:0;background:transparent;color:#6b7280;font-size:10px;padding:5px 2px;cursor:pointer}
.appx-document{min-width:0;border:1px solid var(--app-border);border-radius:0 0 8px 8px;overflow:hidden;background:#fff}.appx-doc-head{justify-content:space-between;padding:10px 13px;border-bottom:1px solid var(--app-border);background:#fff}.appx-doc-title{font-size:12px;font-weight:650;overflow-wrap:anywhere}.appx-view-switch{display:flex;gap:4px}.appx-view-switch button{border:1px solid transparent;border-radius:5px;background:transparent;padding:6px 9px;font-size:12px;color:#6b7280;cursor:pointer}.appx-view-switch button.active{background:#f3f4f6;border-color:#d1d5db;color:#111827}.appx-markdown{padding:clamp(18px,4vw,42px);min-height:220px;line-height:1.75;overflow-wrap:anywhere;color:#24292f;background:#fff}.appx-markdown h1,.appx-markdown h2,.appx-markdown h3,.appx-markdown h4,.appx-markdown h5,.appx-markdown h6{line-height:1.3;scroll-margin-top:20px;break-after:avoid-page}.appx-markdown h1{font-size:2em;border-bottom:1px solid #e5e7eb;padding-bottom:.3em}.appx-markdown h2{font-size:1.55em;border-bottom:1px solid #e5e7eb;padding-bottom:.25em}.appx-markdown h3{font-size:1.25em}.appx-markdown img{max-width:100%;height:auto}.appx-markdown table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}.appx-markdown th,.appx-markdown td{border:1px solid #d1d5db;padding:7px 10px}.appx-markdown th{background:#f3f4f6}.appx-markdown pre{overflow:auto;padding:15px;border-radius:7px;background:#f3f4f6;color:#111827;line-height:1.55;break-inside:avoid}.appx-markdown code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.9em}.appx-markdown :not(pre)>code{padding:.15em .35em;border-radius:4px;background:#f3f4f6}.appx-markdown blockquote{margin:1em 0;padding:.1em 1em;border-left:3px solid #d1d5db;color:#6b7280}.appx-markdown a{color:#075985;text-decoration:underline;text-underline-offset:2px}.appx-markdown li{margin:.2em 0}.appx-source{margin:0;padding:22px;max-height:75vh;overflow:auto;background:#fafafa;color:#111827;font:13px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
.appx-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}.appx-stat{padding:11px;border:1px solid var(--app-border);border-radius:7px;background:#fff;min-width:0}.appx-stat strong{display:block;font-size:19px}.appx-stat span{display:block;color:#6b7280;font-size:11px;margin-top:4px}.appx-search{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}.appx-search .appx-input{flex:1;min-width:160px}.appx-search-count{font-size:12px;color:#6b7280}.appx-settings,.appx-history{margin:14px 0;padding:15px;border:1px solid var(--var-border,var(--app-border));border-radius:8px;background:#fff}.appx-setting-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}.appx-setting label{display:block;margin-bottom:6px;font-size:12px;font-weight:650;color:#4b5563}.appx-setting input[type=range]{width:100%}.appx-wide{grid-column:1/-1}.appx-checkbox{display:flex;align-items:center;gap:7px;font-size:12px;color:#4b5563}.appx-history-head{justify-content:space-between}.appx-history-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.appx-history-item{justify-content:space-between;align-items:flex-start;gap:8px;border:1px solid var(--app-border);border-radius:6px;padding:10px;min-width:0}.appx-history-main{flex:1;min-width:0}.appx-history-main button{border:0;background:none;padding:0;text-align:left;font-size:12px;font-weight:650;cursor:pointer;overflow-wrap:anywhere}.appx-history-main p{margin:4px 0 0;color:#6b7280;font-size:11px}.appx-progress{margin:12px 0}.appx-progress-label{font-size:12px;color:#6b7280;margin-bottom:6px}.appx-progress-track{height:5px;background:#e5e7eb;border-radius:9px;overflow:hidden}.appx-progress-fill{height:100%;background:#111827;transition:width .2s}.appx-empty-state{padding:28px 15px;border:1px solid var(--app-border);border-radius:8px}.appx-empty-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:14px}.appx-fullscreen-overlay{position:fixed;inset:0;z-index:9999;overflow:auto;padding:16px;background:#fff}.appx-fullscreen-bar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fff;border-bottom:1px solid #e5e7eb}.appx-fullscreen-doc{max-width:1200px;margin:0 auto;padding:28px;line-height:1.75;overflow-wrap:anywhere}.appx-fullscreen-doc img{max-width:100%}.appx-fullscreen-doc pre{overflow:auto;background:#f3f4f6;padding:15px}.appx-shortcuts{display:flex;gap:14px;flex-wrap:wrap;margin:17px 0;color:#6b7280;font-size:11px}.appx-shortcuts kbd{border:1px solid #d1d5db;border-bottom-width:2px;border-radius:4px;padding:1px 5px;background:#fff;color:#374151}.appx-footer-note{margin:18px 0;color:#9ca3af;text-align:center;font-size:11px}.appx-search-mark{background:#fef08a;color:#713f12;border-radius:2px}.appx button:focus-visible,.appx a:focus-visible{outline:2px solid #2563eb;outline-offset:3px}.appx-dark .appx-document,.appx-dark .appx-doc-head{background:#111827;color:#e5e7eb;border-color:#374151}.appx-dark .appx-doc-head{border-bottom-color:#374151}.appx-dark .appx-doc-title{color:#e5e7eb}.appx-dark .appx-markdown{background:#111827;color:#e5e7eb}.appx-dark .appx-markdown h1,.appx-dark .appx-markdown h2{border-color:#374151}.appx-dark .appx-markdown pre,.appx-dark .appx-markdown :not(pre)>code{background:#1f2937;color:#f3f4f6}.appx-dark .appx-markdown th{background:#1f2937}.appx-dark .appx-markdown td,.appx-dark .appx-markdown th{border-color:#4b5563}.appx-dark .appx-markdown blockquote{border-color:#4b5563;color:#9ca3af}.appx-dark .appx-source{background:#111827;color:#e5e7eb}.appx-dark .appx-view-switch button{color:#9ca3af}.appx-dark .appx-view-switch button.active{background:#374151;color:#fff}.appx-dark .appx-outline,.appx-dark .appx-settings,.appx-dark .appx-history{background:#111827;color:#e5e7eb;border-color:#374151}.appx-dark .appx-outline-link{color:#d1d5db}.appx-dark .appx-outline-link:hover,.appx-dark .appx-outline-link.active{background:#374151;color:#fff}.appx-dark .appx-stat{background:#111827;border-color:#374151;color:#e5e7eb}.appx-dark .appx-stat span,.appx-dark .appx-history-main p{color:#9ca3af}.appx-dark .appx-fullscreen-overlay,.appx-dark .appx-fullscreen-bar{background:#111827;color:#e5e7eb;border-color:#374151}.appx-dark .appx-fullscreen-doc{color:#e5e7eb}.appx-dark .appx-toolbar{background:#1f2937;border-color:#374151}.appx-dark .appx-outline-heading h3,.appx-dark .appx-settings h3,.appx-dark .appx-history h3{color:#e5e7eb}.appx-dark .appx-setting label,.appx-dark .appx-checkbox{color:#d1d5db}.appx-dark .appx-stat{background:#111827}.appx-dark .appx-hint{color:#9ca3af}.appx-dark .appx-history-item{border-color:#374151}.appx-dark .appx-history-main button{color:#e5e7eb}.appx-dark .appx-progress-track{background:#374151}.appx-dark .appx-progress-fill{background:#e5e7eb}
@media(max-width:850px){.appx-layout.with-outline{grid-template-columns:1fr}.appx-outline{position:static;max-height:240px}.appx-setting-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.appx-history-list{grid-template-columns:1fr}}@media(max-width:600px){.appx{padding:0 12px}.appx-hero{margin-top:32px}.appx-panel{padding:12px}.appx-panel-head{flex-direction:column}.appx-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.appx-setting-grid{grid-template-columns:1fr}.appx-toolbar{align-items:flex-start}.appx-toolbar-group{width:100%}.appx-toolbar-group .appx-btn{flex:1}.appx-markdown{padding:16px;font-size:14px}.appx-fullscreen-doc{padding:14px}}@media(prefers-reduced-motion:reduce){.appx *{transition:none!important}}@media print{.appx-input-panel,.appx-toolbar,.appx-doc-head,.appx-outline,.appx-settings,.appx-history,.appx-stats,.appx-panel-head .appx-actions,.appx-shortcuts{display:none!important}.appx{max-width:none;padding:0}.appx-workspace{margin:0}.appx-document{border:0}.appx-markdown{padding:0;color:#000;background:#fff}.appx-markdown h1,.appx-markdown h2,.appx-markdown h3{break-after:avoid-page}.appx-markdown pre,.appx-markdown table,.appx-markdown blockquote,.appx-markdown img{break-inside:avoid}}
`;

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function markdownStats(markdown: string) {
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  return {
    words,
    characters: markdown.length,
    charactersNoSpaces: markdown.replace(/\s/g, "").length,
    lines: markdown ? markdown.split(/\r\n|\r|\n/).length : 0,
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  };
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const counts = new Map<string, number>();
  let inFence = false;
  markdown.split(/\r\n|\r|\n/).forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) return;
    const text = match[2].replace(/[`*_~]/g, "").trim();
    const base = slugifyHeading(text) || `section-${index + 1}`;
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    headings.push({
      id: count ? `${base}-${count}` : base,
      text,
      level: match[1].length,
      line: index,
    });
  });
  return headings;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeFilename(value: string): string {
  return (
    value
      .trim()
      .replace(/\.pdf$/i, "")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "README"
  );
}

function buildSampleReadme(): ReadmeData {
  return { repository: "sample-project", defaultBranch: "main", markdown: SAMPLE_MARKDOWN };
}

export default function App() {
  const [localReadme, setLocalReadme] = useState<ReadmeData | null>(null);
  const [localMarkdown, setLocalMarkdown] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("github");
  const [isDragging, setIsDragging] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [appError, setAppError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<ReadmeView>("preview");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportProgress, setExportProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState("");
  const [activeHeading, setActiveHeading] = useState("");
  const [settings, setSettings] = useState<AppSettings>(() =>
    safeReadStorage(SETTINGS_KEY, DEFAULT_SETTINGS),
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() => safeReadStorage(HISTORY_KEY, []));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const exportTimerRef = useRef<number | null>(null);

  const {
    readme: githubReadme,
    loading,
    error: githubError,
    loadReadme,
    setError: setGithubError,
  } = useReadme();
  const activeReadme = localReadme ?? githubReadme;
  const activeMarkdown = localMarkdown ?? activeReadme?.markdown ?? "";
  const sourceTitle = activeReadme?.repository ?? "No README loaded";
  const stats = useMemo(() => markdownStats(activeMarkdown), [activeMarkdown]);
  const headings = useMemo(() => extractHeadings(activeMarkdown), [activeMarkdown]);
  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return Array.from(
      activeMarkdown.matchAll(new RegExp(escaped, "gi")),
      (match) => match.index ?? 0,
    );
  }, [activeMarkdown, searchTerm]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* Optional persistence. */
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* Optional persistence. */
    }
  }, [history]);

  useEffect(
    () => () => {
      if (exportTimerRef.current !== null) window.clearInterval(exportTimerRef.current);
    },
    [],
  );

  const rememberReadme = useCallback((data: ReadmeData, source: SourceKind) => {
    const entry: HistoryEntry = {
      id: makeId(),
      title: data.repository,
      repository: data.repository,
      markdown: data.markdown,
      defaultBranch: data.defaultBranch,
      source,
      openedAt: Date.now(),
    };
    setHistory((current) =>
      [
        entry,
        ...current.filter(
          (item) => !(item.repository === entry.repository && item.source === source),
        ),
      ].slice(0, HISTORY_LIMIT),
    );
  }, []);

  const handleSubmit = useCallback(
    (owner: string, repo: string) => {
      if (!owner.trim() || !repo.trim()) {
        setGithubError("Please enter a valid GitHub repository URL.");
        return;
      }
      setInputMode("github");
      setLocalReadme(null);
      setLocalMarkdown(null);
      setLocalFile(null);
      setFileError("");
      setAppError("");
      setNotice("");
      setGithubError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      void loadReadme(owner.trim(), repo.trim());
    },
    [loadReadme, setGithubError],
  );

  useEffect(() => {
    if (githubReadme && inputMode === "github") rememberReadme(githubReadme, "github");
  }, [githubReadme, inputMode, rememberReadme]);

  const validateAndReadFile = useCallback(
    async (file: File) => {
      const dot = file.name.lastIndexOf(".");
      const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        setFileError("Choose a .md or .markdown file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError("The file exceeds the 5 MB size limit.");
        return;
      }
      setFileError("");
      setAppError("");
      setNotice("");
      setFileLoading(true);
      setLocalReadme(null);
      setLocalMarkdown(null);
      try {
        const markdown = await file.text();
        const data: ReadmeData = {
          markdown,
          repository: file.name.replace(/\.(md|markdown)$/i, ""),
          defaultBranch: "main",
        };
        setInputMode("local");
        setLocalFile(file);
        setLocalReadme(data);
        setLocalMarkdown(markdown);
        setView("preview");
        rememberReadme(data, "local");
        setNotice(`Loaded ${file.name}`);
      } catch (error) {
        console.error("Markdown file read failed:", error);
        setFileError("Unable to read this file. Please try again.");
      } finally {
        setFileLoading(false);
      }
    },
    [rememberReadme],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.item(0);
      if (file) void validateAndReadFile(file);
      event.target.value = "";
    },
    [validateAndReadFile],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const target = event.relatedTarget;
    if (!(target instanceof Node) || !event.currentTarget.contains(target)) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files.item(0);
      if (file) void validateAndReadFile(file);
    },
    [validateAndReadFile],
  );

  const handleUseSample = useCallback(() => {
    const sample = buildSampleReadme();
    setInputMode("sample");
    setLocalFile(null);
    setLocalReadme(sample);
    setLocalMarkdown(sample.markdown);
    setFileError("");
    setAppError("");
    setNotice("Sample README loaded.");
    setView("preview");
    rememberReadme(sample, "sample");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [rememberReadme]);

  const handleRemoveLocalFile = useCallback(() => {
    setLocalFile(null);
    setLocalReadme(null);
    setLocalMarkdown(null);
    setFileError("");
    setNotice("");
    setInputMode("github");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClear = useCallback(() => {
    setLocalFile(null);
    setLocalReadme(null);
    setLocalMarkdown(null);
    setFileError("");
    setAppError("");
    setNotice("");
    setExportError("");
    setSearchTerm("");
    setInputMode("github");
    setView("preview");
    setGithubError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setGithubError]);

  const openHistoryItem = useCallback((entry: HistoryEntry) => {
    const data: ReadmeData = {
      markdown: entry.markdown,
      repository: entry.repository,
      defaultBranch: entry.defaultBranch ?? "main",
    };
    setInputMode(entry.source);
    setLocalReadme(data);
    setLocalMarkdown(data.markdown);
    setLocalFile(null);
    setShowHistory(false);
    setSearchTerm("");
    setView("preview");
    setNotice(`Opened ${entry.title} from history.`);
    setAppError("");
  }, []);

  const removeHistoryItem = useCallback(
    (id: string) => setHistory((current) => current.filter((entry) => entry.id !== id)),
    [],
  );
  const clearHistory = useCallback(() => setHistory([]), []);

  const handleCopyMarkdown = useCallback(async () => {
    if (!activeMarkdown) return;
    try {
      await navigator.clipboard.writeText(activeMarkdown);
      setCopied(true);
      setNotice("Markdown copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setAppError("Clipboard access failed. Check browser permissions.");
    }
  }, [activeMarkdown]);

  const handleCopySection = useCallback(
    async (heading: HeadingItem) => {
      const lines = activeMarkdown.split(/\r\n|\r|\n/);
      let end = lines.length;
      for (let index = heading.line + 1; index < lines.length; index += 1) {
        const match = lines[index].match(/^\s*(#{1,6})\s+/);
        if (match && match[1].length <= heading.level) {
          end = index;
          break;
        }
      }
      try {
        await navigator.clipboard.writeText(lines.slice(heading.line, end).join("\n"));
        setCopiedSection(heading.id);
        window.setTimeout(() => setCopiedSection(""), 1600);
      } catch {
        setAppError("Unable to copy this section.");
      }
    },
    [activeMarkdown],
  );

  const handleExportPdf = useCallback(async () => {
    if (!activeReadme || !previewRef.current) {
      setExportError("Load a README before exporting a PDF.");
      return;
    }
    setExporting(true);
    setExportError("");
    setExportProgress(8);
    if (exportTimerRef.current !== null) window.clearInterval(exportTimerRef.current);
    exportTimerRef.current = window.setInterval(
      () => setExportProgress((value) => Math.min(value + 6, 88)),
      250,
    );
    try {
      const filename = `${safeFilename(settings.filename || activeReadme.repository)}.pdf`;
      await createPdf(previewRef.current, filename);
      setExportProgress(100);
      setNotice("PDF generated. Check your browser downloads.");
    } catch (error) {
      console.error("PDF generation failed:", error);
      setExportError("Unable to generate PDF. Please try again.");
    } finally {
      if (exportTimerRef.current !== null) {
        window.clearInterval(exportTimerRef.current);
        exportTimerRef.current = null;
      }
      window.setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 450);
    }
  }, [activeReadme, settings.filename]);

  const jumpToHeading = useCallback((heading: HeadingItem) => {
    setActiveHeading(heading.id);
    document
      .getElementById(`appx-${heading.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSearchKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && searchMatches.length > 0) {
        event.preventDefault();
        setSearchIndex((current) => (current + 1) % searchMatches.length);
      }
      if (event.key === "Escape") setSearchTerm("");
    },
    [searchMatches.length],
  );

  useEffect(() => {
    function handleShortcuts(event: globalThis.KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (typing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleExportPdf();
      } else if (event.key === "Escape") {
        setFullscreen(false);
        setShowSettings(false);
        setShowHistory(false);
      }
    }
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [handleExportPdf]);

  const renderedHtml = useMemo(() => {
    if (!activeReadme) return "";
    try {
      return renderMarkdown(activeMarkdown, activeReadme.repository, activeReadme.defaultBranch);
    } catch (error) {
      console.error("Markdown rendering failed:", error);
      return `<pre>${escapeHtml(activeMarkdown)}</pre>`;
    }
  }, [activeMarkdown, activeReadme]);

  const searchableHtml = useMemo(() => {
    if (!searchTerm.trim() || view !== "preview") return renderedHtml;
    const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return renderedHtml.replace(/(<[^>]+>)|([^<]+)/g, (whole, tag, text) => {
      if (tag) return tag;
      return String(text).replace(regex, '<mark class="appx-search-mark">$1</mark>');
    });
  }, [renderedHtml, searchTerm, view]);

  const updateHeadingIds = useCallback(() => {
    if (!previewRef.current) return;
    const used = new Map<string, number>();
    previewRef.current.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((node) => {
      const base = slugifyHeading(node.textContent ?? "") || "section";
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      node.id = `appx-${count ? `${base}-${count}` : base}`;
    });
  }, []);

  useEffect(() => {
    updateHeadingIds();
  }, [searchableHtml, view, updateHeadingIds]);

  const previewStyle = useMemo(
    () =>
      ({
        fontSize: `${settings.fontSize}px`,
        maxWidth: `${settings.contentWidth}px`,
        marginInline: "auto",
      }) as CSSProperties,
    [settings.contentWidth, settings.fontSize],
  );

  const appClass = `appx ${settings.theme === "dark" ? "appx-dark" : ""} ${isDragging ? "is-dragging" : ""}`;

  return (
    <main
      className={appClass}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <style>{APP_CSS}</style>
      <Header />
      <section className="appx-hero">
        <p className="appx-eyebrow">GITHUB README EXPORTER</p>
        <h1>cwad-repo-to-pdf</h1>
        <p className="appx-description">
          Fetch, preview, search and export GitHub documentation or local Markdown files as PDFs.
        </p>
        <div className="appx-panel">
          <div className="appx-tabs" role="tablist" aria-label="README source">
            <button
              type="button"
              role="tab"
              aria-selected={inputMode === "github"}
              className={`appx-tab ${inputMode === "github" ? "active" : ""}`}
              onClick={() => setInputMode("github")}
            >
              GitHub repository
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inputMode === "local"}
              className={`appx-tab ${inputMode === "local" ? "active" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Markdown
            </button>
            <button type="button" className="appx-tab" onClick={handleUseSample}>
              Load sample
            </button>
          </div>
          <RepoForm
            loading={loading}
            error={githubError}
            onSubmit={handleSubmit}
            onClearError={() => setGithubError("")}
          />
          <div className={`appx-upload ${isDragging ? "dragging" : ""}`}>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".md,.markdown,text/markdown,text/plain"
              aria-label="Choose a Markdown file"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="appx-btn"
              disabled={fileLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {fileLoading ? "Reading file…" : "Choose Markdown file"}
            </button>
            <p>
              Or drag and drop a .md or .markdown file anywhere on this page. Maximum size: 5 MB.
            </p>
            {localFile && (
              <div className="appx-selected">
                <span>
                  {localFile.name} · {formatBytes(localFile.size)}
                </span>
                <button
                  type="button"
                  className="appx-btn appx-small appx-danger"
                  onClick={handleRemoveLocalFile}
                >
                  Remove
                </button>
              </div>
            )}
            {fileError && (
              <p className="appx-alert appx-error" role="alert">
                {fileError}
              </p>
            )}
            {fileLoading && (
              <p className="appx-status" role="status">
                Reading Markdown file…
              </p>
            )}
          </div>
          {appError && (
            <p className="appx-alert appx-error" role="alert">
              {appError}
            </p>
          )}
          {notice && (
            <p className="appx-alert appx-success" role="status">
              {notice}
            </p>
          )}
        </div>
      </section>

      <section className="appx-workspace">
        <div className="appx-panel-head">
          <div>
            <h2>README Preview</h2>
            <p>{activeReadme ? sourceTitle : "Your rendered documentation will appear here."}</p>
          </div>
          <div className="appx-actions">
            <button
              className="appx-btn"
              type="button"
              onClick={() => setShowHistory((value) => !value)}
            >
              {showHistory ? "Hide history" : `Recent (${history.length})`}
            </button>
            <button
              className="appx-btn"
              type="button"
              onClick={() => setShowSettings((value) => !value)}
            >
              {showSettings ? "Hide settings" : "Settings"}
            </button>
            <button
              className="appx-btn"
              type="button"
              disabled={!activeReadme}
              onClick={() => setFullscreen(true)}
            >
              Fullscreen
            </button>
            <button className="appx-btn" type="button" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        {showHistory && (
          <section className="appx-history" aria-label="Recent README history">
            <div className="appx-history-head">
              <h3>Recently opened</h3>
              <button
                className="appx-btn appx-small"
                type="button"
                onClick={clearHistory}
                disabled={!history.length}
              >
                Clear history
              </button>
            </div>
            {!history.length ? (
              <p className="appx-hint">Opened documents appear here.</p>
            ) : (
              <div className="appx-history-list">
                {history.map((entry) => (
                  <div className="appx-history-item" key={entry.id}>
                    <div className="appx-history-main">
                      <button type="button" onClick={() => openHistoryItem(entry)}>
                        {entry.title}
                      </button>
                      <p>
                        {entry.source} · {new Date(entry.openedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="appx-btn appx-small appx-danger"
                      onClick={() => removeHistoryItem(entry.id)}
                      aria-label={`Remove ${entry.title}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showSettings && (
          <section className="appx-settings" aria-label="Preview and export settings">
            <h3>Preview and export settings</h3>
            <div className="appx-setting-grid">
              <div className="appx-setting">
                <label htmlFor="appx-theme">Preview theme</label>
                <select
                  id="appx-theme"
                  className="appx-select"
                  value={settings.theme}
                  onChange={(event) => updateSettings({ theme: event.target.value as ThemeMode })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="appx-setting">
                <label htmlFor="appx-font">Font size: {settings.fontSize}px</label>
                <input
                  id="appx-font"
                  type="range"
                  min="12"
                  max="22"
                  value={settings.fontSize}
                  onChange={(event) => updateSettings({ fontSize: Number(event.target.value) })}
                />
              </div>
              <div className="appx-setting">
                <label htmlFor="appx-width">Content width: {settings.contentWidth}px</label>
                <input
                  id="appx-width"
                  type="range"
                  min="560"
                  max="1100"
                  step="20"
                  value={settings.contentWidth}
                  onChange={(event) => updateSettings({ contentWidth: Number(event.target.value) })}
                />
              </div>
              <div className="appx-setting">
                <label htmlFor="appx-page-size">PDF page size</label>
                <select
                  id="appx-page-size"
                  className="appx-select"
                  value={settings.pageSize}
                  onChange={(event) => updateSettings({ pageSize: event.target.value as PageSize })}
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                </select>
              </div>
              <div className="appx-setting">
                <label htmlFor="appx-orientation">Orientation</label>
                <select
                  id="appx-orientation"
                  className="appx-select"
                  value={settings.orientation}
                  onChange={(event) =>
                    updateSettings({ orientation: event.target.value as Orientation })
                  }
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div className="appx-setting">
                <label htmlFor="appx-filename">Export filename</label>
                <input
                  id="appx-filename"
                  className="appx-input"
                  value={settings.filename}
                  onChange={(event) => updateSettings({ filename: event.target.value })}
                />
              </div>
              <div className="appx-setting appx-wide">
                <label htmlFor="appx-footer">PDF footer text</label>
                <input
                  id="appx-footer"
                  className="appx-input"
                  value={settings.pdfFooter}
                  onChange={(event) => updateSettings({ pdfFooter: event.target.value })}
                />
              </div>
              <label className="appx-checkbox">
                <input
                  type="checkbox"
                  checked={settings.showOutline}
                  onChange={(event) => updateSettings({ showOutline: event.target.checked })}
                />{" "}
                Show heading outline
              </label>
              <label className="appx-checkbox">
                <input
                  type="checkbox"
                  checked={settings.showStats}
                  onChange={(event) => updateSettings({ showStats: event.target.checked })}
                />{" "}
                Show statistics
              </label>
            </div>
            <p className="appx-hint">
              Page size, orientation and footer are stored as preferences. The current createPdf()
              utility controls the actual PDF options.
            </p>
          </section>
        )}

        {activeReadme && settings.showStats && (
          <div className="appx-stats" aria-label="Markdown statistics">
            <div className="appx-stat">
              <strong>{stats.words.toLocaleString()}</strong>
              <span>Words</span>
            </div>
            <div className="appx-stat">
              <strong>{stats.characters.toLocaleString()}</strong>
              <span>Characters</span>
            </div>
            <div className="appx-stat">
              <strong>{stats.lines.toLocaleString()}</strong>
              <span>Lines</span>
            </div>
            <div className="appx-stat">
              <strong>{stats.readingMinutes} min</strong>
              <span>Reading time</span>
            </div>
          </div>
        )}

        {activeReadme && (
          <div className="appx-toolbar">
            <div className="appx-toolbar-group">
              <button
                type="button"
                className="appx-btn appx-small"
                onClick={() => void handleCopyMarkdown()}
              >
                {copied ? "Copied!" : "Copy Markdown"}
              </button>
              <button
                type="button"
                className="appx-btn appx-small"
                onClick={() => setShowOutline((value) => !value)}
              >
                {showOutline ? "Hide outline" : "Show outline"}
              </button>
            </div>
            <div className="appx-toolbar-group">
              <button
                type="button"
                className={`appx-btn appx-small ${view === "preview" ? "appx-primary" : ""}`}
                onClick={() => setView("preview")}
              >
                Preview
              </button>
              <button
                type="button"
                className={`appx-btn appx-small ${view === "markdown" ? "appx-primary" : ""}`}
                onClick={() => setView("markdown")}
              >
                Markdown
              </button>
              <button
                type="button"
                className="appx-btn appx-primary appx-small"
                disabled={exporting}
                onClick={() => void handleExportPdf()}
              >
                {exporting ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>
        )}

        {activeReadme && (
          <div className="appx-search">
            <input
              ref={searchInputRef}
              className="appx-input"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search Markdown… (Ctrl/Cmd + K)"
              aria-label="Search README"
            />
            <span className="appx-search-count">
              {searchTerm ? `${searchMatches.length} match(es)` : "Search document"}
            </span>
            {searchMatches.length > 0 && (
              <button
                type="button"
                className="appx-btn appx-small"
                onClick={() => setSearchIndex((index) => (index + 1) % searchMatches.length)}
              >
                Next ({searchIndex + 1}/{searchMatches.length})
              </button>
            )}
          </div>
        )}

        {exporting && (
          <div className="appx-progress" role="status" aria-live="polite">
            <div className="appx-progress-label">Preparing PDF… {exportProgress}%</div>
            <div className="appx-progress-track">
              <div className="appx-progress-fill" style={{ width: `${exportProgress}%` }} />
            </div>
          </div>
        )}
        {exportError && (
          <p className="appx-alert appx-error" role="alert">
            {exportError}
          </p>
        )}

        {!activeReadme ? (
          <div className="appx-empty-state">
            <EmptyState />
            <div className="appx-empty-actions">
              <button type="button" className="appx-btn" onClick={handleUseSample}>
                Try a sample README
              </button>
              <button
                type="button"
                className="appx-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Markdown
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`appx-layout ${showOutline && settings.showOutline ? "with-outline" : ""}`}
          >
            {showOutline && settings.showOutline && (
              <aside className="appx-outline" aria-label="Heading outline">
                <div className="appx-outline-heading">
                  <h3>On this page</h3>
                  <span>{headings.length}</span>
                </div>
                {headings.length === 0 ? (
                  <p className="appx-hint">No headings found.</p>
                ) : (
                  <nav className="appx-outline-list">
                    {headings.map((heading) => (
                      <div className="appx-outline-row" key={heading.id}>
                        <button
                          type="button"
                          className={`appx-outline-link l${heading.level} ${activeHeading === heading.id ? "active" : ""}`}
                          onClick={() => jumpToHeading(heading)}
                          title={heading.text}
                        >
                          {heading.text}
                        </button>
                        <button
                          type="button"
                          className="appx-copy-section"
                          onClick={() => void handleCopySection(heading)}
                          aria-label={`Copy section ${heading.text}`}
                        >
                          {copiedSection === heading.id ? "✓" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </nav>
                )}
              </aside>
            )}
            <div className="appx-document">
              <div className="appx-doc-head">
                <div className="appx-doc-title">{sourceTitle}</div>
                <div className="appx-view-switch">
                  <button
                    type="button"
                    className={view === "preview" ? "active" : ""}
                    onClick={() => setView("preview")}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className={view === "markdown" ? "active" : ""}
                    onClick={() => setView("markdown")}
                  >
                    Markdown
                  </button>
                </div>
              </div>
              {view === "preview" ? (
                <article
                  ref={previewRef}
                  className="appx-markdown"
                  style={previewStyle}
                  dangerouslySetInnerHTML={{ __html: searchableHtml }}
                />
              ) : (
                <pre className="appx-source">
                  <code>{activeMarkdown}</code>
                </pre>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="appx-shortcuts">
        <span>
          <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> Search
        </span>
        <span>
          <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>S</kbd> Export PDF
        </span>
        <span>
          <kbd>Esc</kbd> Close overlay
        </span>
      </div>
      {fullscreen && activeReadme && (
        <div
          className="appx-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen README preview"
        >
          <div className="appx-fullscreen-bar">
            <strong>{sourceTitle}</strong>
            <button type="button" className="appx-btn" onClick={() => setFullscreen(false)}>
              Close fullscreen (Esc)
            </button>
          </div>
          <div
            className="appx-fullscreen-doc"
            dangerouslySetInnerHTML={{ __html: searchableHtml }}
          />
        </div>
      )}
      <p className="appx-footer-note">cwad-repo-to-pdf · Markdown preview and PDF export</p>
      <Footer />
    </main>
  );
}
