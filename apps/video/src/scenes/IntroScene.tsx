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

export const IntroScene: React.FC<IntroSceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // ── Flash on frame 0-4 ──────────────────────────────────────────────────
  const flashOpacity = interpolate(frame, [0, 3, 8], [1, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo: drops in from above with heavy bounce ──────────────────────────
  const logoY = spring({
    frame,
    fps,
    from: -300,
    to: 0,
    config: { damping: 14, stiffness: 220, mass: 1.2 },
  });
  const logoScale = spring({
    frame,
    fps,
    from: 0.4,
    to: 1,
    config: { damping: 12, stiffness: 200, mass: 0.9 },
  });
  const logoOpacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── "ONCHAIN" slams in from left ─────────────────────────────────────────
  const word1X = spring({
    frame: frame - 8,
    fps,
    from: -800,
    to: 0,
    config: { damping: 18, stiffness: 260, mass: 1 },
  });
  const word1Opacity = interpolate(frame, [8, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── "WORLD CUP" slams in from right ─────────────────────────────────────
  const word2X = spring({
    frame: frame - 18,
    fps,
    from: 800,
    to: 0,
    config: { damping: 18, stiffness: 260, mass: 1 },
  });
  const word2Opacity = interpolate(frame, [18, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Horizontal light streak across the title ─────────────────────────────
  const streakX = interpolate(frame, [22, 38], [-120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const streakOpacity = interpolate(frame, [22, 28, 36, 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Year badge scales in ─────────────────────────────────────────────────
  const badgeScale = spring({
    frame: frame - 32,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 240, mass: 0.7 },
  });

  // ── Launch date fades up ─────────────────────────────────────────────────
  const launchY = interpolate(frame, [44, 62], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const launchOpacity = interpolate(frame, [44, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Tagline fades in ─────────────────────────────────────────────────────
  const tagOpacity = interpolate(frame, [58, 76], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Background radial pulse ──────────────────────────────────────────────
  const bgPulse = interpolate(frame % 50, [0, 25, 50], [0.05, 0.14, 0.05]);

  // ── Vignette tightens as scene progresses ────────────────────────────────
  const vignetteSize = interpolate(frame, [0, 90], [120, 70], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoSize = isVertical ? 200 : 170;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Dynamic radial bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 48%, rgba(0,204,68,${bgPulse}) 0%, transparent ${vignetteSize}%)`,
        }}
      />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${theme.greenDim}20 1px, transparent 1px),
            linear-gradient(90deg, ${theme.greenDim}20 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.35,
        }}
      />

      <ScanlineOverlay />

      {/* App logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoY}px) scale(${logoScale})`,
          marginBottom: isVertical ? 32 : 24,
          filter: `drop-shadow(0 0 40px ${theme.gold}aa) drop-shadow(0 0 80px rgba(0,100,255,0.35))`,
        }}
      >
        <Img
          src={staticFile("logo.jpg")}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: Math.round(logoSize * 0.22),
            display: "block",
          }}
        />
      </div>

      {/* Title block — overflow hidden to contain slam animations */}
      <div style={{ overflow: "hidden", textAlign: "center" }}>
        {/* "ONCHAIN" — slams from left */}
        <div
          style={{
            opacity: word1Opacity,
            transform: `translateX(${word1X}px)`,
            fontSize: isVertical ? 96 : 104,
            fontWeight: "bold",
            letterSpacing: 6,
            fontFamily: theme.fontMono,
            color: theme.greenBright,
            textShadow: `0 0 12px ${theme.greenBright}, 0 0 48px ${theme.green}99`,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          ONCHAIN
        </div>

        {/* "WORLD CUP" — slams from right */}
        <div
          style={{
            opacity: word2Opacity,
            transform: `translateX(${word2X}px)`,
            fontSize: isVertical ? 96 : 104,
            fontWeight: "bold",
            letterSpacing: 6,
            fontFamily: theme.fontMono,
            color: theme.white,
            textTransform: "uppercase",
            lineHeight: 1,
            position: "relative",
          }}
        >
          WORLD CUP

          {/* Light streak across title */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${streakX}%`,
              width: "12%",
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)`,
              opacity: streakOpacity,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Year badge */}
      <div
        style={{
          transform: `scale(${badgeScale})`,
          marginTop: 20,
          background: theme.greenDim,
          border: `2px solid ${theme.green}`,
          padding: isVertical ? "8px 36px" : "7px 32px",
          letterSpacing: 6,
          fontSize: isVertical ? 22 : 20,
          color: theme.greenBright,
          fontFamily: theme.fontMono,
          boxShadow: `0 0 20px ${theme.greenGlow}`,
        }}
      >
        WORLD CUP 2026
      </div>

      {/* Launch date */}
      <div
        style={{
          opacity: launchOpacity,
          transform: `translateY(${launchY}px)`,
          marginTop: 20,
          fontFamily: theme.fontMono,
          fontSize: isVertical ? 22 : 20,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Mainnet launching{" "}
        <GlowText color={theme.gold}>March 27</GlowText>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          marginTop: 16,
          fontSize: isVertical ? 16 : 14,
          color: theme.gray,
          letterSpacing: 4,
          fontFamily: theme.fontMono,
          textTransform: "uppercase",
        }}
      >
        Vote · Win ETH · Onchain
      </div>

      {/* Flash overlay */}
      <AbsoluteFill
        style={{
          background: "white",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
