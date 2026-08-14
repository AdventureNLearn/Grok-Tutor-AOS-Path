#!/usr/bin/env python3
"""Polished PDF: using Grok Tutor to develop civic/public product ideas.
Educational framing only — no overclaims, no real jurisdiction samples."""

from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
    ListFlowable,
    ListItem,
)

OUT = Path(r"C:\AOS\logs\share-packs\Grok-Tutor-Civic-Product-Ideation-Guide.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

# Palette — calm civic / integrity (dark navy + teal accent)
NAVY = colors.HexColor("#0B1F33")
TEAL = colors.HexColor("#1A7A6D")
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
LINE = colors.HexColor("#CBD5E1")
SOFT = colors.HexColor("#F1F5F9")
WARN_BG = colors.HexColor("#FEF3C7")
WARN_FG = colors.HexColor("#92400E")


def styles():
    base = getSampleStyleSheet()
    s = {
        "cover_kicker": ParagraphStyle(
            "cover_kicker",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=TEAL,
            alignment=TA_CENTER,
            spaceAfter=8,
            tracking=1,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            textColor=NAVY,
            alignment=TA_CENTER,
            leading=32,
            spaceAfter=12,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            textColor=SLATE,
            alignment=TA_CENTER,
            leading=17,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=NAVY,
            spaceBefore=16,
            spaceAfter=8,
            leading=20,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            textColor=TEAL,
            spaceBefore=12,
            spaceAfter=6,
            leading=16,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE,
            alignment=TA_JUSTIFY,
            leading=14,
            spaceAfter=8,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE,
            leading=13.5,
            leftIndent=8,
            spaceAfter=3,
        ),
        "callout": ParagraphStyle(
            "callout",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=WARN_FG,
            leading=13,
            alignment=TA_LEFT,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=SLATE,
            leading=12,
        ),
        "table_head": ParagraphStyle(
            "table_head",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=NAVY,
            leading=12,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            textColor=MUTED,
            leading=11,
            spaceAfter=6,
        ),
    }
    return s


def hr():
    return HRFlowable(width="100%", thickness=0.6, color=LINE, spaceBefore=4, spaceAfter=10)


def callout_box(text, s):
    inner = Paragraph(text, s["callout"])
    t = Table([[inner]], colWidths=[6.5 * inch])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WARN_BG),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#F59E0B")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


def ptable(headers, rows, col_widths, s):
    head = [Paragraph(h, s["table_head"]) for h in headers]
    body = [[Paragraph(c, s["table_cell"]) for c in row] for row in rows]
    data = [head] + body
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), SOFT),
                ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT]),
            ]
        )
    )
    return t


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(0.75 * inch, 0.6 * inch, letter[0] - 0.75 * inch, 0.6 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        0.75 * inch,
        0.4 * inch,
        "Grok Tutor · Civic & Public Product Ideation Guide  ·  Educational use only",
    )
    canvas.drawRightString(letter[0] - 0.75 * inch, 0.4 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build():
    s = styles()
    story = []

    # ── Cover ──
    story.append(Spacer(1, 1.3 * inch))
    story.append(Paragraph("ADVENTURENLEARN · EDUCATIONAL PRODUCT LAB", s["cover_kicker"]))
    story.append(Paragraph("Grok Tutor &amp; The Hive", s["cover_title"]))
    story.append(
        Paragraph(
            "A practical guide for using this educational platform to develop<br/>"
            "product ideas for real-world <b>civic and public</b> use",
            s["cover_sub"],
        )
    )
    story.append(Spacer(1, 0.25 * inch))
    story.append(hr())
    story.append(
        Paragraph(
            f"Share companion · {date.today().isoformat()} · Local lab pack<br/>"
            "Integrity-first · No overclaims · Public-facing OPSEC habits",
            s["cover_sub"],
        )
    )
    story.append(Spacer(1, 0.5 * inch))
    story.append(
        callout_box(
            "<b>What this document is not.</b> It is not accreditation, a professional license, "
            "legal or medical advice, or a government endorsement. Grok Tutor is an "
            "<b>educational development resource</b>. Real civic products require your own "
            "compliance review, licensed professionals where required, and honest limits on claims.",
            s,
        )
    )
    story.append(PageBreak())

    # ── 1 Purpose ──
    story.append(Paragraph("1. Purpose of this guide", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "You received a share pack of <b>Grok Tutor</b> (with <b>The Hive</b> as its "
            "spatial learning home). This guide shows how to use it as a <b>product ideation lab</b> "
            "for civic and public-interest software—not as a finished government system.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Civic and public products succeed when they are <b>honest about evidence</b>, "
            "<b>safe with personal data</b>, <b>clear about who decides</b>, and "
            "<b>usable by people who are not experts</b>. The Hive was built to practice those habits "
            "while you explore ideas.",
            s["body"],
        )
    )

    story.append(Paragraph("1.1 What Grok Tutor is good for", s["h2"]))
    bullets = [
        "Exploring craft and industry learning flows (trades, civic-adjacent roles, public service concepts) with plain language.",
        "Stress-testing whether an idea can be taught, practiced, and measured without inventing authority.",
        "Using orchestration shapes (spine, integrity triangle, four-agent, claim diamond) to structure multi-role work.",
        "Running local verification (route suites, OPSEC hygiene checks) before you show anything publicly.",
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", s["bullet"]))

    story.append(Paragraph("1.2 What you must not claim", s["h2"]))
    for b in [
        "That the app is an accredited school, credential, or certificate program.",
        "That it replaces licensed professionals (inspectors, clinicians, attorneys, engineers).",
        "That offline educational replies are the same as live expert judgment.",
        "That a demo sample is about a real named place, person, or case unless you have a lawful, scrubbed source.",
    ]:
        story.append(Paragraph(f"• {b}", s["bullet"]))

    # ── 2 Integrity ──
    story.append(Paragraph("2. Integrity habits for public products", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Public trust fails when software overclaims. Use these four habits on every civic idea "
            "you develop with this lab:",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Habit", "Practice in Grok Tutor", "Carry into your product"],
            [
                [
                    "Tri-state claims",
                    "Mark what is known / inferred / unknown in lessons and Hive scenarios.",
                    "UI shows Evidence vs Inference vs Assumption; never green-wash uncertainty.",
                ],
                [
                    "Human final call",
                    "Orchestration and tools support judgment; they do not replace it.",
                    "Workflows end with a human decision owner—not an automated decree.",
                ],
                [
                    "Clean share",
                    "Samples avoid real PII and real place names; product URLs stay local until scrubbed.",
                    "Export packs pass OPSEC review before public release.",
                ],
                [
                    "Honest incomplete",
                    "Soft failures and missing data are visible; do not invent success.",
                    "Degraded mode says what is offline instead of fake completeness.",
                ],
            ],
            [1.3 * inch, 2.5 * inch, 2.7 * inch],
            s,
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(
        Paragraph(
            "Attribution for integrity lineage (conceptual, not embedded software): see in-app "
            "<b>/credits</b>, <b>NOTICE</b>, and README (CAI-OS / related notices as specified).",
            s["small"],
        )
    )

    # ── 3 Hive map ──
    story.append(Paragraph("3. The Hive as a civic design studio", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "The Hive is a 3D (and 2D fallback) home of learning “combs” and desks. For civic ideation, "
            "treat each shape as a <b>thinking room</b> for a product question—not decoration.",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Shape / mode", "Civic product question it forces"],
            [
                [
                    "Mission spine",
                    "What is the single public mission? What must not be traded away for convenience?",
                ],
                [
                    "Integrity triangle",
                    "What is evidence, what is inference, and what must stay undecided until checked?",
                ],
                [
                    "Four-agent field",
                    "Which roles (field, analysis, oversight, public communication) must collaborate—and where do they conflict?",
                ],
                [
                    "Claim diamond",
                    "Can every claim on the product surface be backed, scoped, or withdrawn cleanly?",
                ],
                [
                    "Sense orbit / deep mode",
                    "What external senses (records, maps, reports) are allowed—and what stays quarantined until gated?",
                ],
            ],
            [1.8 * inch, 4.7 * inch],
            s,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        Paragraph(
            "Demo entry (local): open <font face='Courier'>http://127.0.0.1:8085/?orch=1&amp;shape=integrity-triangle</font> "
            "(or <font face='Courier'>four-agent</font>, <font face='Courier'>spine</font>). "
            "URL parameters should win over saved editor state so shared links stay honest.",
            s["body"],
        )
    )

    # ── 4 Workflow ──
    story.append(Paragraph("4. A repeatable ideation workflow", s["h1"]))
    story.append(hr())
    story.append(Paragraph("4.1 From public problem to product sketch", s["h2"]))
    steps = [
        "<b>Frame the public problem</b> in one sentence without naming a real private individual or a specific municipality in sample content.",
        "<b>Pick a Hive shape</b> that matches the risk (integrity for contested claims; four-agent for multi-role ops; spine for mission clarity).",
        "<b>Walk a sample lesson or desk</b> in a related industry pack—note where learners get stuck; that is your UX risk map.",
        "<b>Write three claims</b> your future product might show. Tag each Evidence / Inference / Assumption.",
        "<b>Define the human final call</b>—who signs off before anything is shared outside the team.",
        "<b>List OPSEC rules</b>—no raw bulk promotion, no secrets in client code, no PII in demos.",
        "<b>Verify locally</b> with the pack’s scripts (shape contract, public audit, E2E) before inviting outsiders.",
    ]
    for i, st in enumerate(steps, 1):
        story.append(Paragraph(f"<b>{i}.</b> {st}", s["bullet"]))

    story.append(Paragraph("4.2 Example civic product directions (generic)", s["h2"]))
    story.append(
        Paragraph(
            "These are <b>idea seeds</b>, not product commitments. Adapt only with lawful data and local policy.",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Idea seed", "Hive practice", "Public-use caution"],
            [
                [
                    "Public-records literacy tutor",
                    "Claim diamond + evidence-gate skill",
                    "Teach process, not doxxing; no bulk scrapes in the product demo.",
                ],
                [
                    "Permit pathway explainer",
                    "Spine + path desk",
                    "Educational map only—not official determinations; link to real authority when live.",
                ],
                [
                    "Infrastructure field notes trainer",
                    "Four-agent + on-the-job mode",
                    "Safety first; not a substitute for licensed inspection.",
                ],
                [
                    "Oversight briefing builder",
                    "Integrity triangle + progress notes",
                    "Human final call; tri-state claims on every assertion.",
                ],
                [
                    "Civic onboarding coach",
                    "Learn modes + plain-language samples",
                    "Accessibility and dignity; avoid political manipulation patterns.",
                ],
            ],
            [1.7 * inch, 2.0 * inch, 2.8 * inch],
            s,
        )
    )

    story.append(PageBreak())

    # ── 5 OPSEC ──
    story.append(Paragraph("5. OPSEC for civic and public demos", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "If your idea will face the public, treat every demo as if it will be screenshotted.",
            s["body"],
        )
    )
    for b in [
        "<b>No real PII</b> in samples, screenshots, or share packs (names, phones, exact addresses of private people).",
        "<b>No real municipality names</b> in product samples or public docs unless you have an explicit, scrubbed publication path.",
        "<b>No secrets in the client or zip</b>—API keys only in server env; share packs exclude <font face='Courier'>.env</font>.",
        "<b>Product URLs only</b> for demos (<font face='Courier'>http://127.0.0.1:8085</font> locally)—avoid raw drive paths and file-scheme opens in presentations.",
        "<b>Quarantine bulk intake</b>—external scrapes and dumps stay out of the product until a deliberate gate.",
        "<b>Attribution</b>—keep Credits / NOTICE accurate; do not strip third-party notices.",
    ]:
        story.append(Paragraph(f"• {b}", s["bullet"]))

    story.append(Paragraph("5.1 Suggested local checks before you share", s["h2"]))
    story.append(
        Paragraph(
            "<font face='Courier'>npm run test:shape</font> — orchestration shape / URL contract<br/>"
            "<font face='Courier'>npm run audit:public</font> — claims &amp; OPSEC hygiene scan<br/>"
            "<font face='Courier'>npm run test:e2e50</font> — core feature surface<br/>"
            "Optional long soak: <font face='Courier'>npm run test:sim1h</font> · dual observe: <font face='Courier'>npm run open:observe</font>",
            s["body"],
        )
    )

    # ── 6 Hands-on ──
    story.append(Paragraph("6. Hands-on: open the lab", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "<b>Install</b> (from the share pack folder):",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "<font face='Courier'>npm install<br/>"
            "cp .env.example .env<br/>"
            "npm run dev</font><br/><br/>"
            "Open <font face='Courier'>http://127.0.0.1:8085/</font> — default port in this pack is <b>8085</b> "
            "(keep other local tools free).",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Without an API key, offline educational replies still run. With a server-side key "
            "(never in the browser), Live Learn can use a configured model—still educational, still human-owned.",
            s["body"],
        )
    )
    story.append(Paragraph("6.1 First-hour tour for a civic collaborator", s["h2"]))
    for b in [
        "Home / Hive — orient on combs and desks; try Edit → Play with a scenario shape.",
        "Help — read the educational limits out loud with your collaborator.",
        "Credits — confirm attribution and lineage before remixing.",
        "Samples / Learn — run one plain-language craft or civic-adjacent sample end to end.",
        "Tools / skills — open evidence-gate or clear-lens style tools and apply them to a fake claim.",
        "Plan Lab (CAD) — optional; educational only, not a fabrication authority.",
        "Get yours — if they need their own quota/access path for learners.",
    ]:
        story.append(Paragraph(f"• {b}", s["bullet"]))

    # ── 7 Decision canvas ──
    story.append(Paragraph("7. One-page product decision canvas", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Copy this canvas into your notes for every civic product idea. Fill it before writing code.",
            s["body"],
        )
    )
    story.append(
        ptable(
            ["Field", "Your answer (keep scrubbed)"],
            [
                ["Public mission (one sentence)", " "],
                ["Who is helped / who could be harmed", " "],
                ["Claims we will show (E / I / A)", " "],
                ["Human final call (role + when)", " "],
                ["Data we will never put in demos", " "],
                ["Licensed work we refuse to automate", " "],
                ["Success metric that is not vanity", " "],
                ["OPSEC gate before public share", " "],
            ],
            [2.4 * inch, 4.1 * inch],
            s,
        )
    )

    # ── 8 Closing ──
    story.append(Paragraph("8. Closing stance", s["h1"]))
    story.append(hr())
    story.append(
        Paragraph(
            "Grok Tutor is a place to <b>practice building learning products that deserve public trust</b>. "
            "Use it to pressure-test ideas, teach integrity under load, and refuse shortcuts that look polished "
            "but fail the public.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "When you leave the lab for real deployment: run your own legal, security, and accessibility review; "
            "keep ship gates honest; and never let a green demo substitute for evidence.",
            s["body"],
        )
    )
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        callout_box(
            "<b>License &amp; credits.</b> Software license: see LICENSE (MIT unless otherwise noted). "
            "Third-party and conceptual lineage: NOTICE and /credits. "
            "Do not strip attribution. Do not present CAI-OS patents or notices as your own credentials.",
            s,
        )
    )
    story.append(Spacer(1, 0.25 * inch))
    story.append(
        Paragraph(
            "© AdventureNLearn · Educational share companion · Not for credential marketing",
            s["small"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.75 * inch,
        title="Grok Tutor — Civic & Public Product Ideation Guide",
        author="AdventureNLearn",
        subject="Educational guide for civic product ideation using Grok Tutor",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Wrote {OUT}")
    return OUT


if __name__ == "__main__":
    build()
