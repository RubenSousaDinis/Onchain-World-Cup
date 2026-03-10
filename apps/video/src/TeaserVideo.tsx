import { AbsoluteFill, Series } from "remotion";
import { theme } from "./theme";
import { HookScene } from "./scenes/HookScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { QualifyScene } from "./scenes/QualifyScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CTAScene } from "./scenes/CTAScene";

// Scene durations (frames @ 30fps)
export const SCENE = {
  HOOK: 180,      // 6s  — "What would be the onchain World Cup winner?"
  QUALIFY: 150,   // 5s  — "Help your country qualify"
  GAMEPLAY: 120,  // 4s  — live match cards
  FEATURES: 120,  // 4s  — 6 features
  CTA: 180,       // 6s  — March 27 launch
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
        <Series.Sequence durationInFrames={SCENE.HOOK}>
          <HookScene aspect={aspect} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.QUALIFY}>
          <QualifyScene aspect={aspect} />
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
