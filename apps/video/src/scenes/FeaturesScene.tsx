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

const FEATURES = [
  {
    icon: "⛓️",
    title: "100% ONCHAIN",
    desc: "Every vote recorded on Base. No trust required.",
    color: theme.blue,
  },
  {
    icon: "⚡",
    title: "INSTANT PAYOUTS",
    desc: "Winners claim ETH automatically. No middlemen.",
    color: theme.green,
  },
  {
    icon: "📈",
    title: "DYNAMIC PRICING",
    desc: "Early voters get more votes for less ETH.",
    color: theme.yellow,
  },
  {
    icon: "🏅",
    title: "NFT REWARDS",
    desc: "Earn achievement NFTs for your predictions.",
    color: theme.gold,
  },
  {
    icon: "📱",
    title: "FARCASTER NATIVE",
    desc: "Play directly in Warpcast. No wallet setup needed.",
    color: theme.greenBright,
  },
  {
    icon: "🌍",
    title: "32 NATIONS",
    desc: "All World Cup 2026 teams. 48 matches to vote on.",
    color: theme.white,
  },
];

interface FeaturesSceneProps {
  aspect: "16:9" | "9:16";
}

export const FeaturesScene: React.FC<FeaturesSceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const featureAnimations = FEATURES.map((_, i) =>
    spring({
      frame: frame - 10 - i * 8,
      fps,
      from: 0,
      to: 1,
      config: { damping: 15, stiffness: 150, mass: 1 },
    })
  );

  const featureX = FEATURES.map((_, i) =>
    interpolate(frame, [10 + i * 8, 30 + i * 8], [-40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "60px 48px" : "60px 120px",
      }}
    >
      <ScanlineOverlay />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.greenDim}10 1px, transparent 1px), linear-gradient(90deg, ${theme.greenDim}10 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: "center",
          marginBottom: isVertical ? 52 : 44,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 32 : 26,
            letterSpacing: 4,
            color: theme.grayLight,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          WHY ONCHAIN WORLD CUP?
        </div>
        <div
          style={{
            width: isVertical ? 180 : 150,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${theme.green}, transparent)`,
            margin: "0 auto",
          }}
        />
      </div>

      {/* Feature grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr 1fr" : "repeat(3, 1fr)",
          gap: isVertical ? "24px 28px" : "20px 40px",
          width: "100%",
          maxWidth: isVertical ? 700 : 1100,
        }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            style={{
              opacity: featureAnimations[i],
              transform: `translateX(${featureX[i]}px)`,
              border: `1px solid ${f.color}33`,
              background: `linear-gradient(135deg, ${f.color}08 0%, transparent 100%)`,
              padding: isVertical ? "20px 18px" : "16px 18px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: isVertical ? 28 : 24, lineHeight: 1, flexShrink: 0 }}>
              {f.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: isVertical ? 13 : 11,
                  letterSpacing: 2,
                  color: f.color,
                  textTransform: "uppercase",
                  marginBottom: 4,
                  textShadow: `0 0 8px ${f.color}88`,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: isVertical ? 13 : 11,
                  color: theme.grayLight,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Base logo line */}
      <div
        style={{
          opacity: interpolate(frame, [140, 160], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginTop: isVertical ? 44 : 32,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 14 : 12,
          color: theme.gray,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Powered by{" "}
        <GlowText color={theme.blue}>Base</GlowText>
        {"  ·  "}
        Built on{" "}
        <GlowText color={theme.greenBright}>Ethereum</GlowText>
      </div>
    </AbsoluteFill>
  );
};
