import Builder from "./Builder";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/">
            <span className="brand-mark">P</span>
            <span>Polystack</span>
          </a>
          <nav className="topbar-nav">
            <a href="#builder">Builder</a>
            <a href="https://github.com/Jeyasurya14/stack" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="shell" id="builder">
        <Builder />
      </main>

      <footer className="footer">
        <span>Polystack — polyglot project scaffolder.</span>
        <span>
          <a href="https://github.com/Jeyasurya14/stack" target="_blank" rel="noreferrer">
            MIT
          </a>
        </span>
      </footer>
    </>
  );
}
