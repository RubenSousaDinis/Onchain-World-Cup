import { Composition } from "remotion";
import { TeaserVideo } from "./TeaserVideo";

// 30fps · 16:9 · 1080p
const FPS = 30;
const W = 1920;
const H = 1080;

// 9:16 vertical for Reels/TikTok/Stories
const W_VERTICAL = 1080;
const H_VERTICAL = 1920;

// Total duration: ~23 seconds (90+120+150+150+180 frames)
const DURATION_SECS = 23;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TeaserVideo"
        component={TeaserVideo}
        durationInFrames={FPS * DURATION_SECS}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ aspect: "16:9" }}
      />
      <Composition
        id="TeaserVideo9x16"
        component={TeaserVideo}
        durationInFrames={FPS * DURATION_SECS}
        fps={FPS}
        width={W_VERTICAL}
        height={H_VERTICAL}
        defaultProps={{ aspect: "9:16" }}
      />
    </>
  );
};
