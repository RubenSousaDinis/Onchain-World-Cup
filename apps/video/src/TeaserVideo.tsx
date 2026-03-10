import { AbsoluteFill, Series } from "remotion";
import { theme } from "./theme";
import { IntroScene } from "./scenes/IntroScene";
import { HookScene } from "./scenes/HookScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CTAScene } from "./scenes/CTAScene";

// Scene durations (frames @ 30fps)
export const SCENE = {
  INTRO: 90,      // 3s
  HOOK: 120,      // 4s  — "What would be the onchain World Cup winner?"
  GAMEPLAY: 150,  // 5s
  FEATURES: 150,  // 5s
  CTA: 180,       // 6s
};

interface TeaserVideoProps {
  aspect: "16:9" | "9:16";
}

export const TeaserVideo: React.FC<TeaserVideoProps> = ({ aspect }) => {
  return (
    <AbsoluteFill
      style={{ background: theme.bg, fontFamily: theme.fontMono }}
    >
      <Series>
        <Series.Sequence durationInFrames={SCENE.INTRO}>
          <IntroScene aspect={aspect} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.HOOK}>
          <HookScene aspect={aspect} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.GAMEPLAY}>
          <GameplayScene aspect={aspect} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.FEATURES}>
          <FeaturesScene aspect={aspect} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.CTA}>
          <CTAScene aspect={aspect} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
