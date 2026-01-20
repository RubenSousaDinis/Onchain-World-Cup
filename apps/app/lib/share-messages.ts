export const shareMessages = {
  appAdded: {
    text: "Just added the Onchain World Cup app! Backing my country with ETH when qualification opens. 🏆\n\nOnly top 48 countries qualify. Prize pool goes to early supporters.\n\nhttps://app.onchainworldcup.xyz",
    image: "/share/app-added.png",
  },

  countdown: (days: number) => ({
    text: `Onchain World Cup qualification opens in ${days} days! 🔥\n\nVote for countries with ETH. Top 48 qualify. Winners share the prize pool.\n\nhttps://app.onchainworldcup.xyz`,
    image: `/share/countdown-${days}.png`,
  }),

  qualificationInfo: {
    text: "Onchain World Cup: Vote for countries with ETH. Only top 48 qualify for the tournament. 🌍⚽\n\nWinners share the prize pool. Early voters get linear pricing.\n\nhttps://app.onchainworldcup.xyz",
    image: "/share/qualification-info.png",
  },

  firstVote: (countryName: string, countryFlag: string) => ({
    text: `Just backed ${countryFlag} ${countryName} in the Onchain World Cup! ⚽\n\nTop 48 countries qualify. Winners share the ETH prize pool.\n\nhttps://app.onchainworldcup.xyz`,
    image: "/share/first-vote.png",
  }),

  countryQualified: (countryName: string, countryFlag: string, rank: number, prizePool: string) => ({
    text: `🎉 ${countryFlag} ${countryName} just qualified for the Onchain World Cup!\n\nRank: #${rank}\nPrize pool: ${prizePool} ETH\n\nhttps://app.onchainworldcup.xyz`,
    image: "/share/qualified.png",
  }),

  qualificationEnded: (prizePool: string) => ({
    text: `Qualification ended! Top 48 countries locked in for the Onchain World Cup. 🏆\n\nTotal prize pool: ${prizePool} ETH\n\nhttps://app.onchainworldcup.xyz`,
    image: "/share/ended.png",
  }),

  prizePoolMilestone: (milestone: number) => ({
    text: `🔥 Onchain World Cup prize pool just hit ${milestone} ETH!\n\nQualification is heating up. Only top 48 countries qualify.\n\nhttps://app.onchainworldcup.xyz`,
    image: "/share/milestone.png",
  }),
}
