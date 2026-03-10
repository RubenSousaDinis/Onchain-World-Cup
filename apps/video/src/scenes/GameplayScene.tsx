import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "../theme";
import { GlowText } from "../components/GlowText";
import { MatchCard } from "../components/MatchCard";
import { ScanlineOverlay } from "../components/ScanlineOverlay";

const MATCHES = [
  {
    home: { flag: "🇧🇷", name: "BRAZIL", votes: 2847, eth: "2.847" },
    away: { flag: "🇦🇷", name: "ARGENTINA", votes: 2341, eth: "2.341" },
    label: "GROUP A  •  MATCH 1",
  },
  {
    home: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "ENGLAND", votes: 1923, eth: "1.923" },
    away: { flag: "🇫🇷", name: "FRANCE", votes: 2104, eth: "2.104" },
    label: "GROUP B  •  MATCH 3",
  },
  {
    home: { flag: "🇵🇹", name: "PORTUGAL", votes: 1654, eth: "1.654" },
    away: { flag: "🇩🇪", name: "GERMANY", votes: 1789, eth: "1.789" },
    label: "GROUP C  •  MATCH 2",
  },
];

interface GameplaySceneProps {
  aspect: "16:9" | "9:16";
}

export const GameplayScene: React.FC<GameplaySceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // Header slides in
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card animations — staggered
  const cardScales = MATCHES.map((_, i) =>
    spring({
      frame: frame - i * 12,
      fps,
      from: 0,
      to: 1,
      config: { damping: 14, stiffness: 160, mass: 0.9 },
    })
  );

  // Votes count up animation
  const voteMultiplier = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const animatedMatches = MATCHES.map((m) => ({
    ...m,
    home: {
      ...m.home,
      votes: Math.round(m.home.votes * voteMultiplier),
    },
    away: {
      ...m.away,
      votes: Math.round(m.away.votes * voteMultiplier),
    },
  }));

  // "Live" blinking cursor
  const blink = frame % 30 < 15 ? 1 : 0;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #020f02 0%, ${theme.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isVertical ? "60px 40px" : "50px 80px",
      }}
    >
      <ScanlineOverlay />

      {/* Header bar */}
      <div
        style={{
          opacity: headerOpacity,
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.greenDim}`,
          paddingBottom: 14,
          marginBottom: isVertical ? 48 : 40,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 18 : 15,
            letterSpacing: 3,
            color: theme.greenBright,
            textTransform: "uppercase",
          }}
        >
          🌍 GROUP STAGE — LIVE
          <span style={{ opacity: blink, marginLeft: 8 }}>█</span>
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 14 : 12,
            color: theme.grayLight,
            letterSpacing: 2,
          }}
        >
          <GlowText color={theme.gold}>32 NATIONS</GlowText>
          {"  ·  "}48 MATCHES
        </div>
      </div>

      {/* Match cards */}
      <div
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          gap: isVertical ? 32 : 40,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
        }}
      >
        {animatedMatches.map((match, i) => (
          <div
            key={i}
            style={{
              transform: `scale(${cardScales[i]})`,
              transformOrigin: "center center",
            }}
          >
            <MatchCard
              home={match.home}
              away={match.away}
              label={match.label}
              scale={isVertical ? 1.1 : 0.85}
            />
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div
        style={{
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 18 : 14,
          color: theme.grayLight,
          letterSpacing: 2,
          marginTop: isVertical ? 40 : 24,
          textTransform: "uppercase",
        }}
      >
        Pick a team. Place your vote. Win ETH.
      </div>
    </AbsoluteFill>
  );
};
