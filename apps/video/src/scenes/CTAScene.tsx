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

interface CTASceneProps {
  aspect: "16:9" | "9:16";
}

export const CTAScene: React.FC<CTASceneProps> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isVertical = aspect === "9:16";

  // Logo scale
  const logoScale = spring({
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

  // Date badge pulse
  const dateBadgeScale = spring({
    frame: frame - 50,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const datePulse = 1 + 0.02 * Math.sin((frame / 30) * Math.PI * 2);

  // URL + tagline fade in
  const bottomOpacity = interpolate(frame, [80, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hash ticker
  const ticker = interpolate(frame, [90, 130], [0, 1], {
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

      {/* App logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 24,
          filter: `drop-shadow(0 0 32px ${theme.gold}99) drop-shadow(0 0 80px rgba(0,100,255,0.4))`,
        }}
      >
        <Img
          src={staticFile("logo.jpg")}
          style={{
            width: isVertical ? 180 : 150,
            height: isVertical ? 180 : 150,
            borderRadius: isVertical ? 40 : 34,
            display: "block",
          }}
        />
      </div>

      {/* Main text */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 36,
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
            lineHeight: 1.1,
          }}
        >
          The World Cup
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 52 : 60,
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
      </div>

      {/* Launch date badge — the hero element */}
      <div
        style={{
          transform: `scale(${dateBadgeScale * datePulse})`,
          background: theme.gold,
          color: "#000",
          fontFamily: theme.fontMono,
          fontWeight: "bold",
          fontSize: isVertical ? 28 : 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          padding: isVertical ? "18px 56px" : "16px 52px",
          boxShadow: `0 0 32px ${theme.gold}, 0 0 80px ${theme.gold}66`,
          marginBottom: 32,
        }}
      >
        MAINNET · MARCH 27
      </div>

      {/* URL + tagline */}
      <div
        style={{
          opacity: bottomOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 28 : 26,
            fontWeight: "bold",
            letterSpacing: 3,
          }}
        >
          <GlowText color={theme.greenBright}>onchainworldcup.xyz</GlowText>
        </div>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: isVertical ? 20 : 18,
            color: theme.white,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          Vote · Win ETH · No middlemen
        </div>
      </div>

      {/* Hash ticker */}
      <div
        style={{
          opacity: interpolate(frame, [90, 110], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          fontFamily: theme.fontMono,
          fontSize: 14,
          color: theme.greenDim,
          letterSpacing: 2,
          marginTop: 20,
        }}
      >
        TX: {hashChars}
      </div>
    </AbsoluteFill>
  );
};
