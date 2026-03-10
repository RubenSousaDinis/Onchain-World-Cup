import { Composition } from "remotion";
import { TeaserVideo } from "./TeaserVideo";

// 30fps · 16:9 · 1080p
const FPS = 30;
const W = 1920;
const H = 1080;

// 9:16 vertical for Reels/TikTok/Stories
const W_VERTICAL = 1080;
const H_VERTICAL = 1920;

// Total duration: ~24s (180+150+120+180+180 - 4×20 overlap = 730 frames)
const DURATION_FRAMES = 730;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TeaserVideo"
        component={TeaserVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ aspect: "16:9" }}
      />
      <Composition
        id="TeaserVideo9x16"
        component={TeaserVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={W_VERTICAL}
        height={H_VERTICAL}
        defaultProps={{ aspect: "9:16" }}
      />
    </>
  );
};
