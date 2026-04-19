"use client";

import { useMemo, useState } from "react";
import {
  LANGUAGES,
  WEB_FRONTENDS,
  NATIVE_FRONTENDS,
  DATABASES,
  ORMS,
  DB_SETUPS,
  AUTH_PROVIDERS,
  PAYMENT_PROVIDERS,
  WEB_DEPLOYS,
  SERVER_DEPLOYS,
  PACKAGE_MANAGERS,
  ADDONS,
  GIT_OPTIONS,
  INSTALL_OPTIONS,
  buildCommand,
} from "@polystack/core/stacks";
import {
  Check,
  Copy,
  RotateCcw,
  Shuffle,
  Code2,
  Boxes,
  Monitor,
  Smartphone,
  Database,
  Server,
  Cloud,
  CloudCog,
  Layers,
  Lock,
  CreditCard,
  Package,
  Puzzle,
  GitBranch,
  Download,
  Terminal,
} from "lucide-react";

type Lang = (typeof LANGUAGES)[number];
type Framework = Lang["frameworks"][number];
type FWEntry = Framework & { langId: string; langName: string };

const ALL_FRAMEWORKS: FWEntry[] = LANGUAGES.flatMap((l) =>
  l.frameworks.map((f) => ({ ...f, langId: l.id, langName: l.name }))
);

function sanitizeName(raw: string) {
  const v = raw.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  return v || "my-app";
}

export default function Builder() {
  const [name, setName] = useState("my-app");
  const [langId, setLangId] = useState(LANGUAGES[0].id);
  const [frameworkId, setFrameworkId] = useState(LANGUAGES[0].frameworks[0].id);
  const [webFrontend, setWebFrontend] = useState("none");
  const [nativeFrontend, setNativeFrontend] = useState("none");
  const [dbId, setDbId] = useState("none");
  const [orm, setOrm] = useState("none");
  const [dbSetup, setDbSetup] = useState("none");
  const [auth, setAuth] = useState("none");
  const [payments, setPayments] = useState("none");
  const [webDeploy, setWebDeploy] = useState("none");
  const [serverDeploy, setServerDeploy] = useState("none");
  const [pm, setPm] = useState("auto");
  const [addons, setAddons] = useState<string[]>([]);
  const [git, setGit] = useState("init");
  const [install, setInstall] = useState("install");
  const [copied, setCopied] = useState(false);

  const lang = useMemo<Lang>(() => LANGUAGES.find((l) => l.id === langId) ?? LANGUAGES[0], [langId]);
  const activeFW = useMemo<FWEntry>(() => {
    const valid = lang.frameworks.find((f) => f.id === frameworkId) ?? lang.frameworks[0];
    return { ...valid, langId: lang.id, langName: lang.name };
  }, [lang, frameworkId]);

  const command = buildCommand({
    name,
    lang: lang.id,
    webFrontend,
    nativeFrontend,
    framework: activeFW.id,
    db: dbId,
    orm,
    dbSetup,
    auth,
    payments,
    webDeploy,
    serverDeploy,
    pm,
    addons,
    git,
    install,
  });

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const reset = () => {
    setName("my-app");
    setLangId(LANGUAGES[0].id);
    setFrameworkId(LANGUAGES[0].frameworks[0].id);
    setWebFrontend("none");
    setNativeFrontend("none");
    setDbId("none");
    setOrm("none");
    setDbSetup("none");
    setAuth("none");
    setPayments("none");
    setWebDeploy("none");
    setServerDeploy("none");
    setPm("auto");
    setAddons([]);
    setGit("init");
    setInstall("install");
  };
  const randomize = () => {
    const l = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const f = l.frameworks[Math.floor(Math.random() * l.frameworks.length)];
    setLangId(l.id);
    setFrameworkId(f.id);
    setWebFrontend(pickRandom(WEB_FRONTENDS).id);
    setNativeFrontend(pickRandom(NATIVE_FRONTENDS).id);
    setDbId(pickRandom(DATABASES).id);
    setOrm(pickRandom(ORMS.filter((x) => !x.langs || x.langs.includes(l.id))).id);
    setDbSetup(pickRandom(DB_SETUPS).id);
    setAuth(pickRandom(AUTH_PROVIDERS).id);
    setPayments(pickRandom(PAYMENT_PROVIDERS).id);
    setWebDeploy(pickRandom(WEB_DEPLOYS).id);
    setServerDeploy(pickRandom(SERVER_DEPLOYS).id);
    setAddons(ADDONS.filter(() => Math.random() < 0.35).map((a) => a.id));
  };
  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickLang = (l: Lang) => {
    setLangId(l.id);
    setFrameworkId(l.frameworks[0].id);
    // auto-reset incompatible picks
    const ormOk = ORMS.find((x) => x.id === orm);
    if (ormOk && ormOk.langs && !ormOk.langs.includes(l.id)) setOrm("none");
    const pmOk = PACKAGE_MANAGERS.find((x) => x.id === pm);
    if (pmOk && pmOk.langs && !pmOk.langs.includes(l.id)) setPm("auto");
  };
  const pickFramework = (f: FWEntry) => {
    if (f.langId !== lang.id) pickLang(LANGUAGES.find((l) => l.id === f.langId)!);
    setFrameworkId(f.id);
  };

  // helper: does option list item apply to current language/db?
  const ormEnabled = (o: (typeof ORMS)[number]) => !o.langs || o.langs.includes(lang.id);
  const setupEnabled = (d: (typeof DB_SETUPS)[number]) => !d.dbs || d.dbs.includes(dbId);
  const pmEnabled = (x: (typeof PACKAGE_MANAGERS)[number]) =>
    !x.langs || x.langs.includes(lang.id);

  const picksSummary = [
    ["Language", lang.name],
    webFrontend !== "none" && ["Web frontend", WEB_FRONTENDS.find((x) => x.id === webFrontend)?.name],
    nativeFrontend !== "none" && ["Native frontend", NATIVE_FRONTENDS.find((x) => x.id === nativeFrontend)?.name],
    ["Backend", activeFW.name],
    ["Database", DATABASES.find((d) => d.id === dbId)?.name ?? "None"],
    orm !== "none" && ["ORM", ORMS.find((x) => x.id === orm)?.name],
    dbSetup !== "none" && ["DB Setup", DB_SETUPS.find((x) => x.id === dbSetup)?.name],
    auth !== "none" && ["Auth", AUTH_PROVIDERS.find((x) => x.id === auth)?.name],
    payments !== "none" && ["Payments", PAYMENT_PROVIDERS.find((x) => x.id === payments)?.name],
    webDeploy !== "none" && ["Web deploy", WEB_DEPLOYS.find((x) => x.id === webDeploy)?.name],
    serverDeploy !== "none" && ["Server deploy", SERVER_DEPLOYS.find((x) => x.id === serverDeploy)?.name],
    pm !== "auto" && ["PM", PACKAGE_MANAGERS.find((x) => x.id === pm)?.name],
    addons.length > 0 && ["Addons", addons.join(", ")],
    git === "none" && ["Git", "No git"],
    install === "skip" && ["Install", "Skip"],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="side-block">
          <label className="label" htmlFor="pname">Project name</label>
          <input
            id="pname"
            className="side-input"
            value={name}
            onChange={(e) => setName(sanitizeName(e.target.value))}
            spellCheck={false}
          />
        </div>

        <div className="cli-card">
          <div className="cli-head">
            <span className="label">CLI command</span>
            <button className={`cli-copy ${copied ? "copied" : ""}`} onClick={copy} type="button">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="cli-body">
            <span className="cli-dollar">$</span>
            <CommandColored command={command} />
          </div>
        </div>

        <div className="side-block">
          <span className="label">Selected stack · {picksSummary.length} picks</span>
          <div className="picks">
            {picksSummary.map(([k, v], i) => (
              <div className="pick" key={i}>
                <span className="pick-k">{k}</span>
                <span className="pick-v">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={randomize} type="button">
            <Shuffle className="btn-icon" /> Randomize
          </button>
          <button className="btn" onClick={reset} type="button">
            <RotateCcw className="btn-icon" /> Reset
          </button>
          <button className="btn primary full" onClick={copy} type="button">
            {copied ? <Check className="btn-icon" /> : <Terminal className="btn-icon" />}
            {copied ? "Copied to clipboard" : "Copy command"}
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <section className="main">
        <div className="hero">
          <h1>Create a polyglot project.</h1>
          <p>
            Pick a language, framework, database, and integrations. Copy the command. Scaffold a
            clean, runnable starter in seconds.
          </p>
        </div>

        <Section title="Language" hint={`${LANGUAGES.length} options`} icon={<Code2 size={14} />}>
          {LANGUAGES.map((l) => (
            <Card
              key={l.id}
              active={l.id === lang.id}
              onClick={() => pickLang(l)}
              title={l.name}
              desc={l.description}
              meta={`${l.frameworks.length} framework${l.frameworks.length > 1 ? "s" : ""}`}
            />
          ))}
        </Section>

        <Section title="Web frontend" hint={`${WEB_FRONTENDS.length - 1} frameworks`} icon={<Monitor size={14} />}>
          {WEB_FRONTENDS.map((w) => (
            <Card
              key={w.id}
              active={w.id === webFrontend}
              onClick={() => setWebFrontend(w.id)}
              title={w.name}
              desc={w.description}
            />
          ))}
        </Section>

        <Section title="Native frontend" hint={`${NATIVE_FRONTENDS.length - 1} frameworks`} icon={<Smartphone size={14} />}>
          {NATIVE_FRONTENDS.map((n) => (
            <Card
              key={n.id}
              active={n.id === nativeFrontend}
              onClick={() => setNativeFrontend(n.id)}
              title={n.name}
              desc={n.description}
            />
          ))}
        </Section>

        <Section title="Backend" hint={`${lang.frameworks.length} for ${lang.name}`} icon={<Boxes size={14} />}>
          {ALL_FRAMEWORKS.map((f) => {
            const enabled = f.langId === lang.id;
            return (
              <Card
                key={`${f.langId}:${f.id}`}
                active={enabled && f.id === activeFW.id}
                disabled={!enabled}
                onClick={() => enabled && pickFramework(f)}
                title={f.name}
                desc={f.description}
                meta={f.langName}
              />
            );
          })}
        </Section>

        <Section title="Database" hint={`${DATABASES.length} options`} icon={<Database size={14} />}>
          {DATABASES.map((d) => (
            <Card
              key={d.id}
              active={d.id === dbId}
              onClick={() => {
                setDbId(d.id);
                const keep = DB_SETUPS.find((x) => x.id === dbSetup);
                if (keep && keep.dbs && !keep.dbs.includes(d.id)) setDbSetup("none");
              }}
              title={d.name}
              desc={d.description}
            />
          ))}
        </Section>

        <Section title="ORM" hint={`for ${lang.name}`} icon={<Layers size={14} />}>
          {ORMS.map((o) => (
            <Card
              key={o.id}
              active={o.id === orm}
              disabled={!ormEnabled(o)}
              onClick={() => ormEnabled(o) && setOrm(o.id)}
              title={o.name}
              desc={o.description}
              meta={o.langs ? `for ${o.langs.join(", ")}` : "universal"}
            />
          ))}
        </Section>

        <Section title="DB Setup" hint="Hosted or local providers" icon={<CloudCog size={14} />}>
          {DB_SETUPS.map((d) => (
            <Card
              key={d.id}
              active={d.id === dbSetup}
              disabled={!setupEnabled(d)}
              onClick={() => setupEnabled(d) && setDbSetup(d.id)}
              title={d.name}
              desc={d.description}
              meta={d.dbs ? `requires ${d.dbs.join("/")}` : undefined}
            />
          ))}
        </Section>

        <Section title="Auth" hint={`${AUTH_PROVIDERS.length} options`} icon={<Lock size={14} />}>
          {AUTH_PROVIDERS.map((a) => (
            <Card
              key={a.id}
              active={a.id === auth}
              onClick={() => setAuth(a.id)}
              title={a.name}
              desc={a.description}
            />
          ))}
        </Section>

        <Section title="Payments" hint={`${PAYMENT_PROVIDERS.length} options`} icon={<CreditCard size={14} />}>
          {PAYMENT_PROVIDERS.map((a) => (
            <Card
              key={a.id}
              active={a.id === payments}
              onClick={() => setPayments(a.id)}
              title={a.name}
              desc={a.description}
            />
          ))}
        </Section>

        <Section title="Web deploy" hint={`${WEB_DEPLOYS.length} options`} icon={<Cloud size={14} />}>
          {WEB_DEPLOYS.map((a) => (
            <Card
              key={a.id}
              active={a.id === webDeploy}
              onClick={() => setWebDeploy(a.id)}
              title={a.name}
              desc={a.description}
            />
          ))}
        </Section>

        <Section title="Server deploy" hint={`${SERVER_DEPLOYS.length} options`} icon={<Server size={14} />}>
          {SERVER_DEPLOYS.map((a) => (
            <Card
              key={a.id}
              active={a.id === serverDeploy}
              onClick={() => setServerDeploy(a.id)}
              title={a.name}
              desc={a.description}
            />
          ))}
        </Section>

        <Section title="Package manager" hint="JS/TS stacks" icon={<Package size={14} />}>
          {PACKAGE_MANAGERS.map((m) => (
            <Card
              key={m.id}
              active={m.id === pm}
              disabled={!pmEnabled(m)}
              onClick={() => pmEnabled(m) && setPm(m.id)}
              title={m.name}
              desc={m.description}
              meta={m.langs ? `for ${m.langs.join("/")}` : undefined}
            />
          ))}
        </Section>

        <Section title="Addons" hint="Toggle multiple" icon={<Puzzle size={14} />}>
          {ADDONS.map((f) => (
            <Card
              key={f.id}
              active={addons.includes(f.id)}
              onClick={() => toggleAddon(f.id)}
              title={f.name}
              desc={f.description}
            />
          ))}
        </Section>

        <Section title="Git" icon={<GitBranch size={14} />}>
          {GIT_OPTIONS.map((g) => (
            <Card
              key={g.id}
              active={g.id === git}
              onClick={() => setGit(g.id)}
              title={g.name}
              desc={g.description}
            />
          ))}
        </Section>

        <Section title="Install" icon={<Download size={14} />}>
          {INSTALL_OPTIONS.map((i) => (
            <Card
              key={i.id}
              active={i.id === install}
              onClick={() => setInstall(i.id)}
              title={i.name}
              desc={i.description}
            />
          ))}
        </Section>
      </section>
    </>
  );
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Section({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="section">
      <div className="section-head">
        <h2>
          {icon && <span className="section-icon">{icon}</span>}
          {title}
        </h2>
        {hint && <span className="hint">{hint}</span>}
      </div>
      <div className="grid">{children}</div>
    </div>
  );
}

function Card({
  active,
  disabled,
  onClick,
  title,
  desc,
  meta,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  desc: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      className="card"
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="card-row">
        <div className="card-title">
          <span>{title}</span>
        </div>
        <Check className="card-check" size={16} strokeWidth={2.5} />
      </div>
      <div className="card-desc">{desc}</div>
      {meta && <div className="card-meta">{meta}</div>}
    </button>
  );
}

function CommandColored({ command }: { command: string }) {
  const parts = command.split(" ");
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("--")) {
          return (
            <span key={i}>
              {i === 0 ? "" : " "}
              <span className="cli-flag">{p}</span>
            </span>
          );
        }
        return <span key={i}>{i === 0 ? "" : " "}{p}</span>;
      })}
    </>
  );
}
