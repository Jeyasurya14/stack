"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, DATABASES, FEATURES, buildCommand } from "@polystack/core/stacks";

type Lang = (typeof LANGUAGES)[number];

export default function Builder() {
  const [name, setName] = useState("my-app");
  const [langId, setLangId] = useState<string>(LANGUAGES[0].id);
  const lang: Lang = useMemo(
    () => LANGUAGES.find((l) => l.id === langId) ?? LANGUAGES[0],
    [langId]
  );
  const [frameworkId, setFrameworkId] = useState<string>(lang.frameworks[0].id);
  const [dbId, setDbId] = useState<string>("none");
  const [features, setFeatures] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // ensure framework is valid when language changes
  const effectiveFramework = lang.frameworks.find((f) => f.id === frameworkId)
    ? frameworkId
    : lang.frameworks[0].id;

  const command = buildCommand({
    name,
    lang: lang.id,
    framework: effectiveFramework,
    db: dbId,
    features,
  });

  const copy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="grid">
        <div className="panel">
          <p className="section-title">1. Project name</p>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value.trim() || "my-app")}
            placeholder="my-app"
          />

          <p className="section-title" style={{ marginTop: 22 }}>2. Language</p>
          <div className="options">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                className="chip"
                data-active={l.id === lang.id}
                onClick={() => {
                  setLangId(l.id);
                  setFrameworkId(l.frameworks[0].id);
                }}
                style={{ color: l.color }}
              >
                <span className="dot" />
                <span style={{ color: "var(--text)" }}>{l.name}</span>
              </button>
            ))}
          </div>

          <p className="section-title" style={{ marginTop: 22 }}>3. Framework</p>
          <div className="options">
            {lang.frameworks.map((f) => (
              <button
                key={f.id}
                className="chip"
                data-active={f.id === effectiveFramework}
                onClick={() => setFrameworkId(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="section-title">4. Database</p>
          <div className="options">
            {DATABASES.map((d) => (
              <button
                key={d.id}
                className="chip"
                data-active={d.id === dbId}
                onClick={() => setDbId(d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>

          <p className="section-title" style={{ marginTop: 22 }}>5. Extras</p>
          <div className="options">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                className="chip"
                data-active={features.includes(f.id)}
                onClick={() => toggleFeature(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>

          <p className="section-title" style={{ marginTop: 22 }}>Summary</p>
          <div className="summary">
            <span className="kbd">{name}</span>
            <span className="kbd">{lang.name}</span>
            <span className="kbd">{lang.frameworks.find((f) => f.id === effectiveFramework)?.name}</span>
            <span className="kbd">db: {dbId}</span>
            {features.length > 0 && <span className="kbd">+{features.join(",")}</span>}
          </div>
        </div>
      </div>

      <div className="cmd" aria-label="Copy this command">
        <button className="copy-btn" onClick={copy}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
        <span className="prompt">$</span>
        <span>{command}</span>
      </div>
    </>
  );
}
