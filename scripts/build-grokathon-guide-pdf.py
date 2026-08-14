#!/usr/bin/env python3
"""Grokathon inspirational guide — civic/public product ideation with Grok Tutor.
Educational framing only. No overclaims, no real jurisdiction/PII samples."""

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = Path(r"C:\AOS\logs\share-packs")
OUT = OUT_DIR / "Grokathon-Inspirational-Guide-Grok-Tutor.pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#0B1F33")
TEAL = colors.HexColor("#0F766E")
GOLD = colors.HexColor("#B45309")
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
LINE = colors.HexColor("#CBD5E1")
SOFT = colors.HexColor("#F1F5F9")
CREAM = colors.HexColor("#FFFBEB")
INK = colors.HexColor("#0F172A")


def S():
    b = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "kicker", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=9,
            textColor=TEAL, alignment=TA_CENTER, spaceAfter=10, leading=12,
        ),
        "title": ParagraphStyle(
            "title", parent=b["Title"], fontName="Helvetica-Bold", fontSize=24,
            textColor=NAVY, alignment=TA_CENTER, leading=30, spaceAfter=10,
        ),
        "sub": ParagraphStyle(
            "sub", parent=b["Normal"], fontName="Helvetica", fontSize=11.5,
            textColor=SLATE, alignment=TA_CENTER, leading=16, spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1", parent=b["Heading1"], fontName="Helvetica-Bold", fontSize=15,
            textColor=NAVY, spaceBefore=14, spaceAfter=6, leading=19,
        ),
        "h2": ParagraphStyle(
            "h2", parent=b["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
            textColor=TEAL, spaceBefore=10, spaceAfter=5, leading=15,
        ),
        "body": ParagraphStyle(
            "body", parent=b["Normal"], fontName="Helvetica", fontSize=10,
            textColor=SLATE, alignment=TA_JUSTIFY, leading=14, spaceAfter=7,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=b["Normal"], fontName="Helvetica", fontSize=10,
            textColor=SLATE, leading=13.5, leftIndent=6, spaceAfter=3,
        ),
        "quote": ParagraphStyle(
            "quote", parent=b["Normal"], fontName="Helvetica-Oblique", fontSize=11,
            textColor=NAVY, alignment=TA_CENTER, leading=15, spaceBefore=8, spaceAfter=8,
        ),
        "warn": ParagraphStyle(
            "warn", parent=b["Normal"], fontName="Helvetica", fontSize=9.2,
            textColor=GOLD, leading=12.5,
        ),
        "cell": ParagraphStyle(
            "cell", parent=b["Normal"], fontName="Helvetica", fontSize=8.8,
            textColor=SLATE, leading=11.5,
        ),
        "head": ParagraphStyle(
            "head", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=8.8,
            textColor=NAVY, leading=11.5,
        ),
        "small": ParagraphStyle(
            "small", parent=b["Normal"], fontName="Helvetica", fontSize=8.2,
            textColor=MUTED, leading=11, spaceAfter=4,
        ),
        "step_n": ParagraphStyle(
            "step_n", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=14,
            textColor=TEAL, alignment=TA_CENTER, leading=16,
        ),
        "step_t": ParagraphStyle(
            "step_t", parent=b["Normal"], fontName="Helvetica-Bold", fontSize=10,
            textColor=NAVY, leading=13, spaceAfter=2,
        ),
        "step_b": ParagraphStyle(
            "step_b", parent=b["Normal"], fontName="Helvetica", fontSize=9,
            textColor=SLATE, leading=12,
        ),
    }


def hr():
    return HRFlowable(width="100%", thickness=0.7, color=LINE, spaceBefore=2, spaceAfter=10)


def box(text, style, bg, border):
    inner = Paragraph(text, style)
    t = Table([[inner]], colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def ptable(headers, rows, widths, s):
    data = [[Paragraph(h, s["head"]) for h in headers]]
    data += [[Paragraph(c, s["cell"]) for c in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SOFT),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT]),
    ]))
    return t


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(0.7 * inch, 0.55 * inch, letter[0] - 0.7 * inch, 0.55 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        0.7 * inch, 0.35 * inch,
        "Grokathon inspirational guide · Grok Tutor educational lab · Not a credential or official endorsement",
    )
    canvas.drawRightString(letter[0] - 0.7 * inch, 0.35 * inch, f"{doc.page}")
    canvas.restoreState()


def step_card(n, title, body, s):
    left = Paragraph(str(n), s["step_n"])
    right = [Paragraph(title, s["step_t"]), Paragraph(body, s["step_b"])]
    right_t = Table([[r] for r in right], colWidths=[5.5 * inch])
    right_t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    t = Table([[left, right_t]], colWidths=[0.55 * inch, 5.7 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#CCFBF1")),
    ]))
    return KeepTogether([t, Spacer(1, 6)])


def build():
    s = S()
    story = []

    # COVER
    story.append(Spacer(1, 0.85 * inch))
    story.append(Paragraph("FOR GROKATHON PARTICIPANTS", s["kicker"]))
    story.append(Paragraph("Build something the public<br/>can actually trust", s["title"]))
    story.append(Spacer(1, 0.1 * inch))
    story.append(
        Paragraph(
            "Inspirational guidance for using <b>Grok Tutor</b> &amp; <b>The Hive</b><br/>"
            "to develop product ideas for real-world <b>civic and public</b> use",
            s["sub"],
        )
    )
    story.append(Spacer(1, 0.2 * inch))
    story.append(hr())
    story.append(
        Paragraph(
            f"Companion pack · {date.today().isoformat()} · Share freely with your team<br/>"
            "Integrity-first · Educational lab · No overclaims",
            s["sub"],
        )
    )
    story.append(Spacer(1, 0.35 * inch))
    story.append(
        Paragraph(
            "“The public does not need another demo that looks smart.<br/>"
            "They need tools that stay honest when the data is incomplete.”",
            s["quote"],
        )
    )
    story.append(Spacer(1, 0.25 * inch))
    story.append(
        box(
            "<b>Spirit of this gift.</b> This is <b>inspirational guidance</b> and an educational codebase—not a "
            "winning formula, not an official Grokathon rulebook, and not a promise of prizes, accreditation, "
            "or production authority. Take what helps. Leave what does not. Build something you would defend "
            "in daylight.",
            s["warn"],
            CREAM,
            GOLD,
        )
    )
    story.append(PageBreak())

    # 1 WHY YOU'RE HERE
    story.append(Paragraph("1. Why this matters in a Grokathon", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Hackathons reward speed. Civic and public products reward <b>trust</b>. The teams that stand out "
            "are not always the ones with the flashiest UI—they are the ones who can explain "
            "<b>what they know</b>, <b>what they are guessing</b>, and <b>who decides</b> when it matters.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Grok Tutor was built as a craft-learning app with a spatial home called <b>The Hive</b>. "
            "You can use it as a <b>thinking gym</b> while you invent: practice teaching a flow, stress-test "
            "a multi-role workflow, and refuse the shortcuts that look polished but fail real people.",
            s["body"],
        )
    )
    story.append(Paragraph("What “winning” can mean beyond the scoreboard", s["h2"]))
    for b in [
        "A product idea that a non-expert can understand in 60 seconds.",
        "A claim surface that never pretends incomplete data is finished truth.",
        "A clear human final call—software assists; people remain accountable.",
        "A demo that stays free of private data and real place-name leakage.",
        "A path from weekend prototype to something you could keep building with integrity.",
    ]:
        story.append(Paragraph(f"• {b}", s["bullet"]))

    # 2 NORTH STAR
    story.append(Paragraph("2. North-star principles (print this page)", s["h1"]))
    story.append(hr())
    story.append(
        ptable(
            ["Principle", "In the lab", "In your Grokathon build"],
            [
                [
                    "Tri-state claims",
                    "Tag Evidence / Inference / Assumption in lessons and scenarios.",
                    "Every public-facing claim is labeled or scoped—or removed.",
                ],
                [
                    "Human final call",
                    "Orchestration and tools support judgment; they do not replace it.",
                    "Name the decision owner before you automate anything consequential.",
                ],
                [
                    "Clean share",
                    "Samples avoid real PII and real municipality names.",
                    "Your pitch deck and demo data stay scrubbed if screenshots go public.",
                ],
                [
                    "Honest incomplete",
                    "Soft failure and missing inputs stay visible.",
                    "Degraded mode tells the truth instead of inventing green checks.",
                ],
                [
                    "No overclaim",
                    "Help/Credits state educational limits.",
                    "Never market as license, accreditation, legal/medical authority, or official government system.",
                ],
            ],
            [1.25 * inch, 2.55 * inch, 2.7 * inch],
            s,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        Paragraph(
            "Attribution for integrity lineage (conceptual spark, not embedded product software): see "
            "in-app <b>/credits</b>, <b>NOTICE</b>, and README—including CAI-OS notices as specified by their creator.",
            s["small"],
        )
    )

    # 3 HIVE AS STUDIO
    story.append(Paragraph("3. The Hive as your weekend design studio", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Do not treat The Hive as wallpaper. Each shape is a <b>room that forces a better product question</b>. "
            "Open a shape, run a short orchestration, and ask: would this still hold if a journalist, a resident, "
            "and an auditor all watched?",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Open this", "Ask this product question"],
            [
                ["Mission spine", "What is the single public mission we will not trade for convenience?"],
                ["Integrity triangle", "What is known, inferred, and still undecided—before we ship UI?"],
                ["Four-agent field", "Which roles must collaborate, and where do incentives conflict?"],
                ["Claim diamond", "Can every sentence on the product surface be backed, scoped, or withdrawn?"],
                ["Sense / deep modes", "What external signals are allowed—and what stays quarantined until gated?"],
            ],
            [1.7 * inch, 4.8 * inch],
            s,
        )
    )
    story.append(Spacer(1, 0.1 * inch))
    story.append(
        Paragraph(
            "Local demo links (after <font face='Courier'>npm run dev</font> on port <b>8085</b>):<br/>"
            "<font face='Courier'>http://127.0.0.1:8085/?orch=1&amp;shape=spine</font><br/>"
            "<font face='Courier'>http://127.0.0.1:8085/?orch=1&amp;shape=integrity-triangle</font><br/>"
            "<font face='Courier'>http://127.0.0.1:8085/?orch=1&amp;shape=four-agent</font>",
            s["body"],
        )
    )

    story.append(PageBreak())

    # 4 24 HOUR PATH
    story.append(Paragraph("4. A 24-hour Grokathon path (inspired, not mandatory)", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Use this if you want structure. Adapt freely. The point is momentum <b>with</b> integrity—not bureaucracy.",
            s["body"],
        )
    )
    story.append(step_card(
        1, "Hour 0–1 · Frame a public problem",
        "One sentence. No real private names. No real place names in sample copy. Who is helped? Who could be harmed?",
        s,
    ))
    story.append(step_card(
        2, "Hour 1–2 · Pick a Hive shape and stress the idea",
        "Integrity for contested truth. Four-agent for multi-role ops. Spine for mission clarity. Run Play once and note friction.",
        s,
    ))
    story.append(step_card(
        3, "Hour 2–4 · Walk a sample lesson or desk",
        "Use Learn / Samples / a related industry pack. Where would a first-time user freeze? That is your UX risk list.",
        s,
    ))
    story.append(step_card(
        4, "Hour 4–8 · Build the thinnest honest slice",
        "One flow, three claims tagged E/I/A, one human final call, one degraded-state message. Prefer truth over feature count.",
        s,
    ))
    story.append(step_card(
        5, "Hour 8–12 · OPSEC pass before you present",
        "Strip PII. Strip secrets. Prefer product HTTP demos. Read Help/Credits limits out loud as a team.",
        s,
    ))
    story.append(step_card(
        6, "Before judging · Tell the integrity story",
        "Show what you refused to automate. Show what stays incomplete. Show who decides. That is civic maturity.",
        s,
    ))

    # 5 IDEA SEEDS
    story.append(Paragraph("5. Civic idea seeds (sparks only)", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "These are <b>starting sparks</b> for brainstorming—not assigned challenges, not endorsed projects, "
            "and not permission to use restricted data. Keep demos generic and lawful.",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Spark", "Why it is hard (good)", "Integrity hook"],
            [
                [
                    "Public-records literacy coach",
                    "People drown in process language.",
                    "Teach method, not harvesting private lives.",
                ],
                [
                    "Permit pathway explainer",
                    "Steps feel opaque to newcomers.",
                    "Educational map only—never fake an official decision.",
                ],
                [
                    "Field notes trainer for infrastructure roles",
                    "Safety and documentation quality matter.",
                    "Not a substitute for licensed inspection.",
                ],
                [
                    "Oversight briefing builder",
                    "Leaders need short, honest packets.",
                    "Tri-state claims on every assertion.",
                ],
                [
                    "Civic onboarding companion",
                    "First-week confusion burns people out.",
                    "Dignity-first language; no manipulation patterns.",
                ],
                [
                    "Claims hygiene checklist for public dashboards",
                    "Pretty charts hide uncertainty.",
                    "Evidence vs inference visible in the UI.",
                ],
            ],
            [1.85 * inch, 2.25 * inch, 2.4 * inch],
            s,
        )
    )

    # 6 OPEN THE LAB
    story.append(Paragraph("6. Open the lab (share pack)", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "From the extracted share folder:",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "<font face='Courier'>npm install<br/>"
            "cp .env.example .env<br/>"
            "npm run dev</font><br/><br/>"
            "Open <font face='Courier'>http://127.0.0.1:8085/</font><br/>"
            "Optional live model: set server-side <font face='Courier'>XAI_API_KEY</font> only in "
            "<font face='Courier'>.env</font> (never in the browser, never in git).<br/>"
            "Without a key, offline educational replies still teach.",
            s["body"],
        )
    )
    story.append(Paragraph("Quick verify before you demo to others", s["h2"]))
    story.append(
        Paragraph(
            "<font face='Courier'>npm run test:shape</font> · "
            "<font face='Courier'>npm run audit:public</font> · "
            "<font face='Courier'>npm run test:e2e50</font>",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Tour: Home/Hive → Help (limits) → Credits (attribution) → one Sample/Learn path → "
            "one Tools/skill lens → optional Plan Lab (educational CAD only).",
            s["body"],
        )
    )

    story.append(PageBreak())

    # 7 PITCH CANVAS
    story.append(Paragraph("7. Grokathon pitch canvas (one page)", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Fill this before you present. Keep every field free of private data and real place names in samples.",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Field", "Your answer"],
            [
                ["Public mission (one sentence)", " "],
                ["Who is helped / who could be harmed", " "],
                ["The thinnest honest slice we built", " "],
                ["Claims on screen (tag E / I / A)", " "],
                ["Human final call (role + moment)", " "],
                ["What we refused to automate", " "],
                ["How we show incomplete / offline state", " "],
                ["OPSEC rules we enforced in the demo", " "],
                ["What we will verify after the weekend", " "],
            ],
            [2.5 * inch, 4.0 * inch],
            s,
        )
    )

    # 8 CLOSING
    story.append(Paragraph("8. Go build something defensible", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "The best civic prototypes from a weekend are not the ones that claim the most. "
            "They are the ones that <b>earn the right to be continued</b>—clear mission, honest claims, "
            "human accountability, and respect for the public’s data and attention.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Use Grok Tutor as a sparring partner for that standard. Remix. Teach. Stress-test. "
            "Then ship only what you can stand behind.",
            s["body"],
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(
        box(
            "<b>Legal &amp; educational limits.</b> Grok Tutor is an educational development resource (see LICENSE / MIT "
            "and NOTICE). It is not an accredited program, professional license, government system, or "
            "legal/medical authority. This guide is inspirational only and is not an official Grokathon rule set. "
            "Keep third-party attribution intact. Follow all event rules, platform terms, and applicable law.",
            s["warn"],
            CREAM,
            GOLD,
        )
    )
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Paragraph(
            "AdventureNLearn · Grok Tutor share companion · Built for builders who care about the public",
            s["small"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.7 * inch,
        title="Grokathon Inspirational Guide — Grok Tutor for Civic & Public Product Ideas",
        author="AdventureNLearn",
        subject="Inspirational guidance for Grokathon participants using Grok Tutor",
        keywords="Grokathon,Grok Tutor,civic,public,integrity,educational",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Wrote {OUT}")
    return OUT


if __name__ == "__main__":
    build()
