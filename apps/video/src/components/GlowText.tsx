import { theme } from "../theme";

interface GlowTextProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export const GlowText: React.FC<GlowTextProps> = ({
  children,
  color = theme.greenBright,
  style,
}) => (
  <span
    style={{
      color,
      textShadow: `0 0 8px ${color}, 0 0 20px ${color}66, 0 0 40px ${color}33`,
      ...style,
    }}
  >
    {children}
  </span>
);
