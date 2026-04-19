"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui", color: "#e6e9ef", background: "#0b0d12", minHeight: "100vh" }}>
      <h1>Something went wrong</h1>
      <pre style={{ color: "#ff8a8a", whiteSpace: "pre-wrap" }}>{error.message}</pre>
      <button
        onClick={reset}
        style={{
          marginTop: 16,
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #242938",
          background: "#181c27",
          color: "#e6e9ef",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
