const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ── Colors (no # prefix!) ──────────────────────────────────────────
const C = {
  darkBg:    "0D0D1A",
  lightBg:   "F7F7FA",
  blue:      "5B8CFA",
  violet:    "A78BFA",
  gold:      "F6C90E",
  textLight: "E8E8F0",
  textDark:  "1A1A2E",
  grey:      "9090B0",
  dimGrey:   "4A4A6A",
  cardBg:    "1A1A2E",
};

const SLIDE_W = 10;
const SLIDE_H = 5.625;

// ── Diagram paths ──────────────────────────────────────────────────
const DIAGRAMS = path.join(__dirname, "diagrams");
const IMG_NORMAL  = path.join(DIAGRAMS, "diagram_normal_modes.png");
const IMG_PHASE   = path.join(DIAGRAMS, "diagram_phase_portraits.png");
const IMG_RANK    = path.join(DIAGRAMS, "diagram_pagerank.png");

// ── Helpers ────────────────────────────────────────────────────────
function addLeftBar(slide) {
  slide.addShape("rect", { x: 0, y: 0, w: 0.07, h: SLIDE_H, fill: { color: C.blue } });
}

function addTopBar(slide) {
  slide.addShape("rect", { x: 0, y: 0, w: SLIDE_W, h: 0.06, fill: { color: C.blue } });
}

function darkCard(slide, x, y, w, h, opts = {}) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: C.cardBg },
    rectRadius: 0.05,
  });
  if (opts.microBar) {
    slide.addShape("rect", {
      x, y: y + 0.08, w: 0.05, h: h - 0.16,
      fill: { color: opts.microBarColor || C.blue },
    });
  }
}

// ── Presentation ───────────────────────────────────────────────────
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
// Actually we want 10x5.625 (standard widescreen 16:9)
pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
pptx.layout = "CUSTOM";

// ════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.darkBg };

  slide.addText("Eigenvectors:", {
    x: 0, y: 1.4, w: SLIDE_W, h: 0.8,
    fontSize: 52, fontFace: "Trebuchet MS", bold: true,
    color: C.textLight, align: "center", margin: 0,
  });

  slide.addText("Hiding in Plain Sight", {
    x: 0, y: 2.15, w: SLIDE_W, h: 0.8,
    fontSize: 52, fontFace: "Trebuchet MS", bold: true,
    color: C.blue, align: "center", margin: 0,
  });

  // Horizontal rule
  slide.addShape("rect", {
    x: 3, y: 3.05, w: 4, h: 0.025,
    fill: { color: C.blue },
  });

  // Subtitle
  slide.addText("Newtonian Society", {
    x: 0, y: 3.4, w: SLIDE_W, h: 0.5,
    fontSize: 18, fontFace: "Calibri", color: C.violet,
    align: "center", margin: 0,
  });

  // Attribution
  slide.addText("Mohammed", {
    x: 7.8, y: 5.1, w: 2, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: C.dimGrey,
    align: "right", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Map
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.lightBg };
  addLeftBar(slide);

  slide.addText("Eigenvectors Across Physics", {
    x: 0.35, y: 0.2, w: 9, h: 0.6,
    fontSize: 36, fontFace: "Trebuchet MS", bold: true,
    color: C.textDark, margin: 0,
  });

  const cards = [
    ["Quantum Mechanics", "Energy levels are eigenvalues of \u0124"],
    ["Normal Modes", "Natural frequencies of coupled systems"],
    ["Rigid Body Rotation", "Principal axes of inertia tensor"],
    ["Stability Analysis", "Jacobian eigenvalues classify fixed points"],
    ["PCA / Data", "Eigenvectors of covariance = hidden structure"],
    ["Google PageRank", "Dominant eigenvector ranks the web"],
    ["Special Relativity", "Null eigenvectors of Lorentz transform"],
    ["Fluid Dynamics", "Principal stresses in strain rate tensor"],
    ["Optics", "Polarisation states as Jones matrix eigenstates"],
  ];

  const cols = 3, rows = 3;
  const cardW = 2.85, cardH = 1.15;
  const startX = 0.5, startY = 1.05;
  const gapX = 0.15, gapY = 0.12;

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    const barColor = i % 2 === 0 ? C.blue : C.violet;

    // Card background
    slide.addShape("rect", {
      x, y, w: cardW, h: cardH,
      fill: { color: C.cardBg },
      rectRadius: 0.04,
    });
    // Left micro-bar
    slide.addShape("rect", {
      x, y: y + 0.08, w: 0.05, h: cardH - 0.16,
      fill: { color: barColor },
    });
    // Domain name
    slide.addText(card[0], {
      x: x + 0.15, y: y + 0.12, w: cardW - 0.25, h: 0.4,
      fontSize: 13, fontFace: "Calibri", bold: true,
      color: C.textLight, margin: 0, valign: "top",
    });
    // Description
    slide.addText(card[1], {
      x: x + 0.15, y: y + 0.52, w: cardW - 0.25, h: 0.55,
      fontSize: 11, fontFace: "Calibri",
      color: C.grey, margin: 0, valign: "top",
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 3 — Normal Modes
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.lightBg };
  addLeftBar(slide);

  slide.addText("Normal Modes: The Natural Language of a System", {
    x: 0.35, y: 0.15, w: 9, h: 0.55,
    fontSize: 32, fontFace: "Trebuchet MS", bold: true,
    color: C.textDark, margin: 0,
  });

  // LEFT column
  slide.addText("Two Coupled Pendulums", {
    x: 0.35, y: 0.8, w: 4.3, h: 0.4,
    fontSize: 20, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  slide.addText([
    { text: "Mode 1 (in-phase): Spring unstretched, pendulums swing together. Frequency \u03C9\u2081.", options: { fontSize: 13, fontFace: "Calibri", color: C.textDark, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Mode 2 (out-of-phase): Spring fully engaged. Higher frequency \u03C9\u2082.", options: { fontSize: 13, fontFace: "Calibri", color: C.textDark, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Any motion = superposition of these eigenmodes.", options: { fontSize: 13, fontFace: "Calibri", color: C.textDark, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Same structure governs molecular spectroscopy, phonon dispersion, and bridge resonance.", options: { fontSize: 13, fontFace: "Calibri", color: C.textDark } },
  ], {
    x: 0.35, y: 1.25, w: 4.3, h: 2.2,
    valign: "top", margin: 0,
  });

  // Key insight callout
  darkCard(slide, 0.35, 3.65, 4.3, 0.75);
  slide.addText("Eigenvectors are the directions the system prefers to move", {
    x: 0.5, y: 3.72, w: 4.0, h: 0.6,
    fontSize: 13, fontFace: "Calibri", bold: true,
    color: C.gold, margin: 0, valign: "middle",
  });

  // RIGHT column — diagram
  slide.addImage({
    path: IMG_NORMAL,
    x: 5.0, y: 0.85, w: 4.7, h: 2.6,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 4 — Quantum Mechanics (dark)
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.darkBg };
  addTopBar(slide);

  slide.addText("The Eigenvalue IS the Physics", {
    x: 0.4, y: 0.2, w: 9, h: 0.6,
    fontSize: 36, fontFace: "Trebuchet MS", bold: true,
    color: C.textLight, margin: 0,
  });

  // Large equation
  slide.addText("\u0124 |\u03C8\u27E9 = E |\u03C8\u27E9", {
    x: 0, y: 0.9, w: SLIDE_W, h: 0.8,
    fontSize: 42, fontFace: "Consolas", bold: true,
    color: C.gold, align: "center", margin: 0,
  });

  // LEFT column — what this means
  slide.addText("What this means", {
    x: 0.5, y: 1.85, w: 4.3, h: 0.35,
    fontSize: 18, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  slide.addText([
    { text: "Energy levels of atoms ARE eigenvalues of \u0124", options: { fontSize: 13, fontFace: "Calibri", color: C.textLight, bullet: true, breakLine: true } },
    { text: "Measurement always returns an eigenvalue", options: { fontSize: 13, fontFace: "Calibri", color: C.textLight, bullet: true, breakLine: true } },
    { text: 'System "collapses" to the corresponding eigenstate', options: { fontSize: 13, fontFace: "Calibri", color: C.textLight, bullet: true, breakLine: true } },
    { text: "Superposition is real physics, not ignorance", options: { fontSize: 13, fontFace: "Calibri", color: C.textLight, bullet: true } },
  ], {
    x: 0.5, y: 2.2, w: 4.3, h: 1.8,
    valign: "top", margin: 0,
    paraSpaceAfter: 6,
  });

  // RIGHT column — Spin-½ box
  darkCard(slide, 5.3, 1.85, 4.2, 2.2, { microBar: true, microBarColor: C.violet });

  slide.addText("Spin-\u00BD Example", {
    x: 5.55, y: 1.95, w: 3.8, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.violet, margin: 0,
  });

  slide.addText([
    { text: "The Pauli matrices (\u03C3x, \u03C3y, \u03C3z) are 2\u00D72 Hermitian operators.", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Their eigenstates |\u2191\u27E9 and |\u2193\u27E9 are the only possible outcomes of a spin measurement.", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Eigenvalues: +\u0127/2 and \u2212\u0127/2", options: { fontSize: 12, fontFace: "Calibri", color: C.gold, bold: true } },
  ], {
    x: 5.55, y: 2.35, w: 3.8, h: 1.6,
    valign: "top", margin: 0,
  });

  // Bottom strip
  slide.addText("Atomic spectra  \u00B7  Chemical bonding  \u00B7  Quantum computing \u2014 all rest on this eigendecomposition", {
    x: 0, y: 4.65, w: SLIDE_W, h: 0.5,
    fontSize: 13, fontFace: "Calibri", italic: true,
    color: C.violet, align: "center", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 5 — Inertia Tensor
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.lightBg };
  addLeftBar(slide);

  slide.addText("The Inertia Tensor: Why Objects Tumble", {
    x: 0.35, y: 0.15, w: 9, h: 0.55,
    fontSize: 32, fontFace: "Trebuchet MS", bold: true,
    color: C.textDark, margin: 0,
  });

  // LEFT column
  slide.addText("Principal Axes", {
    x: 0.35, y: 0.8, w: 4.5, h: 0.35,
    fontSize: 20, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  slide.addText("A rigid body\u2019s rotational inertia is not a scalar \u2014 it is a 3\u00D73 symmetric matrix I. Its eigenvectors define the principal axes: rotation about these is stable and clean.", {
    x: 0.35, y: 1.2, w: 4.5, h: 1.0,
    fontSize: 14, fontFace: "Calibri",
    color: C.textDark, margin: 0, valign: "top",
  });

  // Callout box
  darkCard(slide, 0.35, 2.35, 4.5, 1.15);
  slide.addText([
    { text: "Intermediate Axis Theorem", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.gold, breakLine: true } },
    { text: "(Dzhanibekov Effect)", options: { fontSize: 11, fontFace: "Calibri", color: C.gold, breakLine: true } },
    { text: "", options: { fontSize: 5, breakLine: true } },
    { text: "Rotation about the axis with the intermediate eigenvalue is unstable \u2014 the object flips.", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight } },
  ], {
    x: 0.5, y: 2.42, w: 4.2, h: 1.0,
    valign: "top", margin: 0,
  });

  slide.addText("Famously demonstrated with a T-handle on the ISS.", {
    x: 0.35, y: 3.6, w: 4.5, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true,
    color: C.grey, margin: 0,
  });

  // RIGHT column — matrix display
  darkCard(slide, 5.2, 0.8, 4.4, 3.2, { microBar: true, microBarColor: C.blue });

  slide.addText("Inertia Tensor", {
    x: 5.5, y: 0.9, w: 3.9, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  slide.addText([
    { text: "I  =", options: { fontSize: 16, fontFace: "Consolas", bold: true, color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 8, breakLine: true } },
    { text: "\u250C                          \u2510", options: { fontSize: 12, fontFace: "Consolas", color: C.grey, breakLine: true } },
    { text: "\u2502  I\u2093\u2093    \u2212I\u2093\u1D67   \u2212I\u2093\u1D68  \u2502", options: { fontSize: 13, fontFace: "Consolas", color: C.textLight, breakLine: true } },
    { text: "\u2502 \u2212I\u2093\u1D67    I\u1D67\u1D67   \u2212I\u1D67\u1D68  \u2502", options: { fontSize: 13, fontFace: "Consolas", color: C.textLight, breakLine: true } },
    { text: "\u2502 \u2212I\u2093\u1D68   \u2212I\u1D67\u1D68    I\u1D68\u1D68  \u2502", options: { fontSize: 13, fontFace: "Consolas", color: C.textLight, breakLine: true } },
    { text: "\u2514                          \u2518", options: { fontSize: 12, fontFace: "Consolas", color: C.grey, breakLine: true } },
    { text: "", options: { fontSize: 10, breakLine: true } },
    { text: "Eigenvectors \u2192 Principal axes", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.gold, breakLine: true } },
    { text: "Eigenvalues  \u2192 Moments of inertia", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.gold } },
  ], {
    x: 5.5, y: 1.3, w: 3.9, h: 2.5,
    valign: "top", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 6 — Stability / Phase Portraits
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.lightBg };
  addLeftBar(slide);

  slide.addText("Eigenvalues as a Crystal Ball", {
    x: 0.35, y: 0.15, w: 9, h: 0.5,
    fontSize: 36, fontFace: "Trebuchet MS", bold: true,
    color: C.textDark, margin: 0,
  });

  slide.addText("The Jacobian linearises any nonlinear system near a fixed point", {
    x: 0.35, y: 0.65, w: 9, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  // Phase portraits diagram
  slide.addImage({
    path: IMG_PHASE,
    x: 1.0, y: 1.1, w: 8.0, h: 3.5,
  });

  // Bottom line
  slide.addText("Two numbers \u2014 the eigenvalues of J \u2014 determine all possible local behaviours of any dynamical system", {
    x: 0.35, y: 4.8, w: 9.3, h: 0.4,
    fontSize: 13, fontFace: "Calibri",
    color: C.textDark, align: "center", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 7 — PageRank (dark)
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.darkBg };
  addTopBar(slide);

  slide.addText("Google\u2019s $300 Billion Eigenvector", {
    x: 0.4, y: 0.2, w: 9, h: 0.55,
    fontSize: 36, fontFace: "Trebuchet MS", bold: true,
    color: C.textLight, margin: 0,
  });

  const colW = 2.9, colH = 3.3;
  const colY = 0.9;
  const cols = [0.35, 3.5, 6.65];

  // Column 1 — The Model
  darkCard(slide, cols[0], colY, colW, colH, { microBar: true, microBarColor: C.blue });
  slide.addText("The Model", {
    x: cols[0] + 0.2, y: colY + 0.1, w: colW - 0.3, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });
  slide.addText([
    { text: "Model the web as a directed graph. Each page is a node; links are edges.", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Build transition matrix M:", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "M\u1D62\u2C7C = 1/k\u2C7C", options: { fontSize: 14, fontFace: "Consolas", bold: true, color: C.gold, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "where k\u2C7C is the out-degree of page j. This is a column-stochastic matrix.", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight } },
  ], {
    x: cols[0] + 0.2, y: colY + 0.5, w: colW - 0.3, h: colH - 0.7,
    valign: "top", margin: 0,
  });

  // Column 2 — The Computation
  darkCard(slide, cols[1], colY, colW, colH, { microBar: true, microBarColor: C.violet });
  slide.addText("The Computation", {
    x: cols[1] + 0.2, y: colY + 0.1, w: colW - 0.3, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.violet, margin: 0,
  });
  slide.addText([
    { text: "Power iteration:", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "v\u2099\u208A\u2081 = M \u00B7 v\u2099", options: { fontSize: 14, fontFace: "Consolas", bold: true, color: C.gold, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Multiply any vector by M repeatedly \u2192 converges to dominant eigenvector (\u03BB = 1).", options: { fontSize: 12, fontFace: "Calibri", color: C.textLight, breakLine: true } },
    { text: "", options: { fontSize: 6, breakLine: true } },
    { text: "Perron\u2013Frobenius theorem guarantees convergence for stochastic matrices.", options: { fontSize: 12, fontFace: "Calibri", color: C.grey } },
  ], {
    x: cols[1] + 0.2, y: colY + 0.5, w: colW - 0.3, h: colH - 0.7,
    valign: "top", margin: 0,
  });

  // Column 3 — The Result
  darkCard(slide, cols[2], colY, colW, colH, { microBar: true, microBarColor: C.gold });
  slide.addText("The Result", {
    x: cols[2] + 0.2, y: colY + 0.1, w: colW - 0.3, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.gold, margin: 0,
  });
  slide.addImage({
    path: IMG_RANK,
    x: cols[2] + 0.15, y: colY + 0.5, w: colW - 0.3, h: 2.0,
  });
  slide.addText("Each node\u2019s score = its eigenvector component", {
    x: cols[2] + 0.15, y: colY + 2.55, w: colW - 0.3, h: 0.6,
    fontSize: 11, fontFace: "Calibri",
    color: C.grey, margin: 0, valign: "top", align: "center",
  });

  // Bottom strip
  slide.addText("Every search result you have ever seen was ranked by an eigenvector", {
    x: 0, y: 4.65, w: SLIDE_W, h: 0.5,
    fontSize: 14, fontFace: "Calibri", italic: true,
    color: C.gold, align: "center", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 8 — PCA
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.lightBg };
  addLeftBar(slide);

  slide.addText("What Does Your Data Want to Be?", {
    x: 0.35, y: 0.15, w: 9, h: 0.55,
    fontSize: 34, fontFace: "Trebuchet MS", bold: true,
    color: C.textDark, margin: 0,
  });

  slide.addText("Principal Component Analysis", {
    x: 0.35, y: 0.72, w: 9, h: 0.35,
    fontSize: 20, fontFace: "Calibri", bold: true,
    color: C.blue, margin: 0,
  });

  // LEFT — Method
  slide.addText("Method", {
    x: 0.35, y: 1.2, w: 4.5, h: 0.35,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.violet, margin: 0,
  });

  slide.addText("Compute covariance matrix \u03A3 of your dataset. Its eigenvectors = principal components: directions of maximum variance. Project onto top eigenvectors to reduce dimensionality without losing information.", {
    x: 0.35, y: 1.55, w: 4.5, h: 1.6,
    fontSize: 14, fontFace: "Calibri",
    color: C.textDark, margin: 0, valign: "top",
  });

  // Key formula
  darkCard(slide, 0.35, 3.3, 4.5, 0.65);
  slide.addText("\u03A3 v\u1D62 = \u03BB\u1D62 v\u1D62    \u2014    largest \u03BB = most variance", {
    x: 0.5, y: 3.37, w: 4.2, h: 0.5,
    fontSize: 13, fontFace: "Consolas", bold: true,
    color: C.gold, margin: 0, valign: "middle",
  });

  // RIGHT — 2x2 application grid
  const apps = [
    ["Facial Recognition", "Eigenfaces decompose face space"],
    ["Genomics", "Genetic ancestry as eigenvectors"],
    ["LHC Physics", "Signal/background separation"],
    ["Climate Science", "El Ni\u00F1o patterns from eigendecomposition"],
  ];

  const miniW = 2.15, miniH = 1.15;
  const miniStartX = 5.2;
  const miniStartY = 1.15;
  const miniGapX = 0.1, miniGapY = 0.1;

  apps.forEach((app, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = miniStartX + col * (miniW + miniGapX);
    const y = miniStartY + row * (miniH + miniGapY);

    darkCard(slide, x, y, miniW, miniH, { microBar: true, microBarColor: i % 2 === 0 ? C.blue : C.violet });

    slide.addText(app[0], {
      x: x + 0.18, y: y + 0.12, w: miniW - 0.28, h: 0.35,
      fontSize: 13, fontFace: "Calibri", bold: true,
      color: C.textLight, margin: 0,
    });
    slide.addText(app[1], {
      x: x + 0.18, y: y + 0.5, w: miniW - 0.28, h: 0.55,
      fontSize: 11, fontFace: "Calibri",
      color: C.grey, margin: 0, valign: "top",
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 9 — The Unifying Idea (dark)
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.darkBg };
  addTopBar(slide);

  slide.addText("Why Everywhere?", {
    x: 0, y: 0.25, w: SLIDE_W, h: 0.6,
    fontSize: 40, fontFace: "Trebuchet MS", bold: true,
    color: C.textLight, align: "center", margin: 0,
  });

  slide.addText("Eigenvectors are the invariant directions of a transformation", {
    x: 0.5, y: 0.95, w: 9, h: 0.5,
    fontSize: 22, fontFace: "Calibri", italic: true,
    color: C.violet, align: "center", margin: 0,
  });

  // Three tall cards
  const tallW = 2.8, tallH = 2.6;
  const tallY = 1.65;
  const tallCols = [0.55, 3.6, 6.65];

  const cardData = [
    { title: "What Nature Prefers", items: "Normal modes\nQuantum states\nOrbital shapes", barColor: C.blue },
    { title: "What Stays Stable", items: "Principal axes\nFixed point classification\nPhysical equilibria", barColor: C.violet },
    { title: "What Persists", items: "PageRank scores\nPrincipal components\nDominant frequencies", barColor: C.gold },
  ];

  cardData.forEach((cd, i) => {
    const x = tallCols[i];
    darkCard(slide, x, tallY, tallW, tallH, { microBar: true, microBarColor: cd.barColor });

    slide.addText(cd.title, {
      x: x + 0.2, y: tallY + 0.15, w: tallW - 0.35, h: 0.4,
      fontSize: 16, fontFace: "Calibri", bold: true,
      color: cd.barColor, margin: 0,
    });

    const items = cd.items.split("\n");
    slide.addText(
      items.map((item, j) => ({
        text: item,
        options: {
          fontSize: 14, fontFace: "Calibri", color: C.textLight,
          bullet: true,
          breakLine: j < items.length - 1,
        },
      })),
      {
        x: x + 0.2, y: tallY + 0.65, w: tallW - 0.35, h: tallH - 0.9,
        valign: "top", margin: 0,
        paraSpaceAfter: 8,
      }
    );
  });

  // Bottom quote
  slide.addText("The eigenvalue tells you how much. The eigenvector tells you where. Together: the grammar of linear physics.", {
    x: 0.5, y: 4.5, w: 9, h: 0.6,
    fontSize: 15, fontFace: "Calibri",
    color: C.textLight, align: "center", margin: 0,
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 10 — Closing (dark)
// ════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.darkBg };

  // Large quote
  slide.addText('\u201CThe most important theorem in applied mathematics.\u201D', {
    x: 0.5, y: 0.55, w: 9, h: 0.8,
    fontSize: 32, fontFace: "Trebuchet MS", italic: true,
    color: C.gold, align: "center", margin: 0,
  });

  slide.addText("Some argue eigendecomposition is the single most powerful tool in mathematics. After today \u2014 do you agree?", {
    x: 0.8, y: 1.45, w: 8.4, h: 0.5,
    fontSize: 16, fontFace: "Calibri",
    color: C.textLight, align: "center", margin: 0,
  });

  // Three discussion prompt cards
  const prompts = [
    "Can you think of a physical system not covered today that probably has eigenvectors hiding in it?",
    "Why do symmetric matrices always have real eigenvalues? What does that mean physically?",
    "What breaks when a matrix is not diagonalisable? What does that look like in physics?",
  ];

  const pW = 2.85, pH = 1.6;
  const pY = 2.25;
  const pCols = [0.45, 3.575, 6.7];

  prompts.forEach((prompt, i) => {
    const x = pCols[i];
    darkCard(slide, x, pY, pW, pH, { microBar: true, microBarColor: C.blue });

    slide.addText(`Discussion ${i + 1}`, {
      x: x + 0.2, y: pY + 0.1, w: pW - 0.3, h: 0.3,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: C.blue, margin: 0,
    });

    slide.addText(prompt, {
      x: x + 0.2, y: pY + 0.45, w: pW - 0.3, h: pH - 0.6,
      fontSize: 12, fontFace: "Calibri",
      color: C.textLight, margin: 0, valign: "top",
    });
  });

  // Bottom — Newtonian Society
  slide.addText("Newtonian Society", {
    x: 0, y: 4.7, w: SLIDE_W, h: 0.5,
    fontSize: 14, fontFace: "Calibri",
    color: C.violet, align: "center", margin: 0,
  });
}

// ── Save ───────────────────────────────────────────────────────────
const outDir = fs.existsSync("/mnt/user-data/outputs") ? "/mnt/user-data/outputs" : path.join(__dirname, "outputs");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "eigenvectors_newtonian_society.pptx");

pptx.writeFile({ fileName: outPath })
  .then(() => console.log("Presentation saved to:", outPath))
  .catch(err => { console.error("Error:", err); process.exit(1); });
