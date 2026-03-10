import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { theme } from "../theme";
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
    desc: "Winners claim ETH automatically. Fully trustless.",
    color: theme.green,
  },
  {
    icon: "📈",
    title: "EARLY VOTER EDGE",
    desc: "Vote early — get more votes for less ETH.",
    color: theme.yellow,
  },
  {
    icon: "📱",
    title: "FARCASTER NATIVE",
    desc: "Play directly in Warpcast. Zero setup.",
    color: theme.greenBright,
  },
  {
    icon: "🏅",
    title: "ACHIEVEMENT NFTS",
    desc: "Mint onchain proof of your best predictions.",
    color: theme.gold,
  },
  {
    icon: "🌍",
    title: "48 NATIONS",
    desc: "104 matches. Every game. Vote on all of them.",
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

  const titleOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardAnimations = FEATURES.map((_, i) => ({
    opacity: interpolate(frame, [12 + i * 9, 30 + i * 9], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    y: interpolate(frame, [12 + i * 9, 30 + i * 9], [24, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    scale: spring({
      frame: frame - 12 - i * 9,
      fps,
      from: 0.92,
      to: 1,
      config: { damping: 16, stiffness: 180, mass: 0.8 },
    }),
  }));

  return (
    <AbsoluteFill
      style={{
        background: "#020b02",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isVertical ? "52px 48px" : "52px 100px",
      }}
    >
      <ScanlineOverlay />

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: "center",
          marginBottom: isVertical ? 36 : 32,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 36 : 38,
            fontWeight: "bold",
            letterSpacing: 5,
            color: theme.white,
            textTransform: "uppercase",
          }}
        >
          WHY ONCHAIN WORLD CUP?
        </div>
        <div
          style={{
            width: 200,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${theme.green}, transparent)`,
            margin: "10px auto 0",
          }}
        />
      </div>

      {/* 2×3 grid — larger cards, more breathing room */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isVertical ? "1fr 1fr" : "repeat(3, 1fr)",
          gap: isVertical ? "20px 24px" : "18px 32px",
          width: "100%",
          maxWidth: isVertical ? 720 : 1400,
        }}
      >
        {FEATURES.map((f, i) => {
          const anim = cardAnimations[i];
          return (
            <div
              key={i}
              style={{
                opacity: anim.opacity,
                transform: `translateY(${anim.y}px) scale(${anim.scale})`,
                background: `${f.color}12`,
                border: `1px solid ${f.color}55`,
                borderLeft: `3px solid ${f.color}`,
                padding: isVertical ? "18px 20px" : "20px 24px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: isVertical ? 32 : 34,
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: isVertical ? 18 : 20,
                    fontWeight: "bold",
                    letterSpacing: 2,
                    color: f.color,
                    textTransform: "uppercase",
                    marginBottom: 6,
                    textShadow: `0 0 10px ${f.color}66`,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: isVertical ? 16 : 18,
                    color: theme.white,
                    lineHeight: 1.5,
                    opacity: 0.85,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          opacity: interpolate(frame, [90, 108], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginTop: isVertical ? 32 : 26,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 16 : 18,
          color: theme.grayLight,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        Powered by{" "}
        <span
          style={{
            color: theme.blue,
            textShadow: `0 0 8px ${theme.blue}`,
          }}
        >
          Base
        </span>
        {"  ·  "}Built on{" "}
        <span
          style={{
            color: theme.greenBright,
            textShadow: `0 0 8px ${theme.greenBright}`,
          }}
        >
          Ethereum
        </span>
      </div>
    </AbsoluteFill>
  );
};
