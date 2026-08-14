import {
  formatVerifiedBlock,
  selectVerifiedNotes,
} from "../src/lib/verified/select.ts";
import { offlineTutorReply } from "../src/lib/tutor-api.ts";

const s = selectVerifiedNotes({
  industryId: "electrical",
  mode: "explain",
  topic: "safety",
  userText: "is the panel live?",
});
console.log(
  "notes",
  s.notes.map((n) => n.id),
);
console.log(formatVerifiedBlock(s).slice(0, 500));

const r = offlineTutorReply({
  industryId: "electrical",
  mode: "explain",
  level: "beginner",
  skillIds: [],
  topic: "Electrical safety rules",
  messages: [
    { role: "user", content: "Is the panel live? What do I do first?" },
  ],
});
console.log("hasVerifiedBlock", r.includes("Verified notes"));
console.log("hasEnergized", r.includes("energized") || r.includes("de-energized"));
