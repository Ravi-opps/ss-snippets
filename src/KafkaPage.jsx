import { useEffect, useMemo, useRef, useState } from "react";
import { kafkaMeta, kafkaSections } from "./kafka.js";
import { copyText } from "./clipboard.js";
import "./kafka.css";

function KxCopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      className={`kx-copy${copied ? " is-copied" : ""}`}
      onClick={handleCopy}
      aria-label="Copy terminal snippet"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

function TerminalBlock({ block }) {
  const lines = useMemo(() => block.body.split("\n"), [block.body]);
  const isOutput = block.kind === "output";

  return (
    <div className={`kx-term${isOutput ? " kx-term--output" : ""}`}>
      <div className="kx-term-bar">
        <div className="kx-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="kx-term-label">{block.label}</span>
        <KxCopyButton text={block.body} />
      </div>
      <pre className="kx-term-body">
        <code>
          {lines.map((line, index) => (
            <span className="kx-line" key={index}>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function DataTable({ table }) {
  return (
    <div className="kx-table-wrap">
      <h3 className="kx-table-title">{table.title}</h3>
      <div className="kx-table-scroll">
        <table className="kx-table">
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">
                      <code>{cell}</code>
                    </th>
                  ) : (
                    <td key={cellIndex}>{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step({ step, number }) {
  return (
    <div className="kx-step">
      <div className="kx-step-head">
        <span className="kx-step-no">{String(number).padStart(2, "0")}</span>
        <h3>{step.title}</h3>
      </div>
      <p className="kx-step-body">{step.body}</p>
      {step.blocks.length > 0 && (
        <div className="kx-blocks">
          {step.blocks.map((block, index) => (
            <TerminalBlock block={block} key={index} />
          ))}
        </div>
      )}
      {step.note && <p className="kx-step-note">{step.note}</p>}
    </div>
  );
}

function Flow({ items }) {
  return (
    <div className="kx-flow" aria-label="Kafka Connect architecture">
      {items.map((item, index) => (
        <span className="kx-flow-item" key={index}>
          {item}
          {index < items.length - 1 && (
            <span className="kx-flow-arrow" aria-hidden="true">
              -&gt;
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function Section({ section }) {
  return (
    <section className="kx-section" id={section.id} aria-labelledby={`${section.id}-title`}>
      <header className="kx-section-head">
        <span className="kx-kicker">
          <span className="kx-cursor" aria-hidden="true">
            &gt;
          </span>
          pdf / {section.index}
        </span>
        <h2 id={`${section.id}-title`}>{section.pdf}</h2>
        <p className="kx-section-title">{section.title}</p>
        <p className="kx-aim">{section.aim}</p>
        {section.concept && <p className="kx-concept">{section.concept}</p>}
      </header>

      <div className="kx-steps">
        {section.steps.map((step, index) => (
          <Step step={step} number={index + 1} key={`${section.id}-${index}`} />
        ))}
      </div>

      {section.flow && (
        <div className="kx-flow-wrap">
          <h3 className="kx-table-title">Architecture</h3>
          <Flow items={section.flow} />
        </div>
      )}

      {section.tables?.map((table) => (
        <DataTable table={table} key={table.title} />
      ))}

      {section.notes && (
        <div className="kx-notes">
          <h3>
            <span aria-hidden="true"># </span>
            {section.notes.title}
          </h3>
          <ul>
            {section.notes.items.map((item, index) => (
              <li key={index}>
                <span className="kx-bullet" aria-hidden="true">
                  -
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function KafkaPage() {
  const [active, setActive] = useState(kafkaSections[0].id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${kafkaMeta.title} — ss.md`;
    document.body.classList.add("kx-body");
    return () => {
      document.title = previousTitle;
      document.body.classList.remove("kx-body");
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.25] }
    );

    kafkaSections.forEach((section) => {
      const node = document.getElementById(section.id);
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
    <div className="kx">
      <div className="kx-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <aside className="kx-sidebar">
        <a className="kx-brand" href="/" aria-label="Back to C snippets">
          <span className="kx-brand-mark" aria-hidden="true">
            k
          </span>
          <span className="kx-brand-copy">
            <strong>kafka.md</strong>
            <small>terminal lab notes</small>
          </span>
        </a>

        <nav className="kx-nav" aria-label="Kafka sections">
          <span className="kx-nav-label">Contents</span>
          {kafkaSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`kx-nav-item${active === section.id ? " is-active" : ""}`}
            >
              <span className="kx-nav-index">{section.index}</span>
              <span className="kx-nav-title">{section.title}</span>
            </a>
          ))}
        </nav>

        <div className="kx-sidebar-foot">
          <a className="kx-back" href="/">
            &lt;- back to C snippets
          </a>
          <span className="kx-source">Based on AAA.md · 4 PDFs</span>
        </div>
      </aside>

      <main className="kx-main">
        <header className="kx-hero">
          <span className="kx-eyebrow">
            <span className="kx-cursor" aria-hidden="true">
              $
            </span>
            {kafkaMeta.eyebrow}
          </span>
          <h1>{kafkaMeta.title}</h1>
          <p className="kx-lede">{kafkaMeta.tagline}</p>
          <div className="kx-chips" aria-label="Kafka lab facts">
            <span>4 programs</span>
            <span>Windows CMD</span>
            <span>copy-ready</span>
          </div>
        </header>

        <div className="kx-sections">
          {kafkaSections.map((section) => (
            <Section section={section} key={section.id} />
          ))}
        </div>

        <footer className="kx-footer">
          <span>kafka.md → React</span>
          <a href="https://github.com/Ravi-opps/ss-snippets" target="_blank" rel="noreferrer">
            Ravi-opps/ss-snippets
          </a>
        </footer>
      </main>
    </div>
  );
}
