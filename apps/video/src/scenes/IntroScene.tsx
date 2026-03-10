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

interface IntroSceneProps {
  aspect: "16:9" | "9:16";
}

export const IntroScene: React.FC<IntroSceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Trophy bounces in
  const trophyScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
  });

  // Title slides up
  const titleY = interpolate(frame, [10, 35], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle fades in
  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background pulse
  const bgGlow = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.03, 0.08, 0.03]
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(0,204,68,${bgGlow}) 0%, ${theme.bg} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <ScanlineOverlay />

      {/* Grid lines (retro stadium pitch feel) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${theme.greenDim}18 1px, transparent 1px),
            linear-gradient(90deg, ${theme.greenDim}18 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }}
      />

      {/* Trophy */}
      <div
        style={{
          fontSize: 100,
          transform: `scale(${trophyScale})`,
          lineHeight: 1,
          marginBottom: 16,
          filter: `drop-shadow(0 0 24px ${theme.gold})`,
        }}
      >
        🏆
      </div>

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            letterSpacing: 4,
            fontFamily: theme.fontMono,
            color: theme.greenBright,
            textShadow: `0 0 10px ${theme.greenBright}, 0 0 40px ${theme.green}88`,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          ONCHAIN
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            letterSpacing: 4,
            fontFamily: theme.fontMono,
            color: theme.white,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          WORLD CUP
        </div>
      </div>

      {/* Year badge */}
      <div
        style={{
          opacity: subtitleOpacity,
          marginTop: 20,
          background: theme.greenDim,
          border: `1px solid ${theme.green}`,
          padding: "6px 28px",
          letterSpacing: 6,
          fontSize: 22,
          color: theme.greenBright,
          fontFamily: theme.fontMono,
        }}
      >
        WORLD CUP 2026
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          marginTop: 28,
          fontSize: 18,
          color: theme.grayLight,
          letterSpacing: 3,
          fontFamily: theme.fontMono,
          textTransform: "uppercase",
        }}
      >
        <GlowText color={theme.green}>Vote</GlowText>
        {"  ·  "}
        <GlowText color={theme.gold}>Win ETH</GlowText>
        {"  ·  "}
        <GlowText color={theme.blue}>Onchain</GlowText>
      </div>
    </AbsoluteFill>
  );
};
