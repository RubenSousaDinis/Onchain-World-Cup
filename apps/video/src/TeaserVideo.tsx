import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { theme } from "./theme";
import { HookScene } from "./scenes/HookScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { QualifyScene } from "./scenes/QualifyScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CTAScene } from "./scenes/CTAScene";

// Scene durations (frames @ 30fps)
export const SCENE = {
  HOOK: 180,      // 6s  — "What would be the onchain World Cup winner?"
  QUALIFY: 150,   // 5s  — "Help your country top the charts"
  GAMEPLAY: 120,  // 4s  — live match cards
  FEATURES: 180,  // 6s  — 6 features (was 4s, extended for readability)
  CTA: 180,       // 6s  — April 6 launch
};

// Transition duration shared across all cuts
const T = 20; // frames (~0.67s)

// Total frames accounting for transitions (each transition overlaps adjacent scenes)
const TOTAL_FRAMES =
  SCENE.HOOK + SCENE.QUALIFY + SCENE.GAMEPLAY + SCENE.FEATURES + SCENE.CTA -
  T * 4; // 4 transitions

interface TeaserVideoProps {
  aspect: "16:9" | "9:16";
}

const wipeTransition = wipe({ direction: "from-left" });
const fadeTransition = fade();

export const TeaserVideo: React.FC<TeaserVideoProps> = ({ aspect }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{ background: theme.bg, fontFamily: theme.fontMono }}
    >
      {/* Background music — fade in over first 30 frames, fade out over last 45 frames */}
      <Audio
        src={staticFile("music.mp3")}
        volume={interpolate(
          frame,
          [0, 30, TOTAL_FRAMES - 45, TOTAL_FRAMES],
          [0, 0.6, 0.6, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE.HOOK}>
          <HookScene aspect={aspect} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipeTransition}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE.QUALIFY}>
          <QualifyScene aspect={aspect} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipeTransition}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE.GAMEPLAY}>
          <GameplayScene aspect={aspect} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipeTransition}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE.FEATURES}>
          <FeaturesScene aspect={aspect} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fadeTransition}
          timing={linearTiming({ durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE.CTA}>
          <CTAScene aspect={aspect} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
