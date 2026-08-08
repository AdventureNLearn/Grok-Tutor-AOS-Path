/**
 * Build ITSHABBENING — private OPSEC-scrubbed educational verified-currency package.
 * Outputs:
 *   C:\AOS\ops\ITSHABBENING\  (private SuperGrok resource)
 *   src/lib/verified/data/verified-notes.json  (product-safe embed)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { VerifiedNote } from "../src/lib/verified/types.ts";
import { INDUSTRIES } from "../src/lib/industries.ts";

const VERIFIED_ON = "2026-08-06";
const REVIEW_BY = "2027-02-06";
const MODES_ALL = [
  "explain",
  "socratic",
  "practice",
  "quiz",
  "scenario",
  "career",
] as const;

function note(
  partial: Omit<VerifiedNote, "verifiedOn" | "reviewBy"> & {
    verifiedOn?: string;
    reviewBy?: string;
  },
): VerifiedNote {
  return {
    verifiedOn: partial.verifiedOn ?? VERIFIED_ON,
    reviewBy: partial.reviewBy ?? REVIEW_BY,
    ...partial,
  };
}

const ALL_MODES = [...MODES_ALL];

/** Per-industry educational must-notes (synthetic, public-safe) */
const INDUSTRY_MUST: Record<
  string,
  { title: string; statement: string; limits: string; sources: string[]; hints: string[]; safety?: boolean }
> = {
  electrical: {
    title: "Test before touch",
    statement:
      "Assume circuits are energized until you verify de-energized state using the site’s approved method (lockout/tagout and test-before-touch). “Someone said it’s off” is not verification.",
    limits:
      "Exact LOTO steps, PPE, and permit rules are employer- and jurisdiction-specific. Not a substitute for a licensed electrician or site procedure.",
    sources: ["OSHA LOTO concepts (educational)", "NFPA 70E awareness topics (educational overview)"],
    hints: ["panel", "live", "power", "breaker", "wire", "safety", "lockout"],
    safety: true,
  },
  plumbing: {
    title: "Test before conceal",
    statement:
      "Do not cover drain or supply work until required tests pass and the responsible lead releases the area for cover.",
    limits: "Test type and sign-off path follow local code and GC process.",
    sources: ["Typical plumbing rough inspection practice (educational)"],
    hints: ["drain", "vent", "leak", "test", "wall", "cover", "slope"],
    safety: true,
  },
  hvac: {
    title: "Refrigerant and power safety",
    statement:
      "Treat equipment as hazardous for power, moving parts, and refrigerant until trained procedures and required credentials for the task are confirmed. Do not bypass safeties to “just get cooling back.”",
    limits: "EPA/section 608 and local rules apply to refrigerant work; employer SOP governs.",
    sources: ["EPA Section 608 awareness (educational)", "Manufacturer service literature (public)"],
    hints: ["refrigerant", "power", "coil", "pressure", "recovery", "heat pump"],
    safety: true,
  },
  welding: {
    title: "Hot work controls",
    statement:
      "Before arc or flame: confirm hot-work permission, combustibles cleared or protected, fire watch as required, and PPE for the process. Never weld over unknown coatings or closed vessels without procedure.",
    limits: "Permit systems and fire-watch rules are site-specific.",
    sources: ["OSHA hot work / welding hazard awareness (educational)"],
    hints: ["arc", "hot work", "ppe", "fume", "fire", "weld"],
    safety: true,
  },
  construction: {
    title: "Stop for uncontrolled change",
    statement:
      "When plans, site conditions, or safety controls do not match, stop and escalate. Do not invent a field fix that hides a coordination or structural risk.",
    limits: "Change-order authority and RFI process are contract-specific.",
    sources: ["Construction coordination / RFI practice (educational)"],
    hints: ["plan", "change", "rfi", "safety", "schedule", "gc"],
    safety: true,
  },
  carpentry: {
    title: "Load path and temporary support",
    statement:
      "Do not remove structural members or temporary bracing without an approved plan. Gravity does not wait for a second opinion.",
    limits: "Engineering direction is required for structural alterations.",
    sources: ["Basic framing / temporary support safety awareness (educational)"],
    hints: ["beam", "load", "brace", "framing", "wall", "header"],
    safety: true,
  },
  nursing: {
    title: "Escalate patient change",
    statement:
      "If breathing, mentation, pain, or vitals trend worsen, reassess and escalate per unit protocol. Do not wait for someone else to notice.",
    limits: "Not medical advice. Scope of practice and protocols are license- and facility-specific.",
    sources: ["Basic nursing escalation concepts (educational)"],
    hints: ["patient", "vital", "assess", "pain", "breathing", "change"],
    safety: true,
  },
  emt: {
    title: "Scene safety first",
    statement:
      "Do not enter an unsafe scene. Make the scene as safe as practical, request resources, and follow medical direction and protocols for your certification level.",
    limits: "Not medical direction. Local protocols and medical control govern.",
    sources: ["EMS scene safety principles (educational)"],
    hints: ["scene", "unsafe", "protocol", "patient", "handoff"],
    safety: true,
  },
  pharmacy: {
    title: "Right drug, right patient, right check",
    statement:
      "Verify identity, drug, dose, route, and timing against the order and policy before dispensing or administering. Interruptions are a known error risk—reset the check.",
    limits: "Not medical or dispensing authority. Facility policy and license rules control.",
    sources: ["Medication safety / five rights concepts (educational)"],
    hints: ["dose", "drug", "order", "patient", "dispense", "allergy"],
    safety: true,
  },
  software: {
    title: "Don’t ship untested critical paths",
    statement:
      "Before release, verify the change with tests or a clear checklist for the critical path. “It works on my machine” is not a release criterion for production.",
    limits: "Org CI/CD and change-management rules vary.",
    sources: ["Software delivery hygiene (educational)"],
    hints: ["test", "deploy", "bug", "release", "production", "review"],
  },
  cybersecurity: {
    title: "Least privilege and no shared admin",
    statement:
      "Grant only needed access; remove access when roles end. Shared admin accounts and permanent elevated rights create lasting risk.",
    limits: "Protective concept only—not an attack tutorial.",
    sources: ["NIST least privilege concepts (educational summary)"],
    hints: ["access", "admin", "password", "phishing", "log", "privilege"],
  },
  "it-support": {
    title: "Reproduce, then change",
    statement:
      "Reproduce the issue and capture facts before major changes. Document what you did so the next tech is not guessing.",
    limits: "Ticket systems and escalation paths are org-specific.",
    sources: ["ITIL-style incident hygiene (educational)"],
    hints: ["ticket", "password", "network", "reproduce", "escalat"],
  },
  data: {
    title: "Define the question before the number",
    statement:
      "Write the decision question and metric definition before querying. Wrong filters and silent missing data create confident false stories.",
    limits: "Governance and privacy rules are org- and law-specific.",
    sources: ["Analytics quality habits (educational)"],
    hints: ["metric", "query", "bias", "filter", "dashboard", "sample"],
  },
  cnc: {
    title: "Secure work and prove offsets",
    statement:
      "Secure the workpiece, verify tools and offsets, and keep hands clear of motion paths. Prove the first article before a production run.",
    limits: "Machine-specific procedures and guarding rules apply.",
    sources: ["Machine shop safety awareness (educational)"],
    hints: ["offset", "tool", "workhold", "first article", "spindle"],
    safety: true,
  },
  quality: {
    title: "Stop escape of defects",
    statement:
      "When a defect could reach a customer or create a safety issue, contain first, then analyze. Do not “ship and sort later” for safety-critical issues.",
    limits: "Quality system procedures are org-specific.",
    sources: ["Basic quality containment practice (educational)"],
    hints: ["defect", "ncr", "contain", "root cause", "escape"],
  },
  accounting: {
    title: "Separate duties and support entries",
    statement:
      "Keep recording, custody, and approval appropriately separated where possible. Every material entry should have support you can re-find later.",
    limits: "Not CPA advice. GAAP/IFRS and tax rules require qualified professionals.",
    sources: ["Internal control concepts (educational)"],
    hints: ["journal", "reconcile", "audit", "fraud", "support", "approval"],
  },
  sales: {
    title: "Truthful commitments",
    statement:
      "Do not promise delivery, features, or pricing you cannot support. Document what the customer was told.",
    limits: "Contract and compliance rules are company- and jurisdiction-specific.",
    sources: ["Ethical sales practice (educational)"],
    hints: ["promise", "crm", "quote", "discount", "handoff"],
  },
  "project-management": {
    title: "Surface risk early",
    statement:
      "Write risks and blockers while there is still time to act. Silent schedule hope is not a plan.",
    limits: "Methodology (Agile/waterfall) varies by org.",
    sources: ["PM risk communication habits (educational)"],
    hints: ["risk", "blocker", "schedule", "scope", "stakeholder"],
  },
  culinary: {
    title: "Time and temperature",
    statement:
      "Keep cold foods cold and hot foods hot per policy. Separate raw and ready-to-eat paths. When time/temp control is lost, follow discard or corrective rules—do not guess.",
    limits: "Health department codes and restaurant SOPs govern.",
    sources: ["Food safety time/temperature concepts (educational)"],
    hints: ["temp", "raw", "allergy", "sanitize", "cool"],
    safety: true,
  },
  hospitality: {
    title: "Guest safety and honesty",
    statement:
      "If a guest could be harmed (allergy, wet floor, security issue), act and escalate. Do not hide service failures that create risk.",
    limits: "Brand standards and local law vary.",
    sources: ["Hospitality safety/service recovery (educational)"],
    hints: ["guest", "complaint", "allergy", "safety", "security"],
  },
  "law-enforcement": {
    title: "Lawful authority and reporting truth",
    statement:
      "Act only within legal authority and policy. Report what you observed, what you did, and what remains unknown—without inventing facts.",
    limits:
      "Educational only—not legal advice or tactics training. Agency policy and law control.",
    sources: ["Public safety reporting integrity concepts (educational)"],
    hints: ["report", "use of force", "evidence", "policy", "witness"],
    safety: true,
  },
  teaching: {
    title: "Student safety and accurate records",
    statement:
      "Protect student safety and privacy. Keep grades and incident notes factual and timely. Escalate safeguarding concerns per required channels.",
    limits: "FERPA/state rules and district policy govern; not legal advice.",
    sources: ["Educator professional practice (educational)"],
    hints: ["student", "grade", "safety", "privacy", "behavior"],
  },
  cdl: {
    title: "Hours, inspection, and impairment",
    statement:
      "Do not drive impaired or past legal hours-of-service limits. Complete required inspections and report defects that make the vehicle unsafe.",
    limits: "FMCSA and carrier policies control; this is educational awareness.",
    sources: ["FMCSA safety concepts (educational summary)"],
    hints: ["hours", "inspection", "fatigue", "load", "dot"],
    safety: true,
  },
  aviation: {
    title: "Checklist and go/no-go discipline",
    statement:
      "Use required checklists. If a limit, weather, or maintenance item is outside approved bounds, do not “push on” without the proper authority and procedure.",
    limits: "FARs, ops specs, and aircraft manuals govern. Not flight instruction.",
    sources: ["Aviation safety culture / checklist discipline (educational)"],
    hints: ["checklist", "weather", "maintenance", "go no-go", "brief"],
    safety: true,
  },
  design: {
    title: "Accessibility and truth in presentation",
    statement:
      "Design so critical information is readable and usable. Do not hide material limitations in fine print users cannot reasonably use.",
    limits: "WCAG/legal requirements vary by product and region.",
    sources: ["Accessibility awareness (educational)"],
    hints: ["contrast", "type", "user", "accessibility", "layout"],
  },
  video: {
    title: "Consent, safety, and credits",
    statement:
      "Get needed permissions for people and locations. Keep sets safe (power, rigging, traffic). Credit sources honestly; do not present others’ work as yours.",
    limits: "Release forms and union/rules are production-specific.",
    sources: ["Production safety & rights awareness (educational)"],
    hints: ["release", "set", "power", "credit", "shot list"],
  },
  energy: {
    title: "Energy isolation",
    statement:
      "Before service, isolate hazardous energy (electrical, pressure, mechanical) per procedure and verify zero energy state. Never defeat interlocks casually.",
    limits: "Plant procedures and LOTO programs are site-specific.",
    sources: ["Hazardous energy control concepts (educational)"],
    hints: ["isolation", "pressure", "voltage", "loto", "interlock"],
    safety: true,
  },
  agriculture: {
    title: "Machine and chemical caution",
    statement:
      "Shut down and secure equipment before clearing jams. Follow label and PPE rules for chemicals. Fatigue and rush harvests raise injury risk.",
    limits: "EPA labels and farm SOPs govern chemical use.",
    sources: ["Agricultural equipment/chemical safety awareness (educational)"],
    hints: ["pto", "chemical", "ppe", "jam", "livestock"],
    safety: true,
  },
  automotive: {
    title: "Support the vehicle, control energy",
    statement:
      "Support vehicles with approved stands—not jacks alone. Disconnect or isolate energy as required before work that could move parts or airbags.",
    limits: "OEM procedures and shop policy control.",
    sources: ["Automotive shop safety awareness (educational)"],
    hints: ["jack", "stand", "battery", "lift", "torque"],
    safety: true,
  },
  logistics: {
    title: "Load securement and fatigue",
    statement:
      "Secure loads per rule and inspect before travel. Do not accept fatigue or damaged equipment as “normal.” Report issues that affect public roads.",
    limits: "DOT and carrier rules apply.",
    sources: ["Load securement / fatigue awareness (educational)"],
    hints: ["load", "strap", "dock", "fatigue", "manifest"],
  },
  "civic-intelligence": {
    title: "Primary sources and jurisdiction",
    statement:
      "Prefer primary public records and state the jurisdiction. Separate what the document says from what you infer. Do not dox private individuals.",
    limits: "Not legal advice. Public-records rules vary by state.",
    sources: ["Public records literacy (educational)"],
    hints: ["permit", "parcel", "record", "jurisdiction", "hearing"],
  },
  "media-literacy": {
    title: "Claim hygiene",
    statement:
      "Label evidence vs inference vs assumption. Check who benefits from a frame. Do not amplify unverified harm claims as fact.",
    limits: "Educational media literacy—not a newsroom policy.",
    sources: ["Evidence-labeling / media literacy practice (educational)"],
    hints: ["claim", "source", "frame", "viral", "headline"],
  },
};

/** Second note per industry — when_relevant professional habit */
const INDUSTRY_HABIT: Record<
  string,
  { title: string; statement: string; limits: string; sources: string[]; hints: string[] }
> = {
  electrical: {
    title: "Clear field update",
    statement:
      "When something is wrong, tell a lead: where, what you saw, hold or go, and who must decide. Photos help when allowed.",
    limits: "Radio/phone rules and chain of command are site-specific.",
    sources: ["Field communication practice (educational)"],
    hints: ["update", "message", "lead", "photo", "hold"],
  },
  plumbing: {
    title: "Slope and vent matter",
    statement:
      "Drains need correct slope and a clear vent path so traps hold and waste flows. “Looks fine” is not a measurement.",
    limits: "Code numbers and methods vary by jurisdiction.",
    sources: ["DWV fundamentals (educational)"],
    hints: ["slope", "vent", "trap", "gurgle"],
  },
  hvac: {
    title: "Measure, then decide",
    statement:
      "Capture temperatures, pressures (if qualified), and airflow symptoms before swapping major parts. Guess-and-replace wastes money and can create new faults.",
    limits: "Gauge work requires training and credentials where required.",
    sources: ["HVAC diagnostic discipline (educational)"],
    hints: ["superheat", "subcool", "airflow", "filter", "thermostat"],
  },
  welding: {
    title: "Procedure before improvisation",
    statement:
      "Follow the welding procedure specification for the joint. Random settings “that worked last time” are not a procedure.",
    limits: "WPS/PQR requirements are code- and employer-specific.",
    sources: ["Welding procedure awareness (educational)"],
    hints: ["wps", "amperage", "joint", "pass", "inspect"],
  },
  construction: {
    title: "Write the constraint",
    statement:
      "If two trades conflict, write the constraint (who, where, when, drawing reference) so the next decision is informed.",
    limits: "Contract roles differ by project.",
    sources: ["Jobsite coordination practice (educational)"],
    hints: ["trade", "conflict", "drawing", "constraint"],
  },
  carpentry: {
    title: "Layout twice",
    statement:
      "Verify layout against plan dimensions before cutting expensive members. Mark waste clearly.",
    limits: "Plan hold status and RFIs may change dimensions.",
    sources: ["Framing layout habit (educational)"],
    hints: ["layout", "cut", "measure", "plan"],
  },
  nursing: {
    title: "Closed-loop communication",
    statement:
      "Read back critical verbal orders and confirm who owns the next action. Ambiguous “someone will…” is not a plan.",
    limits: "Facility communication policies govern.",
    sources: ["Clinical communication habits (educational)"],
    hints: ["order", "read back", "handoff", "sbarr", "sbarr"],
  },
  emt: {
    title: "Handoff structure",
    statement:
      "Give receiving staff a short structured handoff: age/sex if known, chief concern, findings, treatments, response, and open questions.",
    limits: "Local handoff formats vary.",
    sources: ["EMS handoff concepts (educational)"],
    hints: ["handoff", "report", "radio", "hospital"],
  },
  pharmacy: {
    title: "Allergy and interaction pause",
    statement:
      "Pause for allergy and interaction checks flagged by system or history. Clarify with prescriber/pharmacist per policy—do not override casually.",
    limits: "Clinical decision support rules are system-specific.",
    sources: ["Medication safety pause (educational)"],
    hints: ["allergy", "interaction", "flag", "override"],
  },
  software: {
    title: "Small diffs, clear intent",
    statement:
      "Prefer small changes with a clear purpose and a way to roll back. Large mystery commits create outages.",
    limits: "Team branching models differ.",
    sources: ["Engineering change hygiene (educational)"],
    hints: ["pr", "commit", "rollback", "review"],
  },
  cybersecurity: {
    title: "Log enough to learn",
    statement:
      "Keep simple, time-stamped records of access changes and security-relevant events so incidents can be reconstructed without guessing.",
    limits: "Retention and monitoring tools are org-specific.",
    sources: ["Logging hygiene (educational)"],
    hints: ["log", "audit", "incident", "timestamp"],
  },
  "it-support": {
    title: "Password resets with identity proof",
    statement:
      "Reset credentials only after identity checks required by policy. Social engineering often starts with urgency and name-dropping.",
    limits: "Identity proofing steps are org-specific.",
    sources: ["Help desk identity verification (educational)"],
    hints: ["reset", "identity", "mfa", "urgent"],
  },
  data: {
    title: "Show the grain and filter",
    statement:
      "State the data grain, date range, and major filters with every number. Otherwise people compare unlike things.",
    limits: "Warehouse semantics are org-specific.",
    sources: ["Analytics documentation habit (educational)"],
    hints: ["grain", "filter", "date range", "definition"],
  },
  cnc: {
    title: "First article before batch",
    statement:
      "Inspect the first part against print critical dimensions before running a full batch.",
    limits: "Sampling plans are org-specific.",
    sources: ["First-article discipline (educational)"],
    hints: ["first article", "tolerance", "batch", "print"],
  },
  quality: {
    title: "Write the nonconformance clearly",
    statement:
      "Record requirement, actual, quantity, and disposition path. Vague NCRs cannot be fixed or trended.",
    limits: "QMS forms differ.",
    sources: ["NCR writing practice (educational)"],
    hints: ["ncr", "disposition", "requirement", "actual"],
  },
  accounting: {
    title: "Reconcile to the source",
    statement:
      "Tie balances to source systems or statements. Unexplained plugs hide errors and fraud risk.",
    limits: "Not audit or tax advice.",
    sources: ["Reconciliation discipline (educational)"],
    hints: ["reconcile", "plug", "balance", "statement"],
  },
  sales: {
    title: "CRM truthfulness",
    statement:
      "Log stage and next step honestly. Fake pipeline hides forecast risk.",
    limits: "CRM fields are company-specific.",
    sources: ["Pipeline hygiene (educational)"],
    hints: ["crm", "stage", "forecast", "next step"],
  },
  "project-management": {
    title: "Single source of schedule truth",
    statement:
      "Keep one agreed schedule artifact. Side spreadsheets without owners create false confidence.",
    limits: "Tooling varies.",
    sources: ["Schedule hygiene (educational)"],
    hints: ["schedule", "baseline", "owner", "milestone"],
  },
  culinary: {
    title: "Allergy communication",
    statement:
      "Treat allergy requests as safety-critical. Confirm ingredients and cross-contact risk; do not guess.",
    limits: "Menu systems and labeling laws vary.",
    sources: ["Allergen awareness (educational)"],
    hints: ["allergy", "cross contact", "ingredient"],
  },
  hospitality: {
    title: "Service recovery with ownership",
    statement:
      "Acknowledge the issue, state what you will do, and give a time or owner. Empty apologies without action erode trust.",
    limits: "Compensation authority is brand-specific.",
    sources: ["Service recovery (educational)"],
    hints: ["complaint", "recovery", "comp", "owner"],
  },
  "law-enforcement": {
    title: "Contemporaneous notes",
    statement:
      "Record important observations close to the time of the event. Memory decays; invented detail is misconduct.",
    limits: "Agency report systems govern.",
    sources: ["Report writing integrity (educational)"],
    hints: ["notes", "report", "timeline", "observation"],
  },
  teaching: {
    title: "Document behavior factually",
    statement:
      "Describe observable behavior and time, not labels or insults. Facts support fair follow-up.",
    limits: "District forms and laws apply.",
    sources: ["Educator documentation (educational)"],
    hints: ["behavior", "incident", "parent", "note"],
  },
  cdl: {
    title: "Pre-trip is not optional",
    statement:
      "Complete required pre-trip checks. Defects that affect control, tires, lights, or securement must be addressed before travel.",
    limits: "CVSA/FMCSA details are regulatory—verify current rules.",
    sources: ["Pre-trip inspection awareness (educational)"],
    hints: ["pre-trip", "defect", "tire", "brake", "light"],
  },
  aviation: {
    title: "Brief the threats",
    statement:
      "Before flight or maintenance task, brief the main threats and mitigations for this day—not a generic speech.",
    limits: "Ops manuals define briefing standards.",
    sources: ["Threat and error management awareness (educational)"],
    hints: ["brief", "threat", "weather", "crew"],
  },
  design: {
    title: "Design for the worst readable case",
    statement:
      "Check critical text and controls at small sizes and poor lighting. Pretty mockups can hide unusable UI.",
    limits: "Platform guidelines vary.",
    sources: ["UI readability practice (educational)"],
    hints: ["mobile", "type size", "contrast", "usability"],
  },
  video: {
    title: "Shot list before roll",
    statement:
      "Arrive with a shot list and audio plan. Rolling without intent burns time and misses coverage.",
    limits: "Documentary vs scripted workflows differ.",
    sources: ["Production planning (educational)"],
    hints: ["shot list", "coverage", "audio", "b-roll"],
  },
  energy: {
    title: "Permit to work awareness",
    statement:
      "High-risk tasks often need a permit-to-work. Starting without required permits is a process failure, not heroism.",
    limits: "Permit systems are site-specific.",
    sources: ["Permit-to-work concepts (educational)"],
    hints: ["permit", "confined", "hot work", "isolation"],
  },
  agriculture: {
    title: "Guard and PTO caution",
    statement:
      "Keep guards in place. PTO and pinch points injure quickly—shut down before clearing.",
    limits: "Equipment manuals govern.",
    sources: ["Ag equipment safety (educational)"],
    hints: ["pto", "guard", "pinch", "auger"],
  },
  automotive: {
    title: "Torque critical fasteners",
    statement:
      "Use specified torque on critical fasteners (wheels, suspension, engine). Guessing torque creates comebacks and hazards.",
    limits: "OEM specs control.",
    sources: ["Shop torque discipline (educational)"],
    hints: ["torque", "wheel", "spec", "fastener"],
  },
  logistics: {
    title: "Dock and pedestrian awareness",
    statement:
      "Control trailer creep, chock as required, and watch for pedestrians on docks. Speed in yards is a safety control.",
    limits: "Yard rules are site-specific.",
    sources: ["Dock safety awareness (educational)"],
    hints: ["dock", "chock", "pedestrian", "yard"],
  },
  "civic-intelligence": {
    title: "Cite the document",
    statement:
      "When making a public claim, cite the document type, date, and jurisdiction. Screenshots without provenance are weak evidence.",
    limits: "Not legal advice.",
    sources: ["Evidence citation habit (educational)"],
    hints: ["cite", "ordinance", "minute", "agenda", "parcel"],
  },
  "media-literacy": {
    title: "Slow the share",
    statement:
      "Before resharing shocking claims, check original source, date, and whether the clip is cropped to change meaning.",
    limits: "Educational habit—not platform policy.",
    sources: ["Lateral reading / media literacy (educational)"],
    hints: ["share", "viral", "crop", "source", "date"],
  },
};

const globals: VerifiedNote[] = [
  note({
    id: "global-stop-if-unsafe",
    title: "Stop if unsafe",
    statement:
      "If a person could get hurt, stop that path and tell the right lead. Schedule pressure does not override a clear safety problem.",
    limits: "Stop-work authority details are employer- and site-specific.",
    sources: ["Workplace stop-work culture (educational)"],
    tier: "must",
    safetyCritical: true,
    scope: {
      industries: [],
      modes: ALL_MODES,
      topicHints: ["hurt", "unsafe", "rush", "pressure", "safety", "emergency"],
    },
  }),
  note({
    id: "global-not-license",
    title: "Educational only — not a license",
    statement:
      "This resource is educational support. It does not replace licensed instruction, codes, clinical protocols, or employer procedures.",
    limits: "Verify requirements where you live and work.",
    sources: ["ITSHABBENING educational disclaimer"],
    tier: "must",
    scope: { industries: [], modes: ALL_MODES },
  }),
  note({
    id: "global-saw-think-guess",
    title: "Saw / think / guess",
    statement:
      "Separate what you saw, what you think, and what you are still guessing. Mixing them creates false certainty.",
    limits: "A learning habit—not a legal standard of proof.",
    sources: ["Evidence hygiene (educational)"],
    tier: "must",
    scope: {
      industries: [],
      modes: ALL_MODES,
      topicHints: ["evidence", "guess", "sure", "maybe", "think"],
    },
  }),
  note({
    id: "global-no-pii-in-chat",
    title: "Minimize personal data in learning chats",
    statement:
      "Do not paste real patient, student, client, or coworker private identifiers into learning tools. Use synthetic examples.",
    limits: "You control what you type; tools may process chat under their policies when live models are used.",
    sources: ["ITSHABBENING OPSEC / PII guidance"],
    tier: "must",
    scope: {
      industries: [],
      modes: ["explain", "practice", "scenario", "career"],
      topicHints: ["patient", "ssn", "address", "phone", "student", "client"],
    },
  }),
  note({
    id: "global-primary-source",
    title: "Prefer primary public sources",
    statement:
      "For rules and requirements, prefer primary public documents (code body, agency page, manufacturer instructions) over random social posts.",
    limits: "Links rot; re-verify on review dates.",
    sources: ["Information literacy (educational)"],
    tier: "when_relevant",
    scope: {
      industries: [],
      modes: ["explain", "career", "quiz"],
      topicHints: ["code", "law", "rule", "required", "legal", "regulation"],
    },
  }),
];

function buildCatalog(): VerifiedNote[] {
  const out: VerifiedNote[] = [...globals];

  for (const ind of INDUSTRIES) {
    const must = INDUSTRY_MUST[ind.id];
    if (must) {
      out.push(
        note({
          id: `${ind.id}-must-core`,
          title: must.title,
          statement: must.statement,
          limits: must.limits,
          sources: must.sources,
          tier: "must",
          safetyCritical: Boolean(must.safety || ind.safetyFirst),
          scope: {
            industries: [ind.id],
            modes: ALL_MODES,
            topicHints: must.hints,
          },
        }),
      );
    }
    const habit = INDUSTRY_HABIT[ind.id];
    if (habit) {
      out.push(
        note({
          id: `${ind.id}-habit-core`,
          title: habit.title,
          statement: habit.statement,
          limits: habit.limits,
          sources: habit.sources,
          tier: "when_relevant",
          scope: {
            industries: [ind.id],
            modes: ["explain", "practice", "scenario", "socratic", "quiz"],
            topicHints: habit.hints,
          },
        }),
      );
    }
    // Career-facing reference note for every industry
    out.push(
      note({
        id: `${ind.id}-career-credential-check`,
        title: `Credential path — ${ind.name}`,
        statement: `Before promising a career outcome in ${ind.name}, check the real credential, license, or apprenticeship path where you live. Requirements differ by region and change over time.`,
        limits:
          "Not career counseling or a guarantee of employment. Confirm with official boards, unions, or schools.",
        sources: [
          "State/provincial licensing boards (look up locally)",
          "Employer or apprenticeship program requirements",
        ],
        tier: "when_relevant",
        scope: {
          industries: [ind.id],
          modes: ["career", "explain"],
          topicHints: ["license", "cert", "career", "apprentice", "school", "job"],
        },
      }),
    );
  }

  return out;
}

const notes = buildCatalog();
const packageRoot = "C:\\AOS\\ops\\ITSHABBENING";
const productData = join(
  "C:\\Users\\Chris\\Projects\\Grok-Tutor-AOS-Path",
  "src",
  "lib",
  "verified",
  "data",
);
mkdirSync(join(packageRoot, "catalog"), { recursive: true });
mkdirSync(productData, { recursive: true });

const payload = {
  name: "ITSHABBENING",
  version: "1.0.0",
  class: "private-educational-resource",
  opsec: "public-suite-safe-content",
  description:
    "ITSHABBENING — private, PII-scrubbed, OPSEC-compliant educational verified-currency for SuperGrok and Grok Tutor. Not generative. Operator-dated facts with limits and sources.",
  generatedAt: new Date().toISOString(),
  noteCount: notes.length,
  industries: INDUSTRIES.map((i) => i.id),
  notes,
};

const json = JSON.stringify(payload, null, 2);
writeFileSync(join(packageRoot, "catalog", "verified-notes.json"), json);
writeFileSync(join(productData, "verified-notes.json"), json);

writeFileSync(
  join(packageRoot, "README.md"),
  `# ITSHABBENING

**Private educational resource** for SuperGrok apps and Grok Tutor.

> Name: **ITSHABBENING**  
> Class: OPSEC-compliant, PII-scrubbed, non-generative verified currency  
> Location: \`C:\\\\AOS\\\\ops\\\\ITSHABBENING\` (private ops path — not a public vault dump)

## What it is

A structured library of **dated, source-labeled educational notes** that tutors inject when relevant.

- **Not** freeform web generation  
- **Not** private densify / vault / real-person PII  
- **Yes** plain-language safety and craft habits with explicit **limits**

## Layout

| Path | Role |
|------|------|
| \`catalog/verified-notes.json\` | Full note payload |
| \`OPSEC.md\` | What may / may not enter this package |
| \`SUPERGROK-INGEST.md\` | How to pull into SuperGrok Build |
| \`MANIFEST.json\` | Version + counts |

## Sync to Grok Tutor product

Product embed (public-safe copy of same scrubbed content):

\`Grok-Tutor-AOS-Path/src/lib/verified/data/verified-notes.json\`

Rebuild both:

\`\`\`bash
cd C:\\\\Users\\\\Chris\\\\Projects\\\\Grok-Tutor-AOS-Path
npx tsx scripts/build-itshabbening.mts
\`\`\`

## Counts

- Notes: **${notes.length}**
- Industries covered: **${INDUSTRIES.length}**
- Generated: ${payload.generatedAt}
`,
);

writeFileSync(
  join(packageRoot, "OPSEC.md"),
  `# ITSHABBENING — OPSEC position

**Class:** private educational resource · content is **public-suite-safe** (no secrets, no real PII, no vault raw).

## Allowed

- Synthetic educational scenarios and habits  
- Public-org concepts (OSHA awareness, NIST concepts, FMCSA awareness) labeled as educational  
- Explicit **limits** (jurisdiction, employer, license)  
- Review dates for currency  

## Forbidden

- Real names, phones, emails, home addresses of private persons  
- API keys, cookies, tokens, \`.env\`  
- Vault densify dumps, L0 private notes, municipality confidential samples  
- Attack playbooks / exploit detail  
- “Guaranteed legal/medical advice” framing  

## PII rule for learners

Notes instruct learners **not** to paste real patient/student/client identifiers into chats.

## Delivery

- Keep this folder under \`C:\\\\AOS\\\\ops\\\\\` (private).  
- Product GitHub may ship the scrubbed JSON embed only.  
- SuperGrok private app: ingest via SUPERGROK-INGEST.md — do not paste ops brain chrome.
`,
);

writeFileSync(
  join(packageRoot, "SUPERGROK-INGEST.md"),
  `# Pull ITSHABBENING into a SuperGrok app

## Intent

Use ITSHABBENING as the **verified currency layer** for educational Grok products: deterministic notes with sources and review dates—not improvised regulation.

## Ingest steps

1. Open SuperGrok / Grok Build for your **private** app project.  
2. Attach or paste from:
   - \`catalog/verified-notes.json\`
   - \`OPSEC.md\` (constraints)
3. Instruct the app:

\`\`\`
You are an educational tutor. When answering craft/trade questions:
1) Prefer ITSHABBENING verified notes that match industry + topic.
2) Always state limits (local code, employer, license).
3) Never invent statute numbers or clinical protocols not in the notes.
4) Never request or store real PII; use synthetic examples.
5) If a note is past reviewBy, tell the learner to re-check the official source.
\`\`\`

4. Keep API keys in **server env only**.  
5. For public demos, meter live calls; samples/notes can stay free.

## Name to use in product copy

**ITSHABBENING** — private educational verified-currency package (AdventureNLearn ops).
`,
);

writeFileSync(
  join(packageRoot, "MANIFEST.json"),
  JSON.stringify(
    {
      name: "ITSHABBENING",
      version: "1.0.0",
      noteCount: notes.length,
      industryCount: INDUSTRIES.length,
      verifiedOnDefault: VERIFIED_ON,
      reviewByDefault: REVIEW_BY,
      path: packageRoot,
      productEmbed:
        "C:\\\\Users\\\\Chris\\\\Projects\\\\Grok-Tutor-AOS-Path\\\\src\\\\lib\\\\verified\\\\data\\\\verified-notes.json",
    },
    null,
    2,
  ),
);

// .gitignore — keep private if ever near a public clone
writeFileSync(
  join(packageRoot, ".gitignore"),
  `# ITSHABBENING is a private ops educational package.
# Do not publish with vault attachments or keys.
.env
*.key
secrets/
`,
);

console.log(
  JSON.stringify(
    {
      name: "ITSHABBENING",
      notes: notes.length,
      industries: INDUSTRIES.length,
      packageRoot,
      productEmbed: join(productData, "verified-notes.json"),
      sampleIds: notes.slice(0, 5).map((n) => n.id),
    },
    null,
    2,
  ),
);
