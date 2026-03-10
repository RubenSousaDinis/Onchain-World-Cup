import { theme } from "../theme";
import { GlowText } from "./GlowText";

interface Team {
  flag: string;
  name: string;
  votes: number;
  eth: string;
}

interface MatchCardProps {
  home: Team;
  away: Team;
  label?: string;
  scale?: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  home,
  away,
  label = "GROUP A  •  MATCH 1",
  scale = 1,
}) => {
  const total = home.votes + away.votes || 1;
  const homePct = Math.round((home.votes / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        border: `2px solid ${theme.greenDim}`,
        background: theme.bgCard,
        width: 560,
        fontFamily: theme.fontMono,
        boxShadow: `0 0 24px ${theme.greenGlow}, inset 0 0 24px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: theme.greenDim,
          padding: "6px 14px",
          fontSize: 11,
          letterSpacing: 2,
          color: theme.greenBright,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      {/* Teams row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 12px",
        }}
      >
        {/* Home */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 48 }}>{home.flag}</div>
          <div
            style={{
              color: theme.white,
              fontSize: 13,
              marginTop: 6,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {home.name}
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            color: theme.greenDim,
            fontSize: 22,
            fontWeight: "bold",
            padding: "0 16px",
          }}
        >
          VS
        </div>

        {/* Away */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 48 }}>{away.flag}</div>
          <div
            style={{
              color: theme.white,
              fontSize: 13,
              marginTop: 6,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {away.name}
          </div>
        </div>
      </div>

      {/* Vote bar */}
      <div style={{ padding: "0 24px 8px" }}>
        <div
          style={{
            height: 6,
            background: theme.bgPanel,
            display: "flex",
            overflow: "hidden",
            border: `1px solid ${theme.greenDim}`,
          }}
        >
          <div
            style={{
              width: `${homePct}%`,
              background: theme.green,
              boxShadow: `0 0 6px ${theme.green}`,
              transition: "width 0.3s",
            }}
          />
          <div
            style={{
              flex: 1,
              background: theme.blue,
              boxShadow: `0 0 6px ${theme.blue}`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 11,
            color: theme.grayLight,
          }}
        >
          <span>
            <GlowText color={theme.green}>{home.votes.toLocaleString()}</GlowText>{" "}
            votes
          </span>
          <span>
            votes{" "}
            <GlowText color={theme.blue}>{away.votes.toLocaleString()}</GlowText>
          </span>
        </div>
      </div>

      {/* ETH row */}
      <div
        style={{
          borderTop: `1px solid ${theme.greenDim}`,
          padding: "8px 24px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: theme.grayLight,
        }}
      >
        <span>
          PRIZE POOL{" "}
          <GlowText color={theme.gold}>
            {(
              parseFloat(home.eth) + parseFloat(away.eth)
            ).toFixed(3)}{" "}
            ETH
          </GlowText>
        </span>
        <span style={{ color: theme.greenDim, letterSpacing: 1 }}>
          ⬡ BASE
        </span>
      </div>
    </div>
  );
};
