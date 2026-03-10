import { AbsoluteFill } from "remotion";

/** CRT scanline effect — subtle horizontal lines over the entire frame */
export const ScanlineOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      pointerEvents: "none",
      zIndex: 999,
    }}
  />
);
