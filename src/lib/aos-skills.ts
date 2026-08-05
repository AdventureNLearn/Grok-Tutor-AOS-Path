/**
 * Educational thinking tools mapped from the public Adventure OS library.
 * Display copy is learner-facing. Internal ids stay stable for tutoring logic.
 */

export type SkillCategory =
  | "core"
  | "civic"
  | "content"
  | "visual"
  | "specialized"
  | "narrative";

export type TutorMode =
  | "explain"
  | "socratic"
  | "practice"
  | "quiz"
  | "scenario"
  | "career";

export type AosSkill = {
  id: string;
  name: string;
  category: SkillCategory;
  path: string;
  purpose: string;
  tutorRole: string;
  lensPrompt: string;
  /** Natural way a learner can ask for this approach */
  askPrompt: string;
  goodFor: string[];
  industries: string[];
  tutorEnabled: boolean;
  tier: "foundation" | "analysis" | "domain" | "reference";
  tierLabel: string;
};

export const SKILL_CATEGORIES: {
  id: SkillCategory;
  label: string;
  summary: string;
}[] = [
  {
    id: "core",
    label: "Clear thinking",
    summary: "Habits that keep answers honest: evidence, structure, and staying on mission.",
  },
  {
    id: "narrative",
    label: "Reading the room",
    summary: "Spot framing, spin, and emotional pressure in news and online stories.",
  },
  {
    id: "civic",
    label: "Public & civic work",
    summary: "Permits, records, jurisdictions, construction oversight, and public accountability.",
  },
  {
    id: "content",
    label: "Explaining well",
    summary: "Turn messy knowledge into clear lessons, study plans, and materials people can use.",
  },
  {
    id: "visual",
    label: "Seeing structure",
    summary: "Maps, visual hierarchy, and spatial thinking for design and field work.",
  },
  {
    id: "specialized",
    label: "Craft & practice",
    summary: "Reporting, security hygiene, reasoning drills, and independent professional habits.",
  },
];

const TIER: Record<AosSkill["tier"], string> = {
  foundation: "Start here",
  analysis: "Sharpen judgment",
  domain: "Field craft",
  reference: "Go deeper",
};

function skill(
  partial: Omit<AosSkill, "tierLabel" | "tutorEnabled"> & { tutorEnabled?: boolean },
): AosSkill {
  return {
    tutorEnabled: partial.tutorEnabled ?? true,
    tierLabel: TIER[partial.tier],
    ...partial,
  };
}

export const AOS_SKILLS: AosSkill[] = [
  skill({
    id: "sovereign-lens",
    name: "Sovereign Lens",
    category: "core",
    path: "skills/core/sovereign-lens",
    purpose: "A calm, full-picture way to approach hard questions before jumping to answers.",
    tutorRole: "Helps the tutor sort what matters, check the evidence, and stay coherent.",
    lensPrompt:
      "Apply Sovereign Lens as a tutoring overlay: clarify scope and intent, require evidence strength, flag narrative risk, label tri-state claims, and keep output auditable. Route sub-questions to the right educational frame before answering.",
    askPrompt: "Help me look at this carefully from every important angle before we decide anything.",
    goodFor: ["Complex topics", "High-stakes trades", "Mixed sources"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "evidence-gate",
    name: "Evidence Gate",
    category: "core",
    path: "skills/core/evidence-gate",
    purpose: "Separate what we know, what we infer, and what we are only guessing.",
    tutorRole: "Stops overclaiming and teaches clean claim hygiene in every mode.",
    lensPrompt:
      "Act as Evidence-Gate in tutoring mode. For every major claim: label Evidence, Inference, or Assumption; note source strength; assign confidence; apply tri-state +1/0/-1; surface conflicts. Never present inference as evidence.",
    askPrompt: "Label each important claim as evidence, inference, or assumption — and say how sure we are.",
    goodFor: ["Quizzes", "Research habits", "Safety-critical trades"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "shatter-protocol",
    name: "Assumption Check",
    category: "core",
    path: "skills/core/shatter-protocol",
    purpose: "Surface weak framing and false certainty so the real question can surface.",
    tutorRole: "Clears fog before teaching so you learn the topic as it really is.",
    lensPrompt:
      "Before teaching, surface hidden assumptions, false dichotomies, and weak framing. Then teach with that clearer picture.",
    askPrompt: "Check my assumptions and any weak framing before you teach this.",
    goodFor: ["Contested topics", "Media claims", "Root-cause work"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "4-agent-orchestration",
    name: "Four-Role Team",
    category: "core",
    path: "skills/core/4-agent-orchestration",
    purpose: "Split hard work into coordinate → research → check → deliver.",
    tutorRole: "Structures deep practice so complex lessons do not collapse into one messy answer.",
    lensPrompt:
      "Use 4-Agent Orchestration for this lesson: Agent1 coordinates and synthesizes; Agent2 researches/structures content; Agent3 verifies claims (evidence-gate); Agent4 delivers clear learner-facing output. Keep a short working-doc of decisions and open questions.",
    askPrompt: "Walk this as a four-role team: plan, research, verify, then teach me the result.",
    goodFor: ["Projects", "Capstones", "Multi-step scenarios"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "working-doc-manager",
    name: "Working Notebook",
    category: "core",
    path: "skills/core/working-doc-manager",
    purpose: "Keep decisions, open questions, and notes durable across a long session.",
    tutorRole: "Turns tutoring into a living notebook you can return to.",
    lensPrompt:
      "Maintain a compact working document: Goals, Decisions (verbatim), Open questions, Evidence log, Next steps. Update it after each substantial turn. Show the learner a brief 'session log' when useful.",
    askPrompt: "Keep a short session notebook of goals, decisions, and open questions as we go.",
    goodFor: ["Long sessions", "Career planning", "Projects"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "mission-spine-guard",
    name: "Mission Spine",
    category: "core",
    path: "skills/core/mission-spine-guard",
    purpose: "Stay true to the learning goal and safety standards when conversation drifts.",
    tutorRole: "Gently re-anchors the lesson when you wander or standards start to soften.",
    lensPrompt:
      "Guard the learning mission spine: truth-seeking, safety-first for trades, and the learner's stated goal. Flag drift, softening of standards, or topic wandering; re-anchor to objectives.",
    askPrompt: "Keep us on my real goal and do not let the standards slide.",
    goodFor: ["Long arcs", "Career path", "Ethics"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "values-alignment-check",
    name: "Integrity Check",
    category: "core",
    path: "skills/core/values-alignment-check",
    purpose: "A final pass for fairness, honesty, and not soft-pedaling real hazards.",
    tutorRole: "End-of-lesson integrity pass on high-stakes material.",
    lensPrompt:
      "Run a values-alignment check on the teaching output: fairness, non-manipulation, safety, and honesty. Correct any soft-pedaling of hazards or overclaiming.",
    askPrompt: "Do a final integrity check on what we just learned — especially safety and honesty.",
    goodFor: ["Safety modules", "Ethics", "Public-interest topics"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "xai-reflection",
    name: "Reflect & Improve",
    category: "core",
    path: "skills/core/xai-reflection",
    purpose: "Build the habit of asking what could be wrong and what is missing.",
    tutorRole: "Adds a short reflection after strong answers so learning sticks.",
    lensPrompt:
      "After each substantial answer, include a short reflection: what could be wrong, what evidence is missing, and one better follow-up question for the learner.",
    askPrompt: "After you answer, tell me what could be wrong and one better question I should ask next.",
    goodFor: ["Advanced learners", "Debugging thinking", "Review habits"],
    industries: ["software", "data", "cybersecurity"],
    tier: "analysis",
  }),
  skill({
    id: "evenhandedness-illusion-breaker",
    name: "False Balance Breaker",
    category: "core",
    path: "skills/core/evenhandedness-illusion-breaker",
    purpose: "Avoid pretending both sides are equal when the evidence is not.",
    tutorRole: "Weights teaching to the evidence — not manufactured neutrality.",
    lensPrompt:
      "Break false evenhandedness. Present proportional weight to evidence strength. If one side is weakly supported, say so plainly without manufactured balance.",
    askPrompt: "Do not force a false both-sides balance. Weight this by evidence strength.",
    goodFor: ["Media literacy", "Science claims", "Policy basics"],
    industries: ["media-literacy", "law-enforcement", "teaching"],
    tier: "analysis",
  }),
  skill({
    id: "psyop-narrative-detector",
    name: "Narrative Detector",
    category: "narrative",
    path: ".grok/skills/psyop-narrative-detector",
    purpose: "Score how engineered a story looks across ten clear categories — for media literacy.",
    tutorRole: "Teaches you to read framing, omission, and emotional pressure in public stories.",
    lensPrompt:
      "Apply careful narrative analysis for media literacy. Score framing and source strength when useful. Teach how to read framing, omission, and source concentration. Stay educational.",
    askPrompt: "Analyze this story for framing, omission, and engineered pressure. Teach me what to watch for.",
    goodFor: ["News analysis", "Online campaigns", "Rhetoric class"],
    industries: ["media-literacy", "teaching", "law-enforcement"],
    tier: "analysis",
  }),
  skill({
    id: "civic-intelligence-coordinator",
    name: "Civic Coordinator",
    category: "civic",
    path: "skills/civic-intelligence/civic-intelligence-coordinator",
    purpose: "Guide civic and public-interest learning from question to the right tools.",
    tutorRole: "Hub for civic intelligence lessons: records, permits, oversight, and clarity.",
    lensPrompt:
      "Coordinate civic intelligence tutoring: map the learner's question to jurisdiction, records, permits, and oversight tools. Prefer primary sources and transparent uncertainty.",
    askPrompt: "Help me work this civic case: who has authority, what records matter, and what we can actually know.",
    goodFor: ["Civic track", "Oversight projects", "Permit education"],
    industries: ["civic-intelligence", "construction", "law-enforcement"],
    tier: "domain",
  }),
  skill({
    id: "permit-coordinator",
    name: "Permit Pathways",
    category: "civic",
    path: "skills/civic-intelligence/permit-coordinator",
    purpose: "Learn how regulatory pathways usually work by industry and place — education, not legal advice.",
    tutorRole: "Maps permit-style journeys without inventing local code sections.",
    lensPrompt:
      "Teach permit pathway reasoning: jurisdiction, agency map, application steps, common failure modes. Label what is general education vs jurisdiction-specific. Never invent local code sections.",
    askPrompt: "Walk me through a typical permit pathway for this work and where people usually get stuck.",
    goodFor: ["Construction", "Licensing concepts", "Civic ops"],
    industries: ["construction", "electrical", "plumbing", "hvac", "civic-intelligence"],
    tier: "domain",
  }),
  skill({
    id: "jurisdiction-ops",
    name: "Who Has Authority",
    category: "civic",
    path: "skills/civic-intelligence/jurisdiction-ops",
    purpose: "Understand stacked layers of authority: federal, state, local, and special districts.",
    tutorRole: "Teaches how power and records flow across layers of government.",
    lensPrompt:
      "Explain jurisdictional layers (federal/state/local/special districts) relevant to the learner's question. Show how authority and records flow. Flag unknowns explicitly.",
    askPrompt: "Explain which layer of authority owns this, and what that means for records and decisions.",
    goodFor: ["CDL context", "Utilities", "Civic work"],
    industries: ["civic-intelligence", "cdl", "energy", "construction"],
    tier: "domain",
  }),
  skill({
    id: "public-records-forensics",
    name: "Reading Public Records",
    category: "civic",
    path: "skills/civic-intelligence/public-records-forensics",
    purpose: "How to read permits, contracts, and minutes carefully and honestly.",
    tutorRole: "Teaches method and red flags — not illegal access or harassment.",
    lensPrompt:
      "Teach public-records analysis methods: what documents exist, how to read them carefully, what gaps look like, and how to cite. Public, lawful learning only.",
    askPrompt: "Teach me how to read this kind of public record and what to watch for.",
    goodFor: ["Oversight kits", "Investigative literacy", "Accounting trails"],
    industries: ["civic-intelligence", "accounting", "law-enforcement"],
    tier: "domain",
  }),
  skill({
    id: "oversight-kit-builder",
    name: "Oversight Kit",
    category: "civic",
    path: "skills/civic-intelligence/oversight-kit-builder",
    purpose: "Build a clean package of sources, gaps, and findings for accountability learning.",
    tutorRole: "Project mode: assemble a study-ready audit kit structure.",
    lensPrompt:
      "Help the learner build an oversight kit structure: inventory of sources, chain of custody for claims, gap list, and presentation outline. Educational template only.",
    askPrompt: "Help me build an oversight kit: sources, claim chain, gaps, and how to present it.",
    goodFor: ["Capstones", "Civic projects", "QA audits"],
    industries: ["civic-intelligence", "quality", "project-management"],
    tier: "domain",
  }),
  skill({
    id: "influence-mapping-analyst",
    name: "Influence Mapping",
    category: "civic",
    path: "skills/civic-intelligence/influence-mapping-analyst",
    purpose: "Map organizations and relationships with evidence on every link.",
    tutorRole: "Network thinking for public interest — no private targeting.",
    lensPrompt:
      "Teach influence-mapping as an analytical skill: organizations, relationships, money and authority flows, with evidence for each link. Public information norms only.",
    askPrompt: "Map the public relationships and influence lines here, with evidence for each link.",
    goodFor: ["Civic intelligence", "Policy literacy", "Org analysis"],
    industries: ["civic-intelligence", "media-literacy", "project-management"],
    tier: "domain",
  }),
  skill({
    id: "construction-oversight",
    name: "Jobsite Oversight",
    category: "civic",
    path: "skills/civic-intelligence/construction-oversight",
    purpose: "See construction work through compliance, documentation, and life-safety.",
    tutorRole: "Pairs with trades tutoring for a compliance and quality mindset.",
    lensPrompt:
      "Teach construction oversight concepts: inspections, common noncompliance patterns, documentation quality, and safety. Emphasize codes as life-safety systems. Not a substitute for licensed PE/inspector judgment.",
    askPrompt: "Coach me on what good jobsite oversight looks like for this situation.",
    goodFor: ["Jobsite scenarios", "QC", "Trades safety"],
    industries: ["construction", "electrical", "plumbing", "hvac", "carpentry", "welding"],
    tier: "domain",
  }),
  skill({
    id: "regulatory-routing-engine",
    name: "Regulatory Compass",
    category: "civic",
    path: "skills/civic-intelligence/regulatory-routing-engine",
    purpose: "Point a regulatory question toward the right kind of agency and document type.",
    tutorRole: "Helps you find the right educational frame when rules feel tangled.",
    lensPrompt:
      "Route the learner's regulatory question to the correct educational frame (agency type, statute vs rule vs guidance, appeal paths). State uncertainty when jurisdiction is unknown.",
    askPrompt: "Where should I look first for this kind of rule, and what kind of document am I hunting?",
    goodFor: ["Permit questions", "Licensing concepts", "Utilities"],
    industries: ["civic-intelligence", "energy", "construction"],
    tier: "domain",
  }),
  skill({
    id: "assessor-enrichment",
    name: "Parcel & Assessor Literacy",
    category: "civic",
    path: "skills/civic-intelligence/assessor-enrichment",
    purpose: "Read property and assessor-style public data without overclaiming.",
    tutorRole: "Teaches careful interpretation of parcel-style fields and pitfalls.",
    lensPrompt:
      "Teach how to interpret public assessor/parcel-style data fields, common pitfalls, and how claims should be evidence-labeled. Educational only.",
    askPrompt: "Help me read this parcel/assessor-style information carefully and label what we can claim.",
    goodFor: ["Civic data literacy", "Real property concepts"],
    industries: ["civic-intelligence", "accounting"],
    tier: "domain",
  }),
  skill({
    id: "crash-data-gate",
    name: "Incident Data Discipline",
    category: "civic",
    path: "skills/civic-intelligence/crash-data-gate",
    purpose: "Handle crash and incident data with honest limits, missingness, and bias.",
    tutorRole: "Statistics literacy for public-safety style datasets.",
    lensPrompt:
      "Apply crash-data-gate style discipline: define fields, missingness, selection bias, and what conclusions the data can and cannot support. Educational statistics literacy.",
    askPrompt: "Teach me what this incident dataset can and cannot support as a conclusion.",
    goodFor: ["Data literacy", "Public safety education"],
    industries: ["data", "civic-intelligence", "law-enforcement", "cdl"],
    tier: "domain",
  }),
  skill({
    id: "state-onboarding-playbook",
    name: "New Place Guide",
    category: "civic",
    path: "skills/civic-intelligence/state-onboarding-playbook",
    purpose: "Build a study pack when you are learning a new state or jurisdiction.",
    tutorRole: "Template for agencies, open data, and records norms in a new place.",
    lensPrompt:
      "Help the learner build a state/jurisdiction onboarding study pack: agencies, primary statutes, open data portals, records request norms. Template-driven education.",
    askPrompt: "Help me build a learning pack for this state/jurisdiction: agencies, statutes, open data.",
    goodFor: ["Civic ops", "Relocating professionals", "Researchers"],
    industries: ["civic-intelligence", "project-management"],
    tier: "domain",
  }),
  skill({
    id: "vft-thread-influence-mapping",
    name: "Conversation Dynamics",
    category: "civic",
    path: "skills/civic-intelligence/vft-thread-influence-mapping",
    purpose: "See how ideas amplify in threads and public conversations.",
    tutorRole: "Discourse analysis for media literacy — not pile-ons.",
    lensPrompt:
      "Teach thread influence mapping: key actors, amplification patterns, claim provenance. Educational discourse analysis only.",
    askPrompt: "Map how this conversation spreads and who amplifies which claims.",
    goodFor: ["Media literacy", "Online discourse study"],
    industries: ["media-literacy", "civic-intelligence"],
    tier: "domain",
  }),
  skill({
    id: "content-ops",
    name: "Clear Delivery",
    category: "content",
    path: "skills/content/content-ops",
    purpose: "Make explanations scannable, accurate, and useful — without hype.",
    tutorRole: "Improves how lessons and study materials land for real people.",
    lensPrompt:
      "Apply content-ops: structure the explanation for scanability, accuracy, and actionability. Prefer plain language. No hype.",
    askPrompt: "Rewrite this lesson so it is plain, scannable, and something I can act on.",
    goodFor: ["Explain mode", "Study guides", "Professional writing"],
    industries: ["teaching", "sales", "video", "hospitality"],
    tier: "domain",
  }),
  skill({
    id: "content-systems-architect",
    name: "Learning Path Design",
    category: "content",
    path: "skills/content/content-systems-architect",
    purpose: "Design modules, checkpoints, and spaced practice that actually build skill.",
    tutorRole: "Curriculum partner for career mode and teachers.",
    lensPrompt:
      "Design a learning system: modules, prerequisites, assessment checkpoints, and spaced practice. Keep it modular and measurable.",
    askPrompt: "Design a learning path with modules, checkpoints, and practice I can stick to.",
    goodFor: ["Career path", "Course design", "Teaching track"],
    industries: ["teaching", "project-management", "software"],
    tier: "domain",
  }),
  skill({
    id: "visual-systems-architect",
    name: "Visual Systems",
    category: "visual",
    path: "skills/visual/visual-systems-architect",
    purpose: "Hierarchy, type, spacing, and critique that improve real visual work.",
    tutorRole: "Design and dashboard lessons with concrete, fixable notes.",
    lensPrompt:
      "Teach visual systems: hierarchy, spacing, type, contrast, component consistency. Critique with concrete, fixable notes.",
    askPrompt: "Critique this visual work and teach me the system behind a better hierarchy.",
    goodFor: ["Design", "Dashboards", "Slides"],
    industries: ["design", "video", "software"],
    tier: "domain",
  }),
  skill({
    id: "gis-layer",
    name: "Map Layers",
    category: "visual",
    path: "skills/visual/gis-layer",
    purpose: "Think in layers: basemap, themes, joins, and honest spatial claims.",
    tutorRole: "Spatial reasoning for civic, logistics, and field contexts.",
    lensPrompt:
      "Teach GIS layer thinking: basemap vs thematic layers, join keys, projection caveats, and claim discipline for spatial conclusions.",
    askPrompt: "Teach me how to think in map layers for this problem, including what I should not overclaim.",
    goodFor: ["Civic mapping", "Utilities", "Logistics"],
    industries: ["civic-intelligence", "logistics", "energy", "agriculture"],
    tier: "domain",
  }),
  skill({
    id: "glyphos",
    name: "Simple Symbol Sets",
    category: "visual",
    path: "skills/visual/glyphos",
    purpose: "Compress recurring ideas into a small, defined symbol set when it helps learning.",
    tutorRole: "Optional advanced notation for systems thinkers.",
    lensPrompt:
      "When useful, introduce simple symbolic encoding to compress recurring concepts for the learner. Keep symbols minimal and defined.",
    askPrompt: "If it helps, invent a tiny symbol set for the key ideas in this domain and teach me it.",
    goodFor: ["Advanced learners", "System design"],
    industries: ["design", "software", "teaching"],
    tier: "reference",
  }),
  skill({
    id: "reasoning-architect",
    name: "Reasoning Structure",
    category: "specialized",
    path: "skills/specialized/reasoning-architect",
    purpose: "Show premises, inferences, alternatives, and failure modes step by step.",
    tutorRole: "Powers Socratic and practice modes for deep thinking.",
    lensPrompt:
      "Architect the reasoning: premises, inferences, alternatives, failure modes. Prefer step-by-step learner-visible structure over final answers alone.",
    askPrompt: "Show me the reasoning structure — premises, alternatives, and where I could be wrong.",
    goodFor: ["Socratic", "Practice", "Software & data"],
    industries: ["software", "data", "teaching", "project-management"],
    tier: "analysis",
  }),
  skill({
    id: "anti-pattern-scanner",
    name: "Anti-Pattern Finder",
    category: "specialized",
    path: "skills/specialized/anti-pattern-scanner",
    purpose: "Name recurring failure patterns and give a concrete fix.",
    tutorRole: "Code, process, and thinking review with blunt kindness.",
    lensPrompt:
      "Scan for anti-patterns in the learner's approach or the material. Name the pattern, why it fails, and a concrete fix. Educational critique only.",
    askPrompt: "Find the anti-patterns in my approach and give me one concrete fix each.",
    goodFor: ["Code review", "Process design", "Media patterns"],
    industries: ["software", "quality", "media-literacy", "project-management"],
    tier: "analysis",
  }),
  skill({
    id: "report-operator",
    name: "Professional Reports",
    category: "specialized",
    path: "skills/specialized/report-operator",
    purpose: "Write clear, evidence-based reports with limits and recommendations.",
    tutorRole: "Report craft across trades, EMS, QA, and civic work.",
    lensPrompt:
      "Teach and produce educational report structure: summary, method, findings with tri-state, limitations, recommendations. No fabrication.",
    askPrompt: "Help me write a professional report with evidence labels, limits, and recommendations.",
    goodFor: ["Career mode", "QA", "Field documentation"],
    industries: ["quality", "law-enforcement", "emt", "cybersecurity", "civic-intelligence"],
    tier: "domain",
  }),
  skill({
    id: "ops-hardening-architect",
    name: "Security Hygiene",
    category: "specialized",
    path: "skills/specialized/ops-hardening-architect",
    purpose: "Learn practical security hygiene: careful access, logging, backups, and network separation.",
    tutorRole: "Cybersecurity education focused on protection and everyday good habits.",
    lensPrompt:
      "Teach security hygiene: careful access control, logging, updates, network separation, backup integrity. Focus on protection and professional practice for learners.",
    askPrompt: "Teach me practical security hygiene for this environment.",
    goodFor: ["Cybersecurity track", "IT protection basics"],
    industries: ["cybersecurity", "it-support", "software"],
    tier: "domain",
  }),
  skill({
    id: "solo-operator-playbook",
    name: "Solo Professional Guide",
    category: "specialized",
    path: "skills/specialized/solo-operator-playbook",
    purpose: "Priorities, documentation, and decision logs for independent professional work.",
    tutorRole: "Career and field-lead systems that stay ethical and legal.",
    lensPrompt:
      "Teach solo professional patterns: prioritization, documentation, decision logs, when to escalate. Keep it ethical and legal.",
    askPrompt: "Give me a practical solo professional guide for this role: priorities, notes, when to escalate.",
    goodFor: ["Career path", "Freelancers", "Field leads"],
    industries: ["project-management", "construction", "software", "sales"],
    tier: "domain",
  }),
  skill({
    id: "keystone-architect",
    name: "Keystone Thinking",
    category: "specialized",
    path: "skills/specialized/keystone-architect",
    purpose: "Find the one constraint or component that decides whether the whole system holds.",
    tutorRole: "Systems thinking for architecture and curriculum spines.",
    lensPrompt:
      "Identify the keystone of the system under study: the constraint or component that determines overall integrity. Teach around that fulcrum.",
    askPrompt: "What is the keystone of this system, and how should I learn around it?",
    goodFor: ["Architecture", "Org design", "Curriculum spines"],
    industries: ["software", "project-management", "teaching", "construction"],
    tier: "analysis",
  }),
  skill({
    id: "agnostic-evidence-analyst",
    name: "Even-Handed Evidence",
    category: "specialized",
    path: "skills/specialized/agnostic-evidence-analyst",
    purpose: "Steelman competing claims and say what would change your mind.",
    tutorRole: "Neutral claim analysis for contested topics.",
    lensPrompt:
      "Analyze evidence agnostically: steelman competing claims, score evidence quality, state what would change your mind. Educational epistemology.",
    askPrompt: "Steelman both sides, score the evidence, and tell me what would change your mind.",
    goodFor: ["Debates", "Research literacy", "Media"],
    industries: ["media-literacy", "teaching", "data", "law-enforcement"],
    tier: "analysis",
  }),
  skill({
    id: "paste-bridge-validator",
    name: "Show Your Work",
    category: "specialized",
    path: "skills/specialized/paste-bridge-validator",
    purpose: "Treat real artifacts as proof of practice — not just “I got it.”",
    tutorRole: "Keeps practice mode honest by asking for calculations, steps, or drafts.",
    lensPrompt:
      "Require concrete artifacts for claimed practice completion (code, calculations, steps). Do not accept self-report alone as proof of mastery.",
    askPrompt: "Do not take my word for it — make me show the work product.",
    goodFor: ["Practice mode", "Quizzes", "Skill checks"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "lit-runner",
    name: "Source Runner",
    category: "specialized",
    path: "skills/specialized/lit-runner",
    purpose: "Gather sources with discipline: primary vs secondary, recency, conflicts.",
    tutorRole: "Research method for teaching, civic work, and data stories.",
    lensPrompt:
      "Run a literature/source pass: primary vs secondary, recency, conflicts, citation hygiene. Educational research method.",
    askPrompt: "Run a disciplined source pass for this question and note conflicts.",
    goodFor: ["Research", "Teaching", "Civic work"],
    industries: ["teaching", "civic-intelligence", "data", "pharmacy"],
    tier: "domain",
  }),
  skill({
    id: "openmythos-architect",
    name: "Story Architecture",
    category: "specialized",
    path: "skills/specialized/openmythos-architect",
    purpose: "Build story systems: arcs, symbols, and continuity for creative work.",
    tutorRole: "Creative craft education for video, design, and writing.",
    lensPrompt:
      "Teach open mythos/story architecture: arcs, symbols, continuity. Creative education only.",
    askPrompt: "Help me design the story architecture for this project.",
    goodFor: ["Video", "Design", "Writing craft"],
    industries: ["video", "design", "teaching"],
    tier: "reference",
  }),
  skill({
    id: "master-skill-index",
    name: "Skill Guide",
    category: "specialized",
    path: "skills/specialized/master-skill-index",
    purpose: "Recommend which thinking tools fit the goal you actually have.",
    tutorRole: "Onboarding helper: picks a few lenses and explains why.",
    lensPrompt:
      "Recommend 1–3 thinking tools that best fit the learner goal and explain why.",
    askPrompt: "Which thinking tools should I turn on for this goal, and why?",
    goodFor: ["Getting started", "Skill map", "Career path"],
    industries: [],
    tier: "foundation",
  }),
  skill({
    id: "grok-build-plugins",
    name: "Building with Grok",
    category: "specialized",
    path: "skills/specialized/grok-build-plugins",
    purpose: "Learn how modular skills and plugins fit together when you build apps.",
    tutorRole: "For software learners making tools in Grok Build.",
    lensPrompt:
      "Teach Grok Build modular skill patterns at a learning level: structure, how tools attach, modularity.",
    askPrompt: "Teach me how modular skills fit into a Grok Build app, at a learning level.",
    goodFor: ["Software track", "App builders"],
    industries: ["software"],
    tier: "reference",
  }),
  skill({
    id: "power-platform-automation-architect",
    name: "Low-Code Automation",
    category: "specialized",
    path: "skills/specialized/power-platform-automation-architect",
    purpose: "Design safe automations: triggers, connectors, testing, and careful access.",
    tutorRole: "Business and IT automation curriculum.",
    lensPrompt:
      "Teach low-code automation architecture: triggers, connectors, governance, careful access, and testing.",
    askPrompt: "Help me design a safe low-code automation for this process.",
    goodFor: ["Business ops", "IT support", "Project management"],
    industries: ["it-support", "project-management", "accounting"],
    tier: "domain",
  }),
  skill({
    id: "email-operator",
    name: "Professional Email",
    category: "specialized",
    path: "skills/specialized/email-operator",
    purpose: "Clear, ethical email: structure, tone, and an audit trail.",
    tutorRole: "Communication coaching for sales, hospitality, and project work.",
    lensPrompt:
      "Teach professional email craft: clarity, structure, tone, and a clear record of what was said.",
    askPrompt: "Coach my draft email for clarity, tone, and professionalism.",
    goodFor: ["Sales", "Hospitality", "Project management"],
    industries: ["sales", "hospitality", "project-management", "teaching"],
    tier: "domain",
  }),
  skill({
    id: "thomas-tetralogy-aos-integration",
    name: "Systems Integration Notes",
    category: "specialized",
    path: "skills/specialized/thomas-tetralogy-aos-integration",
    purpose: "Advanced notes on how larger frameworks plug into Adventure OS thinking.",
    tutorRole: "Optional deep reference for systems learners.",
    lensPrompt:
      "When relevant, explain Thomas Tetralogy × AOS integration concepts at a high educational level with clear definitions.",
    askPrompt: "Explain the integration ideas at a learning level with plain definitions.",
    goodFor: ["Advanced systems study"],
    industries: ["teaching", "software", "civic-intelligence"],
    tier: "reference",
  }),
  skill({
    id: "battlememe-chaos-engine",
    name: "Meme Dynamics",
    category: "specialized",
    path: "skills/specialized/battlememe-chaos-engine",
    purpose: "Study how memes move culture — as media analysis, not harassment.",
    tutorRole: "Advanced media literacy for creative and civic learners.",
    lensPrompt:
      "If used, teach meme dynamics as cultural communication analysis for media literacy. Stay educational and respectful.",
    askPrompt: "Analyze the meme dynamics here as cultural communication — keep it educational.",
    goodFor: ["Advanced media literacy", "Creative rhetoric"],
    industries: ["media-literacy", "video"],
    tier: "reference",
  }),
];

export const AOS_SOURCE = {
  name: "Adventure OS",
  url: "https://github.com/AdventureNLearn/AOS-v3---LPIN",
  publicUrl: "https://github.com/AdventureNLearn/AOS-Public",
  lpinUrl: "https://github.com/AdventureNLearn/LPINv3",
  pathRepoUrl: "https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path",
  /** Live prototype (this product) on Grok.me */
  livePrototypeUrl: "https://gt2samples.grok.me/",
  /** Earlier public Grok Tutor — reference only, not this live prototype */
  originalTutorRef: "https://groktutor.grok.me/",
  originalGetYours: "https://groktutor.grok.me/get-yours",
  guidePath: "docs/AOS_v3.0_User_Instruction_Guide.md",
  inventoryPath: "SKILL_INVENTORY.md",
};

export function getSkill(id: string) {
  return AOS_SKILLS.find((s) => s.id === id);
}

export function skillsForIndustry(industryId: string) {
  return AOS_SKILLS.filter(
    (s) => s.tutorEnabled && (s.industries.length === 0 || s.industries.includes(industryId)),
  );
}

export function foundationSkills() {
  return AOS_SKILLS.filter((s) => s.tier === "foundation" && s.tutorEnabled);
}
