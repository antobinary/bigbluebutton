import { expect } from 'playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// The whiteboard tests assert behaviour through the tldraw DOM (shape presence, geometry, computed
// styles, text content) instead of full-page screenshots. Pixel snapshots were flaky here because
// the viewer's camera/zoom is not perfectly deterministic, so a shape can render a few pixels off
// and blow past the diff threshold even when the behaviour is correct.

// Reads the bounding box of the first element matching `selector`, throwing a descriptive error
// (instead of returning null) when the element is missing or has no layout box.
async function boundingBoxOrThrow(page: Page, selector: string, role: string, nth = 0) {
  const box = await page.page.locator(selector).nth(nth).boundingBox();
  if (!box) throw new Error(`boundingBox is null for "${selector}" (#${nth}) on the ${role} page`);
  return box;
}

// Asserts a shape was actually drawn on the given page: the matched shape must have a non-trivial
// box. Shapes in these tests are dragged across ~40% of the whiteboard, so a real shape is well
// above this threshold while a stray click/dot would fall below it.
export async function assertShapeDrawn(page: Page, selector: string, role: string) {
  const box = await boundingBoxOrThrow(page, selector, role);
  const minSize = 20; // px
  expect(box.width, `the drawn shape should have a meaningful width for the ${role}`).toBeGreaterThan(minSize);
  expect(box.height, `the drawn shape should have a meaningful height for the ${role}`).toBeGreaterThan(minSize);
}

// Asserts duplicate semantics geometrically: the two geo shapes must share the same size but sit
// at distinct positions. tldraw nudges the copy to a non-deterministic offset, so checking this
// invariant is what actually defines a duplicate.
export async function assertDuplicatedShapes(page: Page, role: string) {
  const [originalBox, duplicateBox] = await Promise.all([
    boundingBoxOrThrow(page, e.wbDrawnShape, role, 0),
    boundingBoxOrThrow(page, e.wbDrawnShape, role, 1),
  ]);
  const sizeTolerance = 2; // px, to absorb sub-pixel rendering differences
  expect(
    Math.abs(originalBox.width - duplicateBox.width),
    `the duplicated rectangle should keep the original width for the ${role}`,
  ).toBeLessThanOrEqual(sizeTolerance);
  expect(
    Math.abs(originalBox.height - duplicateBox.height),
    `the duplicated rectangle should keep the original height for the ${role}`,
  ).toBeLessThanOrEqual(sizeTolerance);
  const offset = Math.hypot(originalBox.x - duplicateBox.x, originalBox.y - duplicateBox.y);
  expect(offset, `the duplicated rectangle should be offset from the original for the ${role}`).toBeGreaterThan(
    sizeTolerance,
  );
}
