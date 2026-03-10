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

// Simulated qualification leaderboard
const STANDINGS = [
  { flag: "🇧🇷", name: "BRAZIL",    pct: 94, votes: 12847 },
  { flag: "🇦🇷", name: "ARGENTINA", pct: 88, votes: 11230 },
  { flag: "🇫🇷", name: "FRANCE",    pct: 81, votes: 9104  },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "ENGLAND",  pct: 73, votes: 8421  },
  { flag: "🇵🇹", name: "PORTUGAL",  pct: 61, votes: 6783  },
  { flag: "🇩🇪", name: "GERMANY",   pct: 54, votes: 5910  },
  { flag: "🇪🇸", name: "SPAIN",     pct: 47, votes: 4992  },
];

// Qualification threshold line
const QUALIFY_PCT = 70;

interface QualifySceneProps {
  aspect: "16:9" | "9:16";
}

export const QualifyScene: React.FC<QualifySceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // ── Headline slams in ────────────────────────────────────────────────────
  const headlineScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 200, mass: 0.9 },
  });

  // ── Subtitle fades in ────────────────────────────────────────────────────
  const subtitleOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Rows animate in staggered ────────────────────────────────────────────
  const rowAnimations = STANDINGS.map((_, i) => ({
    opacity: interpolate(frame, [20 + i * 7, 36 + i * 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    x: interpolate(frame, [20 + i * 7, 36 + i * 7], [-60, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    // Bar fills up after row appears
    barWidth: interpolate(frame, [30 + i * 7, 60 + i * 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  }));

  // ── "VOTE NOW" call to action ─────────────────────────────────────────────
  const ctaOpacity = interpolate(frame, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaPulse = 1 + 0.03 * Math.sin((frame / 20) * Math.PI * 2);

  // ── Threshold label pulse ─────────────────────────────────────────────────
  const thresholdBlink = frame % 30 < 15 ? 1 : 0.4;

  const rowHeight = isVertical ? 44 : 36;
  const barTrackHeight = isVertical ? 10 : 8;
  const fontSize = isVertical ? 15 : 13;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #010e01 0%, ${theme.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "48px 48px" : "48px 160px",
      }}
    >
      <ScanlineOverlay />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.greenDim}12 1px, transparent 1px), linear-gradient(90deg, ${theme.greenDim}12 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.3,
        }}
      />

      {/* Headline */}
      <div
        style={{
          transform: `scale(${headlineScale})`,
          textAlign: "center",
          marginBottom: isVertical ? 8 : 4,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 54 : 62,
            fontWeight: "bold",
            color: theme.white,
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          Help your country
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 54 : 62,
            fontWeight: "bold",
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.05,
            color: theme.greenBright,
            textShadow: `0 0 16px ${theme.greenBright}, 0 0 48px ${theme.green}88`,
          }}
        >
          qualify.
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 15 : 13,
          color: theme.grayLight,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: isVertical ? 32 : 24,
        }}
      >
        Vote to push your nation into the tournament
      </div>

      {/* Leaderboard */}
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 640 : 960,
          display: "flex",
          flexDirection: "column",
          gap: isVertical ? 8 : 6,
          marginBottom: isVertical ? 28 : 20,
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingBottom: 6,
            borderBottom: `1px solid ${theme.greenDim}`,
            fontFamily: theme.fontMono,
            fontSize: 10,
            letterSpacing: 2,
            color: theme.gray,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 28 }}>#</span>
          <span style={{ width: 32 }}></span>
          <span style={{ flex: 1 }}>Nation</span>
          <span style={{ width: 80, textAlign: "right" }}>Votes</span>
          <span style={{ width: isVertical ? 160 : 200 }}>Qualification</span>
        </div>

        {STANDINGS.map((s, i) => {
          const anim = rowAnimations[i];
          const isQualified = s.pct >= QUALIFY_PCT;
          const barColor = isQualified ? theme.green : theme.yellow;

          return (
            <div
              key={i}
              style={{
                opacity: anim.opacity,
                transform: `translateX(${anim.x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: rowHeight,
                borderLeft: isQualified
                  ? `2px solid ${theme.green}`
                  : `2px solid transparent`,
                paddingLeft: isQualified ? 6 : 8,
                background: isQualified
                  ? `${theme.green}08`
                  : "transparent",
              }}
            >
              {/* Rank */}
              <span
                style={{
                  width: 28,
                  fontFamily: theme.fontMono,
                  fontSize: fontSize,
                  color: theme.gray,
                }}
              >
                {i + 1}
              </span>

              {/* Flag */}
              <span style={{ width: 32, fontSize: isVertical ? 22 : 20 }}>
                {s.flag}
              </span>

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontFamily: theme.fontMono,
                  fontSize: fontSize,
                  letterSpacing: 1,
                  color: isQualified ? theme.white : theme.grayLight,
                  textTransform: "uppercase",
                }}
              >
                {s.name}
                {isQualified && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 9,
                      color: theme.green,
                      letterSpacing: 2,
                    }}
                  >
                    ✓ QUALIFYING
                  </span>
                )}
              </span>

              {/* Vote count */}
              <span
                style={{
                  width: 80,
                  textAlign: "right",
                  fontFamily: theme.fontMono,
                  fontSize: fontSize,
                  color: theme.grayLight,
                }}
              >
                {Math.round(s.votes * anim.barWidth).toLocaleString()}
              </span>

              {/* Progress bar */}
              <div
                style={{
                  width: isVertical ? 160 : 200,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: barTrackHeight,
                    background: theme.bgPanel,
                    border: `1px solid ${theme.greenDim}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${s.pct * anim.barWidth}%`,
                      height: "100%",
                      background: barColor,
                      boxShadow: `0 0 6px ${barColor}`,
                      transition: "width 0.1s",
                    }}
                  />
                  {/* Qualification threshold line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${QUALIFY_PCT}%`,
                      width: 2,
                      background: theme.white,
                      opacity: thresholdBlink * anim.barWidth,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 2,
                    fontFamily: theme.fontMono,
                    fontSize: 9,
                    color: barColor,
                  }}
                >
                  {Math.round(s.pct * anim.barWidth)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaPulse})`,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 18 : 16,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: theme.greenBright,
          textShadow: `0 0 12px ${theme.greenBright}`,
        }}
      >
        <GlowText color={theme.greenBright}>Every vote moves the bar →</GlowText>
      </div>
    </AbsoluteFill>
  );
};
