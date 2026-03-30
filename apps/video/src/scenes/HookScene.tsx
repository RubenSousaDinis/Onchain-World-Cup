import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "../theme";
import { GlowText } from "../components/GlowText";
import { ScanlineOverlay } from "../components/ScanlineOverlay";

// Contenders shown before the question resolves
const CONTENDERS = [
  { flag: "🇧🇷", name: "BRAZIL" },
  { flag: "🇦🇷", name: "ARGENTINA" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "ENGLAND" },
  { flag: "🇫🇷", name: "FRANCE" },
  { flag: "🇵🇹", name: "PORTUGAL" },
  { flag: "🇩🇪", name: "GERMANY" },
  { flag: "🇪🇸", name: "SPAIN" },
  { flag: "🇳🇱", name: "NETHERLANDS" },
  { flag: "🇮🇹", name: "ITALY" },
  { flag: "🇧🇪", name: "BELGIUM" },
  { flag: "🇭🇷", name: "CROATIA" },
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇲🇽", name: "MEXICO" },
  { flag: "🇯🇵", name: "JAPAN" },
  { flag: "🇰🇷", name: "SOUTH KOREA" },
  { flag: "🇳🇬", name: "NIGERIA" },
  { flag: "🇸🇳", name: "SENEGAL" },
  { flag: "🇲🇦", name: "MOROCCO" },
  { flag: "🇺🇾", name: "URUGUAY" },
  { flag: "🇨🇴", name: "COLOMBIA" },
];

const QUESTION = "What would be the\nOnchain World Cup winner?";

interface HookSceneProps {
  aspect: "16:9" | "9:16";
}

export const HookScene: React.FC<HookSceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // ── Typewriter for the question ───────────────────────────────────────────
  // Start at frame 8, one char every 2 frames
  const charsToShow = Math.max(0, Math.floor((frame - 8) / 2));
  const displayText = QUESTION.slice(0, charsToShow);
  const cursorBlink = frame % 20 < 10 ? 1 : 0;
  const questionDone = charsToShow >= QUESTION.length;

  // ── Contenders cycle in rows ──────────────────────────────────────────────
  // Each contender appears staggered after question starts
  const contenderOpacities = CONTENDERS.map((_, i) =>
    interpolate(frame, [40 + i * 3, 50 + i * 3], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const contenderX = CONTENDERS.map((_, i) =>
    interpolate(frame, [40 + i * 3, 50 + i * 3], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // ── "YOU DECIDE." punch line ──────────────────────────────────────────────
  const punchScale = spring({
    frame: frame - 85,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 220, mass: 0.7 },
  });
  const punchOpacity = interpolate(frame, [85, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Background subtle flicker ──────────────────────────────────────────────
  const bgGlow = interpolate(frame % 40, [0, 20, 40], [0.04, 0.1, 0.04]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, rgba(0,204,68,${bgGlow}) 0%, ${theme.bg} 65%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "60px 48px" : "60px 160px",
      }}
    >
      <ScanlineOverlay />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.greenDim}15 1px, transparent 1px), linear-gradient(90deg, ${theme.greenDim}15 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.3,
        }}
      />

      {/* Question — typewriter */}
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 42 : 52,
          fontWeight: "bold",
          color: theme.white,
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: 1,
          marginBottom: isVertical ? 44 : 36,
          minHeight: isVertical ? 160 : 140,
          whiteSpace: "pre-wrap",
        }}
      >
        {displayText.split("\n").map((line, i) => (
          <div key={i}>
            {i === 0 ? (
              line
            ) : (
              <GlowText color={theme.greenBright}>{line}</GlowText>
            )}
          </div>
        ))}
        {/* Blinking cursor */}
        {!questionDone && (
          <span
            style={{
              opacity: cursorBlink,
              color: theme.greenBright,
              textShadow: `0 0 8px ${theme.greenBright}`,
            }}
          >
            █
          </span>
        )}
      </div>

      {/* Contenders grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: isVertical ? "10px 14px" : "10px 20px",
          maxWidth: isVertical ? 640 : 1100,
          marginBottom: isVertical ? 44 : 36,
        }}
      >
        {CONTENDERS.map((c, i) => (
          <div
            key={i}
            style={{
              opacity: contenderOpacities[i],
              transform: `translateX(${contenderX[i]}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${theme.greenDim}`,
              background: `${theme.bgCard}`,
              padding: isVertical ? "8px 14px" : "6px 12px",
              fontFamily: theme.fontMono,
              fontSize: isVertical ? 13 : 12,
              letterSpacing: 2,
              color: theme.grayLight,
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontSize: isVertical ? 20 : 18 }}>{c.flag}</span>
            {c.name}
          </div>
        ))}
      </div>

      {/* YOU DECIDE */}
      <div
        style={{
          opacity: punchOpacity,
          transform: `scale(${punchScale})`,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 38 : 44,
          fontWeight: "bold",
          letterSpacing: 8,
          textTransform: "uppercase",
          color: theme.greenBright,
          textShadow: `0 0 16px ${theme.greenBright}, 0 0 48px ${theme.green}88`,
        }}
      >
        YOU DECIDE.
      </div>
    </AbsoluteFill>
  );
};
