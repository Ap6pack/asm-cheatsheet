import { ImageResponse } from "next/og";

// Generated at build time into a static asset, so it works with `output: export`.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "ASM Cheatsheet — Attack Surface Management reference, learning path, and interactive labs";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0d12",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent rule */}
        <div
          style={{
            display: "flex",
            width: "160px",
            height: "8px",
            background: "#ef4444",
            borderRadius: "4px",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ef4444",
              marginBottom: "18px",
            }}
          >
            Attack Surface Management
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            ASM Cheatsheet
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#94a3b8",
              marginTop: "22px",
              maxWidth: "900px",
              lineHeight: 1.35,
            }}
          >
            Tools, commands, a 12-module learning path, and interactive incident-replay labs.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {["26 tools", "12 modules", "Interactive labs", "Open source"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#cbd5e1",
                  border: "2px solid #1e293b",
                  borderRadius: "999px",
                  padding: "10px 24px",
                }}
              >
                {chip}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
