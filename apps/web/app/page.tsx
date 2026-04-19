import Builder from "./Builder";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <div className="logo">Polystack</div>
        <nav style={{ display: "flex", gap: 18, fontSize: 14, color: "var(--muted)" }}>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#docs">Docs</a>
        </nav>
      </header>

      <section className="hero">
        <h1>Ship any stack. <span style={{ color: "#a78bfa" }}>Java</span>, <span style={{ color: "#3776ab" }}>Python</span>, <span style={{ color: "#f7df1e" }}>JS</span>, <span style={{ color: "#3178c6" }}>TS</span>, <span style={{ color: "#777bb4" }}>PHP</span>.</h1>
        <p>Pick your language, framework, and database. Copy the command. Paste into your terminal. Polystack scaffolds a clean, runnable starter in seconds.</p>
      </section>

      <Builder />

      <div className="footer">
        Polystack — polyglot scaffolder. Templates live in <span className="kbd">packages/templates</span>.
      </div>
    </div>
  );
}
