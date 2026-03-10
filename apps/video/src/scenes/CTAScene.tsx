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

interface CTASceneProps {
  aspect: "16:9" | "9:16";
}

export const CTAScene: React.FC<CTASceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // Trophy scale
  const trophyScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 140, mass: 1 },
  });

  // Title
  const titleOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 40], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA button pulse
  const ctaScale = spring({
    frame: frame - 50,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const ctaPulse = 1 + 0.025 * Math.sin((frame / 30) * Math.PI * 2);

  // URL fade in
  const urlOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hash ticker
  const ticker = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hashChars = "0x1a2b3c4d5e6f7890abcdef".slice(
    0,
    Math.floor(ticker * 22)
  );

  // Radial glow intensifies
  const glowIntensity = interpolate(frame, [0, 90], [0.04, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, rgba(0,204,68,${glowIntensity}) 0%, ${theme.bg} 65%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <ScanlineOverlay />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${theme.greenDim}15 1px, transparent 1px),
            linear-gradient(90deg, ${theme.greenDim}15 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />

      {/* Trophy */}
      <div
        style={{
          fontSize: isVertical ? 110 : 90,
          transform: `scale(${trophyScale})`,
          lineHeight: 1,
          marginBottom: 20,
          filter: `drop-shadow(0 0 32px ${theme.gold}) drop-shadow(0 0 64px ${theme.gold}66)`,
        }}
      >
        🏆
      </div>

      {/* Main CTA text */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 52 : 64,
            fontWeight: "bold",
            color: theme.white,
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          The World Cup
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 52 : 64,
            fontWeight: "bold",
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.1,
            color: theme.greenBright,
            textShadow: `0 0 12px ${theme.greenBright}, 0 0 40px ${theme.green}88`,
          }}
        >
          goes onchain.
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 20 : 18,
            color: theme.grayLight,
            letterSpacing: 3,
            marginTop: 16,
            textTransform: "uppercase",
          }}
        >
          Vote your team. Win real ETH. No middlemen.
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${ctaScale * ctaPulse})`,
          background: theme.green,
          color: theme.bg,
          fontFamily: theme.fontMono,
          fontWeight: "bold",
          fontSize: isVertical ? 22 : 20,
          letterSpacing: 4,
          textTransform: "uppercase",
          padding: isVertical ? "18px 56px" : "14px 52px",
          boxShadow: `0 0 24px ${theme.green}, 0 0 60px ${theme.green}66`,
          marginBottom: 32,
        }}
      >
        PLAY NOW →
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 18 : 15,
          color: theme.grayLight,
          letterSpacing: 2,
        }}
      >
        <GlowText color={theme.greenBright}>onchainworldcup.xyz</GlowText>
      </div>

      {/* Hash ticker */}
      <div
        style={{
          opacity: interpolate(frame, [90, 110], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: theme.fontMono,
          fontSize: 10,
          color: theme.greenDim,
          letterSpacing: 2,
          marginTop: 16,
        }}
      >
        TX: {hashChars}
      </div>
    </AbsoluteFill>
  );
};
