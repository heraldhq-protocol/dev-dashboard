import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Dynamic parameters with fallbacks
  const title = searchParams.get("title") || "Developer Dashboard";
  const subtitle = searchParams.get("subtitle") || "Integrate Secure Alerts";
  const description = searchParams.get("description") || "Manage API keys, templates, and analytics for your protocol's notification layer.";

  // Fetch Syne font from jsdelivr (Fontsource)
  let syneFontData: ArrayBuffer | null = null;
  try {
    syneFontData = await fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/syne@latest/latin-600-normal.woff"
    ).then((res) => res.arrayBuffer());
  } catch (error) {
    console.warn("Failed to load Syne font, falling back to system fonts.");
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0A0A0A",
          padding: "80px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Pure-Code Web3 Background */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="glow-teal" cx="80%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#00c896" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-teal-bottom" cx="20%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#00c896" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
            </radialGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#glow-teal)" />
          <rect width="100%" height="100%" fill="url(#glow-teal-bottom)" />
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {/* Actual Herald Logo */}
          <svg 
            width="80" 
            height="80" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 764 764"
          >
            <g>
              <rect fill="#fff" width="764" height="764" rx="178.21"/>
            </g>
            <g>
              <rect fill="#00c896" x="224.5" y="195.5" width="329" height="360" rx="47.2"/>
            </g>
            <g>
              <circle fill="#fff" cx="387.5" cy="360.5" r="86"/>
            </g>
            <g>
              <rect fill="#fff" x="301.5" y="358.5" width="172" height="201"/>
            </g>
          </svg>
          <span
            style={{
              marginLeft: "24px",
              fontSize: "48px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            Herald Protocol
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "850px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#FFFFFF",
            }}
          >
            {title}
          </h1>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#00c896",
            }}
          >
            {subtitle}
          </h1>
          <p
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "#A1A1AA",
              marginTop: "24px",
              lineHeight: 1.4,
              maxWidth: "750px",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: syneFontData
        ? [
            {
              name: "Syne",
              data: syneFontData,
              style: "normal",
              weight: 600,
            },
          ]
        : undefined,
    }
  );
}
