# Summer Dash Development TODO 🚀

This file tracks the remaining tasks and future features for the Summer Dash Weekly Tournament game.

## 🔴 Priority 0: Critical (Live Launch)
- [ ] **Live Leaderboard Integration**: Replace mock data with a real fetch from the smart contract to show actual player standings.
- [ ] **Live Prize Pool Calculation**: Connect the landing page display to the real $DASH balance in the contract vault.

## 🟠 Priority 1: Competition Polish
- [ ] **Dynamic Tournament Timer**: Sync the "Ends in: Xd" text with the real `tournamentEndTime` from the smart contract.
- [ ] **Immutable Record Verification**: Ensure all `txHash` links on the Profile Page point correctly to the Avalanche Fuji Explorer.

## 🟡 Priority 2: Economy & Customization (The "Later" List)
- [ ] **Jersey Mockup**: Replace "Jersey #04" with a custom T-shirt mockup featuring the player character on it.
- [ ] **Daily Claim UI**: Add the physical button and countdown timer for the daily rewards (Note: Backend logic is already implemented).
- [ ] **Character Shop & Skins**: Implement the ability for players to spend $DASH on Cyber, Gold, and Neon skins.

## 🟢 Priority 3: Security & Scale
- [ ] **Anti-Cheat Logic**: Implement verification layers to ensure high scores are not faked before recording them on-chain.
- [ ] **Team Wallet Automation**: Finalize the automatic withdrawal of the 16% team share at the end of each tournament.

---
*Last Updated: 2026-05-05*
