import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { snippets } from "./snippets.js";

const REPO_URL = "https://github.com/Ravi-opps/ss-snippets";

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(#\s*[A-Za-z]+)|(\b(?:int|char|long|unsigned|signed|short|void|float|double|for|while|if|else|return|break|continue|typedef|struct|union|enum|switch|case|default|const|static|sizeof)\b)|(\b(?:INF|NULL|MAX|N)\b)|(\b(?:0x[0-9A-Fa-f]+|\d+)\b)|(\b[A-Za-z_]\w*(?=\s*\())/g;

const matrix = [
  ["0", "1", "1", "2"],
  ["1", "0", "2", "1"],
  ["1", "2", "0", "1"],
  ["2", "1", "1", "0"],
];

function highlightLine(line) {
  const nodes = [];
  let last = 0;

  for (const match of line.matchAll(TOKEN_RE)) {
    if (match.index > last) {
      nodes.push(line.slice(last, match.index));
    }

    let kind = "plain";
    if (match[1]) kind = "comment";
    else if (match[2]) kind = "string";
    else if (match[3]) kind = "preproc";
    else if (match[4]) kind = "keyword";
    else if (match[5]) kind = "constant";
    else if (match[6]) kind = "number";
    else if (match[7]) kind = "function";

    nodes.push(
      <span key={`${match.index}-${nodes.length}`} className={`tok tok-${kind}`}>
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
  }

  if (last < line.length) nodes.push(line.slice(last));
  if (nodes.length === 0) nodes.push(" ");
  return nodes;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <button
        type="button"
        className={`copy-btn${copied ? " is-copied" : ""}`}
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M5 15V6a2 2 0 012-2h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Copy code
          </>
        )}
      </button>
      {copied &&
        createPortal(
          <div className="toast" role="status">
            <span className="toast-dot" aria-hidden="true" />
            Code copied to clipboard
          </div>,
          document.body
        )}
    </>
  );
}

function CodeWindow({ code, filename, language, variant = "code" }) {
  const lines = useMemo(() => code.split("\n"), [code]);

  return (
    <div className={`code-window${variant === "output" ? " code-window--output" : ""}`}>
      <div className="code-bar">
        <div className="traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="code-file">{filename}</span>
        <div className="code-actions">
          <span className="lang-tag">{language}</span>
          <CopyButton text={code} />
        </div>
      </div>
      <div className="code-scroll">
        <div className="code-body">
          {lines.map((line, index) => (
            <div className="code-row" key={index}>
              <span className="line-no" aria-hidden="true">
                {index + 1}
              </span>
              <code className="line-code">
                {variant === "output" ? line || " " : highlightLine(line)}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Notes({ title, items }) {
  return (
    <aside className="notes">
      <div className="notes-head">
        <span className="notes-dot" aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      <ol className="notes-list">
        {items.map((item, index) => (
          <li key={index}>
            <span className="note-index">{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function Section({ snippet }) {
  return (
    <section className="snippet" id={snippet.id} aria-labelledby={`${snippet.id}-title`}>
      <div className="section-head">
        <span className="section-index" aria-hidden="true">
          {snippet.index}
        </span>
        <div className="section-copy">
          <span className="section-kicker">{snippet.tag}</span>
          <h2 id={`${snippet.id}-title`}>{snippet.title}</h2>
          <p>{snippet.intro}</p>
        </div>
      </div>

      <CodeWindow code={snippet.code} filename={snippet.filename} language={snippet.language} />

      {snippet.output && (
        <div className="output-wrap">
          <CodeWindow
            code={snippet.output}
            filename="terminal output"
            language="text"
            variant="output"
          />
        </div>
      )}

      <Notes title={snippet.notesTitle} items={snippet.notes} />
    </section>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 015.73 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

export default function App() {
  const [active, setActive] = useState(snippets[0].id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.1, 0.25] }
    );

    snippets.forEach((snippet) => {
      const node = document.getElementById(snippet.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <div className="app">
        <aside className="sidebar">
          <a className="brand" href="#top" aria-label="Back to top">
            <span className="brand-mark">
              ss<span>.md</span>
            </span>
            <span className="brand-copy">
              <strong>C Snippets</strong>
              <small>Networking lab notes</small>
            </span>
          </a>

          <nav className="nav" aria-label="Code sections">
            <span className="nav-label">Contents</span>
            {snippets.map((snippet) => (
              <a
                key={snippet.id}
                href={`#${snippet.id}`}
                className={`nav-item${active === snippet.id ? " is-active" : ""}`}
              >
                <span className="nav-index">{snippet.index}</span>
                <span className="nav-title">{snippet.title}</span>
              </a>
            ))}
          </nav>

          <div className="sidebar-foot">
            <a className="repo-link" href={REPO_URL} target="_blank" rel="noreferrer">
              <GithubIcon />
              View on GitHub
            </a>
            <span className="source-note">Based on ss.md</span>
          </div>
        </aside>

        <main className="main" id="top">
          <header className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Study notes / Computer networks</span>
              <h1>
                C programs for computer networks, <em>made readable.</em>
              </h1>
              <p className="lede">
                Five exam-ready implementations covering link-state and distance-vector
                routing, CIDR math, IPv4 class lookup, and leaky-bucket traffic shaping —
                presented with syntax highlighting and the key logic behind each.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#dijkstra">
                  Browse the code
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
                  <GithubIcon />
                  GitHub repo
                </a>
              </div>
              <ul className="chips" aria-label="Project facts">
                <li>5 programs</li>
                <li>100% C</li>
                <li>React + Vite</li>
              </ul>
            </div>

            <div className="hero-panel" aria-hidden="true">
              <div className="panel-head">
                <span>distance vector</span>
                <span className="panel-status">
                  <i /> converged
                </span>
              </div>
              <div className="matrix">
                <div className="matrix-head">
                  <span>from \ to</span>
                  {["0", "1", "2", "3"].map((col) => (
                    <span key={col}>{col}</span>
                  ))}
                </div>
                {matrix.map((row, rowIndex) => (
                  <div className="matrix-row" key={rowIndex}>
                    <span>node {rowIndex}</span>
                    {row.map((cell, cellIndex) => (
                      <span
                        key={cellIndex}
                        className={rowIndex === cellIndex ? "is-diagonal" : undefined}
                      >
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="panel-foot">dist[i][j] = dist[i][k] + dist[k][j]</div>
            </div>
          </header>

          <div className="section-list">
            {snippets.map((snippet) => (
              <Section key={snippet.id} snippet={snippet} />
            ))}
          </div>

          <footer className="footer">
            <div>
              <strong>ss.md → React</strong>
              <span>Exam-ready C snippets and their logic notes, all in one place.</span>
            </div>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <GithubIcon />
              Ravi-opps/ss-snippets
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
