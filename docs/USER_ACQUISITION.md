# User Acquisition Strategy — Onchain World Cup

> World Cup 2026 kicks off in June 2026. With ~4 months to go, now is the prime window to build
> an audience before the tournament begins.

---

## 1. Farcaster Mini App (Highest Leverage, Already Integrated)

The Farcaster SDK is already in the codebase. This is the single highest-leverage channel for
a Base-native onchain app targeting crypto-native users.

**Immediate actions:**
- Complete the mini app manifest signing and get listed in Warpcast's Mini Apps directory
- Finish page-specific embeds for `/qualification`, `/leaderboard`, `/matches/[matchId]` so
  every shared link opens directly in-app within Warpcast
- Post vote-result casts automatically when matches resolve (e.g. "Brazil beat Argentina 3-1
  — 147 voters split 0.8 ETH. See the winning voters →")
- Create a `/cast` API endpoint that generates shareable cast text + embed for any vote a
  user places — tap to share becomes the default post-vote action
- Run a Farcaster-exclusive early access period before opening to the broader public

**Channels to target on Warpcast:**
- `/base`, `/onchain`, `/ethereum`, `/defi`
- `/soccer`, `/worldcup`, `/football`
- `/gaming`, `/predictions`

---

## 2. Base Ecosystem Programs

The app runs on Base. Leverage Coinbase and Base's existing distribution:

- **Base Grants** — Apply at base.org/grants. Prediction market + sports is a strong narrative
- **Base Ecosystem Page** — Submit the app to be listed on the Base ecosystem directory
- **Coinbase Wallet** — Already integrated as a connector. Reach out to the Coinbase Wallet
  team for featuring in their "Featured DApps" section
- **OnchainSummer** — Monitor for 2026 campaign announcements; position as a flagship app
- **Base Discord** — Share progress updates in #ecosystem-apps and #show-and-tell channels

---

## 3. Viral Mechanics (Already Built — Activate Them)

Several viral hooks exist in the codebase but need to be surfaced more aggressively:

**Early voter advantage:**
- Phase 1 pricing means early voters get more votes for less ETH
- Make this more visible: "You're in Phase 1 — your vote is worth 3x more right now"
- Add a countdown timer showing when Phase 2 (exponential pricing) kicks in

**OG image sharing:**
- Every match and country already generates a dynamic OG image
- Add one-click share buttons: "Share your pick on Warpcast / X / Telegram"
- After a vote, show a sharable card: "I just voted Brazil to beat France — join me →"

**Leaderboard competition:**
- Run weekly leaderboard prizes (e.g. top 3 earners in a given week get bonus ETH)
- Email/notify users when they get knocked off the top 10
- Display usernames (ENS or Farcaster handles) prominently on leaderboards

**NFT achievements:**
- Make achievement NFTs visible on profile pages immediately after earning
- Add rarity labels ("Only 23 people voted on this match in Phase 1")
- Enable sharing individual achievement NFTs as Warpcast embeds

---

## 4. World Cup 2026 Content Strategy

The World Cup is the story — ride it:

**Twitter/X:**
- Post daily World Cup 2026 content: qualification standings, bracket predictions, historical
  stats, controversial takes
- For every real-world qualification result, post "X qualified for the World Cup — did you
  back them? onchainworldcup.xyz"
- Thread format: "The most profitable World Cup predictions on Base this week"
- Engage with accounts like @worldcup, @FIFAWorldCup, large soccer journalists

**Reddit:**
- r/soccer (17M members) — share updates framed as news, not ads
- r/worldcup — predictions threads are common; participate genuinely
- r/ethereum, r/base, r/CryptoCurrency — frame as an onchain prediction market experiment
- r/DeFi — prediction markets are a recognized DeFi vertical

**YouTube/TikTok:**
- Partner with mid-size soccer prediction channels (50k–500k subs) for integrations
- Short-form: "I turned $10 of ETH into $X by predicting this match correctly"

---

## 5. Crypto-Native Communities

**Discord servers to engage:**
- Base official Discord
- Coinbase developer Discord
- OpenZeppelin Discord (smart contract credibility)
- Major soccer NFT projects (Sorare, etc.) — their users already combine crypto + soccer

**Telegram:**
- Crypto prediction market groups
- World Cup 2026 Telegram communities (many have 10k–50k members)
- Base ecosystem Telegram channels

**Twitter Spaces / Farcaster Audio:**
- Host a "World Cup 2026 predictions" Space weekly leading up to the tournament
- Invite popular crypto and soccer accounts to co-host

---

## 6. Influencer Outreach

**Sweet spot:** influencers who are both crypto-native AND soccer fans. They exist and their
audiences are a perfect match.

**Crypto influencers with sports interest:**
- Search Twitter for accounts posting both about Base/Ethereum AND World Cup
- Offer them early access, a small ETH allocation, and an affiliate link

**Soccer creators with tech-curious audiences:**
- Mid-tier YouTube/TikTok soccer creators (100k–1M) are more accessible and more likely to
  experiment than large accounts
- Offer: exclusive early voter status + their own referral link + a share of referral revenue

**Referral system to build:**
- Track referrals by wallet address or promo code
- Reward referrers with: bonus votes, ETH rebate, exclusive "Founder" NFT
- Display referred users on the referrer's profile page

---

## 7. PR and Media

**Crypto media (high priority):**
- Decrypt — pitch "The first onchain World Cup prediction market on Base"
- The Defiant — prediction markets + sports is their wheelhouse
- Blockworks — DeFi product coverage
- CoinDesk — broader crypto news

**Soccer media (longer shot but high upside):**
- The Athletic — tech-forward sports journalism
- ESPN FC — if the app gets traction, they'll cover the story
- Goal.com — large global soccer audience

**Pitch angle:**
> "Onchain World Cup lets fans bet on World Cup 2026 matches with ETH on Base. Unlike
> traditional bookmakers, all funds are held in smart contracts and payouts are transparent
> and automatic. Early voters get more votes for less ETH, rewarding conviction."

---

## 8. Partnerships

**Polymarket differentiation:**
- Polymarket uses USDC and focuses on binary resolution
- Onchain World Cup uses ETH, has dynamic pricing, and rewards vote count not just outcome
- Position as complementary, not competing — some users will use both

**Sorare:**
- Sorare users already combine crypto wallets with soccer fandom
- A cross-promotion or integration (e.g., "Sorare players get 10% bonus votes") could be
  mutually beneficial

**Other prediction market protocols:**
- Augur, Gnosis — technical credibility through association
- Co-marketing with other Base sports dApps

---

## 9. Tournament Launch Playbook

When the World Cup group stage begins (June 2026):

1. **Pre-tournament (now → June)**
   - Build email/Farcaster notification list during qualification phase
   - Run a "predict the bracket" contest for the full tournament
   - Publish odds based on on-chain votes, tweet them daily

2. **Opening day**
   - Coordinate simultaneous posts across all channels
   - Target 1,000 wallets in the first 48 hours
   - Run a "first 500 voters" exclusive NFT drop

3. **During the tournament**
   - Every match result = content opportunity
   - "The 47 people who voted on this upset just split X ETH"
   - Keep leaderboard updated and tweet top 3 daily

4. **Knockout stages**
   - Increase Phase 1 windows or run special promotions for high-profile matches
   - Partner with sports media for bracket coverage

---

## 10. Quick Wins (Can Do This Week)

| Action | Effort | Expected Impact |
|--------|--------|-----------------|
| Complete Farcaster mini app listing | Low | High — direct distribution to crypto-native users |
| Add one-click share button post-vote | Low | High — viral loop activation |
| Submit to Base ecosystem directory | Low | Medium — passive discovery |
| Post on r/soccer with a genuine angle | Low | Medium — 17M potential readers |
| Apply for Base grant | Medium | High — funding + ecosystem credibility |
| Reach out to 5 mid-tier soccer crypto influencers | Medium | High — targeted audience |
| Launch a "Predict the Winner" bracket contest | Medium | High — shareable, competitive |
| Write a Decrypt/Defiant pitch | Medium | Medium — brand credibility |

---

## Metrics to Track

- **Wallets connected** (unique users)
- **Votes cast** (engagement depth)
- **ETH in prize pools** (economic signal)
- **Farcaster mini app opens** (social channel performance)
- **Share button clicks** (viral coefficient)
- **Referral conversions** (once referral system is built)
