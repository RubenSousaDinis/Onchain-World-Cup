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

// Vote leaderboard — higher votes = higher rank
// Numbers are relative; bar width is normalized to the leader
const STANDINGS = [
  { flag: "🇧🇷", name: "BRAZIL",    votes: 12847 },
  { flag: "🇦🇷", name: "ARGENTINA", votes: 11230 },
  { flag: "🇫🇷", name: "FRANCE",    votes: 9104  },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "ENGLAND",  votes: 8421  },
  { flag: "🇵🇹", name: "PORTUGAL",  votes: 6783  },
  { flag: "🇩🇪", name: "GERMANY",   votes: 5910  },
  { flag: "🇪🇸", name: "SPAIN",     votes: 4992  },
  { flag: "🇺🇸", name: "USA",       votes: 4201  },
];

const MAX_VOTES = STANDINGS[0].votes;

// Bar colours cycle through a few greens for visual variety
const BAR_COLORS = [
  theme.greenBright,
  theme.green,
  theme.green,
  "#00aa33",
  "#009922",
  "#008811",
  "#007700",
  "#006600",
];

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
    opacity: interpolate(frame, [18 + i * 7, 34 + i * 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    x: interpolate(frame, [18 + i * 7, 34 + i * 7], [-70, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    barProgress: interpolate(frame, [28 + i * 7, 70 + i * 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  }));

  // ── "VOTE FOR YOURS" CTA ─────────────────────────────────────────────────
  const ctaScale = spring({
    frame: frame - 100,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 220, mass: 0.7 },
  });
  const ctaPulse = 1 + 0.025 * Math.sin((frame / 20) * Math.PI * 2);

  const rowHeight = isVertical ? 52 : 44;
  const fontSize = isVertical ? 19 : 18;

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
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 52 : 60,
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
            fontSize: isVertical ? 52 : 60,
            fontWeight: "bold",
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.05,
            color: theme.greenBright,
            textShadow: `0 0 16px ${theme.greenBright}, 0 0 48px ${theme.green}88`,
          }}
        >
          top the charts.
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 18 : 17,
          color: theme.grayLight,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: isVertical ? 28 : 16,
        }}
      >
        48 nations compete · Your votes decide the rankings
      </div>

      {/* Leaderboard */}
      <div
        style={{
          width: "100%",
          maxWidth: isVertical ? 640 : 960,
          display: "flex",
          flexDirection: "column",
          gap: isVertical ? 6 : 4,
          marginBottom: isVertical ? 24 : 18,
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
            fontSize: 14,
            letterSpacing: 2,
            color: theme.gray,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 24 }}>#</span>
          <span style={{ width: 32 }} />
          <span style={{ flex: 1 }}>Nation</span>
          <span style={{ width: 90, textAlign: "right" }}>Votes</span>
          <span style={{ width: isVertical ? 160 : 220 }} />
        </div>

        {STANDINGS.map((s, i) => {
          const anim = rowAnimations[i];
          const barPct = (s.votes / MAX_VOTES) * 100 * anim.barProgress;
          const barColor = BAR_COLORS[i];
          const isLeader = i === 0;

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
                background: isLeader ? `${theme.greenBright}0a` : "transparent",
              }}
            >
              {/* Rank */}
              <span
                style={{
                  width: 24,
                  fontFamily: theme.fontMono,
                  fontSize: fontSize,
                  color: isLeader ? theme.greenBright : theme.gray,
                  fontWeight: isLeader ? "bold" : "normal",
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
                  color: isLeader ? theme.white : theme.grayLight,
                  textTransform: "uppercase",
                  fontWeight: isLeader ? "bold" : "normal",
                }}
              >
                {s.name}
              </span>

              {/* Vote count */}
              <span
                style={{
                  width: 90,
                  textAlign: "right",
                  fontFamily: theme.fontMono,
                  fontSize: fontSize,
                  color: isLeader ? theme.greenBright : theme.grayLight,
                }}
              >
                {Math.round(s.votes * anim.barProgress).toLocaleString()}
              </span>

              {/* Bar */}
              <div style={{ width: isVertical ? 160 : 220 }}>
                <div
                  style={{
                    height: isVertical ? 10 : 8,
                    background: theme.bgPanel,
                    border: `1px solid ${theme.greenDim}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: barColor,
                      boxShadow: isLeader ? `0 0 8px ${barColor}` : "none",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          transform: `scale(${ctaScale * ctaPulse})`,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 18 : 16,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        <GlowText color={theme.greenBright}>
          Vote for yours →
        </GlowText>
      </div>
    </AbsoluteFill>
  );
};
