export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  creator: string;
  creatorAlias?: string;
  title: string;
  description: string;
  category: "Governance" | "Community" | "Grants" | "Tech" | "General";
  options: PollOption[];
  isOpen: boolean;
  totalVotes: number;
  createdAt: number;
  durationDays: number;
  featured?: boolean;
}

export interface UserVoteRecord {
  pollId: number;
  optionId: number;
  timestamp: number;
  txHash?: string;
}

const STORAGE_POLLS_KEY = "sbt_vote_polls_v2";
const STORAGE_SBT_KEY = "sbt_vote_holders_v2";
const STORAGE_USER_VOTES_KEY = "sbt_vote_user_votes_v2";

export const INITIAL_SEED_POLLS: Poll[] = [
  {
    id: 1,
    creator: "GCK7J...E7B9",
    creatorAlias: "Stellar Governance Core",
    title: "Stellar Protocol 22 Feature Priorities: Which ecosystem upgrade should be funded first?",
    description:
      "Proposal to prioritize core Soroban developer ergonomics, gas optimizations for complex contracts, and enhanced multi-sig account abstraction in Protocol 22.",
    category: "Governance",
    options: [
      { id: 1, text: "Soroban Gas & Storage Cost Optimizations", votes: 42 },
      { id: 2, text: "Native Multi-Sig Account Abstraction", votes: 28 },
      { id: 3, text: "Zero-Knowledge State Verifiers", votes: 19 },
    ],
    isOpen: true,
    totalVotes: 89,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    durationDays: 7,
    featured: true,
  },
  {
    id: 2,
    creator: "GBV4T...9KL2",
    creatorAlias: "Ecosystem Grants DAO",
    title: "Allocate 250,000 XLM grant for Open-Source Soroban Web3 Dev Tools",
    description:
      "Vote to approve a milestone-based developer grant supporting open-source IDE plugins, automated contract security scanners, and Rust contract visualizers.",
    category: "Grants",
    options: [
      { id: 1, text: "Approve 250,000 XLM (Full Allocation)", votes: 64 },
      { id: 2, text: "Approve 125,000 XLM (Half Allocation)", votes: 15 },
      { id: 3, text: "Reject Proposal / Revise Milestones", votes: 8 },
    ],
    isOpen: true,
    totalVotes: 87,
    createdAt: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    durationDays: 5,
    featured: true,
  },
  {
    id: 3,
    creator: "GDR8W...3M01",
    creatorAlias: "Soulbound Working Group",
    title: "SBT Identity Standards: Should voter credentials support cross-DAO soulbound badges?",
    description:
      "Standardizing a non-transferable Soulbound Token interface on Stellar so reputation and voting power can be verified across multiple independent DAOs.",
    category: "Tech",
    options: [
      { id: 1, text: "Yes, implement Universal SBT Standard (SEP-compliant)", votes: 53 },
      { id: 2, text: "No, keep SBT credentials isolated per DAO contract", votes: 12 },
    ],
    isOpen: true,
    totalVotes: 65,
    createdAt: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
    durationDays: 14,
    featured: false,
  },
  {
    id: 4,
    creator: "GAX9P...77AA",
    creatorAlias: "Stellar Builders Guild",
    title: "Next Community Hackathon Theme: DeFi Liquidity vs Web3 Social / Identity",
    description:
      "Select the core track theme for the upcoming global Stellar Soroban community hackathon scheduled for next quarter.",
    category: "Community",
    options: [
      { id: 1, text: "DeFi, AMMs, and Cross-Border Liquidity", votes: 31 },
      { id: 2, text: "Decentralized Social & Soulbound Identity", votes: 39 },
      { id: 3, text: "Real-World Asset (RWA) Tokenization", votes: 24 },
    ],
    isOpen: true,
    totalVotes: 94,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    durationDays: 3,
    featured: false,
  },
];

export function getStoredPolls(): Poll[] {
  if (typeof window === "undefined") return INITIAL_SEED_POLLS;
  try {
    const raw = localStorage.getItem(STORAGE_POLLS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_POLLS_KEY, JSON.stringify(INITIAL_SEED_POLLS));
      return INITIAL_SEED_POLLS;
    }
    const parsed: Poll[] = JSON.parse(raw);
    return parsed.length > 0 ? parsed : INITIAL_SEED_POLLS;
  } catch {
    return INITIAL_SEED_POLLS;
  }
}

export function saveStoredPolls(polls: Poll[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_POLLS_KEY, JSON.stringify(polls));
  } catch (err) {
    console.error("Failed to save polls:", err);
  }
}

export function createStoredPoll(data: {
  creator: string;
  creatorAlias?: string;
  title: string;
  description: string;
  category: "Governance" | "Community" | "Grants" | "Tech" | "General";
  options: string[];
  durationDays: number;
}): Poll {
  const currentPolls = getStoredPolls();
  const nextId = currentPolls.length > 0 ? Math.max(...currentPolls.map((p) => p.id)) + 1 : 1;

  const newPoll: Poll = {
    id: nextId,
    creator: data.creator,
    creatorAlias: data.creatorAlias || `${data.creator.slice(0, 4)}...${data.creator.slice(-4)}`,
    title: data.title,
    description: data.description,
    category: data.category,
    options: data.options.map((text, idx) => ({
      id: idx + 1,
      text,
      votes: 0,
    })),
    isOpen: true,
    totalVotes: 0,
    createdAt: Date.now(),
    durationDays: data.durationDays,
    featured: false,
  };

  const updated = [newPoll, ...currentPolls];
  saveStoredPolls(updated);
  return newPoll;
}

export function castStoredVote(
  pollId: number,
  optionId: number,
  voterAddress: string
): { success: boolean; poll?: Poll; error?: string } {
  if (!hasStoredSbt(voterAddress)) {
    return {
      success: false,
      error: "You need a Soulbound Token (SBT) Voter ID to cast a vote.",
    };
  }

  const userVotes = getStoredUserVotes(voterAddress);
  if (userVotes.some((v) => v.pollId === pollId)) {
    return {
      success: false,
      error: "You have already voted on this poll (1-person-1-vote).",
    };
  }

  const polls = getStoredPolls();
  const pollIndex = polls.findIndex((p) => p.id === pollId);
  if (pollIndex === -1) {
    return { success: false, error: "Poll not found." };
  }

  const poll = { ...polls[pollIndex] };
  if (!poll.isOpen) {
    return { success: false, error: "This poll is closed." };
  }

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) {
    return { success: false, error: "Invalid option selected." };
  }

  // Update option votes
  poll.options = poll.options.map((opt) =>
    opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
  );
  poll.totalVotes += 1;

  polls[pollIndex] = poll;
  saveStoredPolls(polls);

  // Record user vote
  const newVote: UserVoteRecord = {
    pollId,
    optionId,
    timestamp: Date.now(),
  };
  saveStoredUserVotes(voterAddress, [...userVotes, newVote]);

  return { success: true, poll };
}

export function getStoredUserVotes(voterAddress: string): UserVoteRecord[] {
  if (typeof window === "undefined" || !voterAddress) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_USER_VOTES_KEY}_${voterAddress}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUserVotes(voterAddress: string, votes: UserVoteRecord[]) {
  if (typeof window === "undefined" || !voterAddress) return;
  try {
    localStorage.setItem(
      `${STORAGE_USER_VOTES_KEY}_${voterAddress}`,
      JSON.stringify(votes)
    );
  } catch (err) {
    console.error("Failed to save user votes:", err);
  }
}

export function hasStoredSbt(voterAddress: string): boolean {
  if (typeof window === "undefined" || !voterAddress) return false;
  try {
    const raw = localStorage.getItem(STORAGE_SBT_KEY);
    const holders: string[] = raw ? JSON.parse(raw) : [];
    return holders.includes(voterAddress);
  } catch {
    return false;
  }
}

export function claimStoredSbt(voterAddress: string): boolean {
  if (typeof window === "undefined" || !voterAddress) return false;
  try {
    const raw = localStorage.getItem(STORAGE_SBT_KEY);
    const holders: string[] = raw ? JSON.parse(raw) : [];
    if (!holders.includes(voterAddress)) {
      holders.push(voterAddress);
      localStorage.setItem(STORAGE_SBT_KEY, JSON.stringify(holders));
    }
    return true;
  } catch {
    return false;
  }
}

export function toggleStoredPollStatus(
  pollId: number,
  callerAddress: string
): { success: boolean; poll?: Poll; error?: string } {
  const polls = getStoredPolls();
  const pollIndex = polls.findIndex((p) => p.id === pollId);
  if (pollIndex === -1) return { success: false, error: "Poll not found" };

  const poll = { ...polls[pollIndex] };
  if (poll.creator !== callerAddress && !callerAddress.startsWith("G")) {
    return { success: false, error: "Unauthorized" };
  }

  poll.isOpen = !poll.isOpen;
  polls[pollIndex] = poll;
  saveStoredPolls(polls);

  return { success: true, poll };
}
