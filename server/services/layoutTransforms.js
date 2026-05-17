function clone(layout) {
  return structuredClone(layout);
}

/* ---------------- HEADLINE ---------------- */

function findHeadlineNode(layout) {

  const nodes =
    Object.values(layout.nodes);

  const textNodes =
    nodes.filter(
      (n) => n.type === "text"
    );

  if (textNodes.length === 0) {
    return null;
  }

  let headline = textNodes[0];

  textNodes.forEach((node) => {

    const current =
      node.style?.visual?.fontSize || 0;

    const largest =
      headline.style?.visual?.fontSize || 0;

    if (current > largest) {
      headline = node;
    }
  });

  return headline;
}

export function makeHeadlineSmaller(layout) {

  const updated = clone(layout);

  const headline =
    findHeadlineNode(updated);

  if (!headline) {
    return updated;
  }

  headline.style.visual.fontSize -= 10;

  return updated;
}

export function makeHeadlineBigger(layout) {

  const updated = clone(layout);

  const headline =
    findHeadlineNode(updated);

  if (!headline) {
    return updated;
  }

  headline.style.visual.fontSize += 10;

  return updated;
}

export function moveHeadlineTop(layout) {

  const updated = clone(layout);

  const headline =
    findHeadlineNode(updated);

  if (!headline) {
    return updated;
  }

  headline.y -= 100;

  return updated;
}

export function changeHeadlineColor(
  layout,
  color
) {

  const updated = clone(layout);

  const headline =
    findHeadlineNode(updated);

  if (!headline) {
    return updated;
  }

  headline.style.visual.color.value =
    color;

  return updated;
}

/* ---------------- PRODUCT ---------------- */

function findProductNode(layout) {

  const nodes =
    Object.values(layout.nodes);

  const images =
    nodes.filter(
      (n) =>
        n.type === "image" &&
        !n.name?.toLowerCase().includes("background")
    );

  if (images.length === 0) {
    return null;
  }

  let largest = images[0];

  images.forEach((img) => {

    const area =
      img.width * img.height;

    const largestArea =
      largest.width * largest.height;

    if (area > largestArea) {
      largest = img;
    }
  });

  return largest;
}

export function moveProductLeft(layout) {

  const updated = clone(layout);

  const product =
    findProductNode(updated);

  if (!product) {
    return updated;
  }

  product.x -= 80;

  return updated;
}

export function moveProductRight(layout) {

  const updated = clone(layout);

  const product =
    findProductNode(updated);

  if (!product) {
    return updated;
  }

  product.x += 80;

  return updated;
}

/* ---------------- BADGE ---------------- */

function findBadgeNode(layout) {

  const nodes =
    Object.values(layout.nodes);

  return nodes.find(
    (n) =>
      n.type === "shape" &&
      n.data?.shapeType === "circle"
  );
}

export function moveBadgeHigher(layout) {

  const updated = clone(layout);

  const badge =
    findBadgeNode(updated);

  if (!badge) {
    return updated;
  }

  badge.y -= 80;

  return updated;
}