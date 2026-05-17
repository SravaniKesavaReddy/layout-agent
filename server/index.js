import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =========================
// GROQ CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =========================
// HISTORY STACK
// =========================
let history = [];
let future = [];

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// =========================
// SAFE HELPERS
// =========================
function getArtboard(layout) {
  const artboardId = layout?.rootNodes?.[0];
  return layout?.nodes?.[artboardId];
}

// =========================
// SMART LAYOUT ENGINE
// =========================
function smartLayoutEngine(layout, message) {
  const lower = message.toLowerCase();
  const updated = clone(layout);

  if (!updated?.nodes) return updated;

  const artboard = getArtboard(updated);
  if (!artboard) return updated;

  const children = artboard.children || [];

  let headlineId = null;
  let productId = null;
  let badgeId = null;

  // -------- DETECT ELEMENTS --------
  for (const id of children) {
    const node = updated.nodes?.[id];
    if (!node) continue;

    // headline = largest text
    if (node.type === "text") {
      headlineId = headlineId || id;
    }

    // product = image
    if (node.type === "image") {
      productId = productId || id;
    }

    // badge
    if (
      node.type === "shape" ||
      (node.type === "text" && node.data?.content?.includes("%"))
    ) {
      badgeId = badgeId || id;
    }
  }

  // =========================
  // ACTIONS
  // =========================

  // FIX / IMPROVE MODE
  if (
    lower.includes("fix") ||
    lower.includes("better") ||
    lower.includes("improve") ||
    lower.includes("clean")
  ) {
    if (headlineId) {
      updated.nodes[headlineId].x = 80;
      updated.nodes[headlineId].y = 100;
    }

    if (productId) {
      updated.nodes[productId].x = 250;
      updated.nodes[productId].y = 260;
    }

    if (badgeId) {
      updated.nodes[badgeId].x = 420;
      updated.nodes[badgeId].y = 80;
    }

    return updated;
  }

  // HEADLINE SMALLER
  if (lower.includes("headline") && lower.includes("smaller")) {
    if (headlineId) {
      const node = updated.nodes[headlineId];
      node.style = node.style || {};
      node.style.visual = node.style.visual || {};
      node.style.visual.fontSize =
        Math.max(10, (node.style.visual.fontSize || 24) - 5);
    }
  }

  // HEADLINE BIGGER
  if (lower.includes("headline") && lower.includes("bigger")) {
    if (headlineId) {
      const node = updated.nodes[headlineId];
      node.style = node.style || {};
      node.style.visual = node.style.visual || {};
      node.style.visual.fontSize =
        (node.style.visual.fontSize || 24) + 5;
    }
  }

  // PRODUCT LEFT
  if (lower.includes("product") && lower.includes("left")) {
    if (productId) {
      updated.nodes[productId].x -= 50;
    }
  }

  // PRODUCT RIGHT
  if (lower.includes("product") && lower.includes("right")) {
    if (productId) {
      updated.nodes[productId].x += 50;
    }
  }

  // BADGE HIGHER
  if (lower.includes("badge") && lower.includes("higher")) {
    if (badgeId) {
      updated.nodes[badgeId].y -= 40;
    }
  }

  return updated;
}

// =========================
// AUTO FIX ENGINE (SMART DESIGN RESET)
// =========================
function autoLayoutFix(layout) {
  const updated = clone(layout);

  const artboard = getArtboard(updated);
  if (!artboard) return updated;

  const children = artboard.children || [];

  const centerX = artboard.width / 2;
  let y = 100;

  for (const id of children) {
    const node = updated.nodes?.[id];
    if (!node) continue;

    node.x = centerX - (node.width || 50) / 2;
    node.y = y;

    y += (node.height || 60) + 30;
  }

  return updated;
}

// =========================
// ROUTES
// =========================
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// =========================
// CHAT API
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message, layout } = req.body;

    if (!layout) {
      return res.status(400).json({
        reply: "Missing layout",
        updatedLayout: {},
      });
    }

    let updatedLayout = clone(layout);

    const lower = message.toLowerCase();

    // -------- SMART MODE --------
    if (
      lower.includes("fix") ||
      lower.includes("better") ||
      lower.includes("clean")
    ) {
      updatedLayout = autoLayoutFix(updatedLayout);
    } else {
      updatedLayout = smartLayoutEngine(updatedLayout, message);
    }

    // -------- HISTORY --------
    history.push(clone(layout));
    future = [];

    // -------- AI TEXT ONLY --------
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Return only a short UI assistant reply.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Updated successfully";

    res.json({
      reply,
      updatedLayout,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      reply: "AI failed",
      updatedLayout: req.body.layout,
    });
  }
});

// =========================
// UNDO
// =========================
app.post("/api/undo", (req, res) => {
  try {
    if (history.length === 0) {
      return res.json({
        reply: "Nothing to undo",
        updatedLayout: req.body.layout,
      });
    }

    const previous = history.pop();
    future.push(clone(req.body.layout));

    res.json({
      reply: "Undo successful",
      updatedLayout: previous,
    });
  } catch {
    res.status(500).json({ reply: "Undo failed" });
  }
});

// =========================
// REDO
// =========================
app.post("/api/redo", (req, res) => {
  try {
    if (future.length === 0) {
      return res.json({
        reply: "Nothing to redo",
        updatedLayout: req.body.layout,
      });
    }

    const next = future.pop();
    history.push(clone(req.body.layout));

    res.json({
      reply: "Redo successful",
      updatedLayout: next,
    });
  } catch {
    res.status(500).json({ reply: "Redo failed" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});