/**
 * WorldCupQualification – Base Sepolia Integration Test
 *
 * Flow:
 *   1. Deploy with a 10-minute voting window
 *   2. Vote 1 on each of 48 countries (deployer pays ~0.048 ETH + gas)
 *   3. Wait for voting period to end (polls every 15 s)
 *   4. Confirm a vote is rejected after the window closes
 *   5. Finalize qualification (top 48 by votes)
 *   6. Claim deployer earnings
 *   7. Sweep any residual ETH
 *
 * Usage:
 *   npx hardhat run scripts/test-qualification-sepolia.js --network baseSepolia
 *
 * Requirements:
 *   - PRIVATE_KEY set in apps/app/.env.local
 *   - Deployer wallet funded with ~0.1 ETH on Base Sepolia
 */

const hre = require("hardhat");
const COUNTRIES = require("../data/countries.json");

// ─── helpers ────────────────────────────────────────────────────────────────

/** Convert a UTF-8 string to a right-zero-padded bytes8 hex string. */
function toBytes8(str) {
  const bytes = Buffer.from(str, "utf8");
  const padded = Buffer.alloc(8);
  bytes.copy(padded, 0, 0, Math.min(bytes.length, 8));
  return "0x" + padded.toString("hex");
}

/** Decode a bytes8 hex string back to a UTF-8 string (strips null bytes). */
function fromBytes8(hex) {
  return Buffer.from(hex.slice(2), "hex").toString("utf8").replace(/\0/g, "");
}

/** Sleep for `ms` milliseconds. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll until the latest block timestamp is >= targetTimestamp. */
async function waitUntilTimestamp(provider, targetTimestamp, label) {
  const POLL_INTERVAL_MS = 15_000;
  process.stdout.write(`\n⏳ Waiting for ${label}...\n`);
  while (true) {
    const block = await provider.getBlock("latest");
    const remaining = targetTimestamp - block.timestamp;
    if (remaining <= 0) {
      process.stdout.write("   ✅ Done.\n\n");
      break;
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    process.stdout.write(`\r   ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s remaining…`);
    await sleep(POLL_INTERVAL_MS);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider;

  const sep = "=".repeat(60);
  console.log(sep);
  console.log("  Onchain World Cup – Qualification Integration Test");
  console.log(sep);
  console.log("Network  :", hre.network.name);
  console.log("Deployer :", deployer.address);
  console.log(
    "Balance  :",
    ethers.formatEther(await provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // ── 1. Prepare 48 countries ─────────────────────────────────────────────
  const countries48 = COUNTRIES.slice(0, 48);
  const countryBytes8 = countries48.map((c) => toBytes8(c.code));
  console.log(`📋 Using ${countries48.length} countries (first 48 from countries.json)`);

  // ── Resume mode: attach to an existing contract ────────────────────────
  // Set RESUME_CONTRACT=<address> to skip deploy/vote/wait and jump straight
  // to the vote-rejection test, finalization, claim, and sweep.
  const resumeAddress = process.env.RESUME_CONTRACT;

  const WorldCupQualification = await ethers.getContractFactory("WorldCupQualification");
  let qualification;
  let contractAddress;

  if (resumeAddress) {
    console.log("\n⏩ Resume mode — attaching to existing contract:", resumeAddress);
    qualification = WorldCupQualification.attach(resumeAddress);
    contractAddress = resumeAddress;
  } else {
    // ── 2. Deploy ─────────────────────────────────────────────────────────
    console.log("\n" + sep);
    console.log("  1 / 7  Deploy WorldCupQualification");
    console.log(sep);

    const now = Math.floor(Date.now() / 1000);
    const START_BUFFER = 30; // seconds until voting opens (lets the deploy tx confirm)
    const VOTING_DURATION = 10 * 60; // 10 minutes

    const startTime = now + START_BUFFER;
    const endTime = startTime + VOTING_DURATION;

    qualification = await WorldCupQualification.deploy(
      startTime,
      endTime,
      deployer.address, // feeRecipient
      countryBytes8,
      1000             // 10% platform fee (basis points)
    );
    await qualification.waitForDeployment();
    contractAddress = await qualification.getAddress();

    console.log("✅ Deployed to   :", contractAddress);
    console.log("   Voting opens  :", new Date(startTime * 1000).toISOString());
    console.log("   Voting closes :", new Date(endTime * 1000).toISOString());

    // ── 3. Vote 1 on each of 48 countries ──────────────────────────────────
    console.log("\n" + sep);
    console.log("  2 / 7  Placing 48 Votes");
    console.log(sep);

    // Wait for voting window to open
    await waitUntilTimestamp(provider, startTime, "voting window to open");

    // Track nonce manually to avoid "replacement transaction underpriced" when
    // sending many transactions in quick succession from the same account.
    let nonce = await provider.getTransactionCount(deployer.address, "pending");

    let totalSpent = 0n;
    for (let i = 0; i < countryBytes8.length; i++) {
      const country = countryBytes8[i];
      const name = countries48[i].name;
      const code = countries48[i].code;
      const cost = await qualification.calculateVoteCost(country, 1);

      const tx = await qualification.vote(country, 1, ethers.ZeroAddress, {
        value: cost,
        nonce: nonce++,
      });
      await tx.wait();
      totalSpent += cost;

      console.log(
        `  [${String(i + 1).padStart(2, " ")}/48]  ${code.padEnd(8)}  ${name.padEnd(32)}  ${ethers.formatEther(cost)} ETH`
      );

      await sleep(2000); // 2 s between votes to avoid mempool congestion
    }

    const prizePool = await qualification.totalPrizePool();
    const platformFees = await qualification.totalPlatformFeesCollected();
    console.log("\n  Total spent (votes) :", ethers.formatEther(totalSpent), "ETH");
    console.log("  Prize pool          :", ethers.formatEther(prizePool), "ETH");
    console.log("  Platform fees       :", ethers.formatEther(platformFees), "ETH");

    // ── 4. Wait for voting period to end ─────────────────────────────────
    console.log("\n" + sep);
    console.log("  3 / 7  Wait for Voting Period to End");
    console.log(sep);

    await waitUntilTimestamp(provider, endTime, "voting period to end");
  }

  // ── 5. Confirm vote is rejected after window closes ─────────────────────
  console.log(sep);
  console.log("  4 / 7  Test Vote Rejection After Window");
  console.log(sep);

  try {
    const cost = await qualification.calculateVoteCost(countryBytes8[0], 1).catch(() => ethers.parseEther("0.001"));
    await qualification.vote(countryBytes8[0], 1, ethers.ZeroAddress, {
      value: cost,
    });
    console.log("❌ FAIL : Vote should have been rejected after voting ended");
    process.exitCode = 1;
  } catch (err) {
    const msg = (err.message ?? "").toLowerCase();
    if (msg.includes("qualification ended")) {
      console.log('✅ PASS : Vote correctly rejected — "Qualification ended"');
    } else {
      // Some RPC providers wrap the revert differently; check for revert keyword
      const isRevert = msg.includes("revert") || msg.includes("execution reverted");
      if (isRevert) {
        console.log("✅ PASS : Vote correctly reverted (raw message):", err.message.slice(0, 120));
      } else {
        console.log("⚠️  UNEXPECTED error:", err.message.slice(0, 160));
      }
    }
  }

  // ── 6. Finalize qualification ───────────────────────────────────────────
  console.log("\n" + sep);
  console.log("  5 / 7  Finalize Qualification");
  console.log(sep);

  const alreadyFinalized = await qualification.qualificationFinalized();
  let qualifiedList = [];

  if (alreadyFinalized) {
    console.log("ℹ️  Already finalized — reading QualificationFinalized event from logs\n");
    // Base Sepolia RPC limits eth_getLogs to a 10,000 block range.
    // Query the last 5,000 blocks (~2.5 hours at ~2s/block) — enough since
    // the contract was just deployed.
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 5000);
    const filter = qualification.filters.QualificationFinalized();
    const events = await qualification.queryFilter(filter, fromBlock, currentBlock);
    qualifiedList = events[0]?.args?.[0] ?? [];
  } else {
    const finalizeTx = await qualification.finalizeQualification();
    const finalizeReceipt = await finalizeTx.wait();
    // Read qualified countries from the QualificationFinalized event in the
    // receipt — avoids unreliable staticCalls on bytes8[] array getters via RPC.
    const finalizedEvent = finalizeReceipt.logs
      .map((log) => { try { return qualification.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "QualificationFinalized");
    qualifiedList = finalizedEvent?.args?.[0] ?? [];
  }
  console.log("✅ Finalized\n");

  console.log(`🏆 Qualified countries (${qualifiedList.length} spots):`);
  for (let i = 0; i < qualifiedList.length; i++) {
    const hex = qualifiedList[i];
    const code = fromBytes8(hex);
    const entry = COUNTRIES.find((c) => c.code === code);
    console.log(
      `  ${String(i + 1).padStart(2, " ")}. ${code.padEnd(8)}  ${(entry?.name ?? "").padEnd(32)}`
    );
  }

  // ── 7. Claim earnings ───────────────────────────────────────────────────
  console.log("\n" + sep);
  console.log("  6 / 7  Claim Earnings");
  console.log(sep);

  const claimableAmount = await qualification.claimable(deployer.address);
  console.log("Claimable :", ethers.formatEther(claimableAmount), "ETH");

  if (claimableAmount > 0n) {
    const claimTx = await qualification.claim();
    await claimTx.wait();
    console.log("✅ Claimed :", ethers.formatEther(claimableAmount), "ETH");
  } else {
    console.log("ℹ️  Nothing to claim");
  }

  // ── 8. Sweep residual ───────────────────────────────────────────────────
  console.log("\n" + sep);
  console.log("  7 / 7  Sweep Residual ETH");
  console.log(sep);

  const residual = await provider.getBalance(contractAddress);
  console.log("Contract balance :", ethers.formatEther(residual), "ETH");

  if (residual > 0n) {
    try {
      const sweepTx = await qualification.sweepResidual();
      await sweepTx.wait();
      console.log("✅ Swept", ethers.formatEther(residual), "ETH → fee recipient");
    } catch (err) {
      // Balance can appear non-zero due to RPC caching while a pending claim tx
      // has already drained the contract — treat "No residual" as the empty case.
      if ((err.message ?? "").toLowerCase().includes("no residual")) {
        console.log("ℹ️  No residual to sweep (contract drained by claim)");
      } else {
        throw err;
      }
    }
  } else {
    console.log("ℹ️  No residual to sweep (expected when sole voter claims 100%)");
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n" + sep);
  console.log("  All steps complete ✅");
  console.log(sep);
  console.log("Contract        :", contractAddress);
  console.log(
    "Final balance   :",
    ethers.formatEther(await provider.getBalance(deployer.address)),
    "ETH"
  );
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error("\n❌ Script failed:", err);
    process.exit(1);
  });
