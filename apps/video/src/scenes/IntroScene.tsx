import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
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

  // Logo bounces in
  const logoScale = spring({
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

  // Launch date
  const launchOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background pulse
  const bgGlow = interpolate(frame % 60, [0, 30, 60], [0.03, 0.08, 0.03]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(0,204,68,${bgGlow}) 0%, ${theme.bg} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScanlineOverlay />

      {/* Grid lines */}
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

      {/* App logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 20,
          filter: `drop-shadow(0 0 32px ${theme.gold}88) drop-shadow(0 0 64px rgba(0,100,255,0.3))`,
        }}
      >
        <Img
          src={staticFile("logo.jpg")}
          style={{
            width: 160,
            height: 160,
            borderRadius: 36,
            display: "block",
          }}
        />
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

      {/* Launch date */}
      <div
        style={{
          opacity: launchOpacity,
          marginTop: 24,
          fontSize: 18,
          color: theme.grayLight,
          letterSpacing: 3,
          fontFamily: theme.fontMono,
          textTransform: "uppercase",
        }}
      >
        Mainnet launching{" "}
        <GlowText color={theme.gold}>March 27</GlowText>
      </div>
    </AbsoluteFill>
  );
};
