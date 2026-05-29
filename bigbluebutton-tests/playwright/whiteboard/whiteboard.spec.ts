import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { ChangeStyles } from './changeStyles';
import { DrawShape } from './drawShape';
import { ShapeOptions } from './shapeOptions';
import { ShapeTools } from './shapeTools';
import { TextShape } from './textShape';
import { WhiteboardResize } from './whiteboardResize';

async function runResizeTest(
  method: 'cameraResync' | 'cameraResyncVisual' | 'cameraResyncZoomedVisual' | 'cameraResyncAfterMinimizeRestore',
  browser: Browser,
  context: BrowserContext,
  page: Page,
  testInfo: TestInfo,
) {
  const resize = new WhiteboardResize(browser, context);
  await resize.initModPage(page, { testInfo });
  await resize.initUserPage(context, { testInfo });
  await resize[method]();
}

test.describe.parallel('Whiteboard tools', { tag: '@ci' }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Drawing visual regression tests are enabled only for Chromium');
  });

  test('Draw rectangle', async ({ browser, context, page }, testInfo) => {
    const rectangle = new DrawShape(browser, context);
    await rectangle.initModPage(page, { testInfo });
    await rectangle.initUserPage(context, { testInfo });
    await rectangle.drawShape(e.wbRectangleShape);
  });

  test('Draw ellipse', async ({ browser, context, page }, testInfo) => {
    const ellipse = new DrawShape(browser, context);
    await ellipse.initModPage(page, { testInfo });
    await ellipse.initUserPage(context, { testInfo });
    await ellipse.drawShape(e.wbEllipseShape);
  });

  test('Draw triangle', async ({ browser, context, page }, testInfo) => {
    const triangle = new DrawShape(browser, context);
    await triangle.initModPage(page, { testInfo });
    await triangle.initUserPage(context, { testInfo });
    await triangle.drawShape(e.wbTriangleShape);
  });

  test('Draw line', async ({ browser, context, page }, testInfo) => {
    const line = new DrawShape(browser, context);
    await line.initModPage(page, { testInfo });
    await line.initUserPage(context, { testInfo });
    await line.drawShape(e.wbLineShape, e.wbDrawnLine);
  });

  test('Draw arrow', async ({ browser, context, page }, testInfo) => {
    const arrow = new DrawShape(browser, context);
    await arrow.initModPage(page, { testInfo });
    await arrow.initUserPage(context, { testInfo });
    await arrow.drawShape(e.wbArrowShape, e.wbDrawnArrow);
  });

  test('Draw with pencil', async ({ browser, context, page }, testInfo) => {
    const pencil = new DrawShape(browser, context);
    await pencil.initModPage(page, { testInfo });
    await pencil.initUserPage(context, { testInfo });
    await pencil.drawShape(e.wbPencilShape, e.wbDraw);
  });

  test('Type text', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.typeText();
  });

  test('Sticky note', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.stickyNote();
  });

  test('Pan', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.pan();
  });

  test('Eraser', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.eraser();
  });

  test.describe.parallel('Change Shapes Styles', async () => {
    test('Change color', async ({ browser, context, page }, testInfo) => {
      const changeColor = new ChangeStyles(browser, context);
      await changeColor.initModPage(page, { testInfo });
      await changeColor.initUserPage(context, { testInfo });
      await changeColor.changingColor();
    });

    test('Fill drawing', async ({ browser, context, page }, testInfo) => {
      const fillDrawing = new ChangeStyles(browser, context);
      await fillDrawing.initModPage(page, { testInfo });
      await fillDrawing.initUserPage(context, { testInfo });
      await fillDrawing.fillDrawing();
    });

    test('Dash drawing', async ({ browser, context, page }, testInfo) => {
      const dashDrawing = new ChangeStyles(browser, context);
      await dashDrawing.initModPage(page, { testInfo });
      await dashDrawing.initUserPage(context, { testInfo });
      await dashDrawing.dashDrawing();
    });

    test('Size drawing', async ({ browser, context, page }, testInfo) => {
      const sizeDrawing = new ChangeStyles(browser, context);
      await sizeDrawing.initModPage(page, { testInfo });
      await sizeDrawing.initUserPage(context, { testInfo });
      await sizeDrawing.sizeDrawing();
    });
  });

  test('Delete drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.delete();
  });

  test('Undo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.undo();
  });

  test('Redo drawing', async ({ browser, context, page }, testInfo) => {
    const tools = new ShapeTools(browser, context);
    await tools.initModPage(page, { testInfo });
    await tools.initUserPage(context, { testInfo });
    await tools.redo();
  });

  test('Real time text typing', async ({ browser, context, page }, testInfo) => {
    const textShape = new TextShape(browser, context);
    await textShape.initModPage(page, { testInfo });
    await textShape.initUserPage(context, { testInfo });
    await textShape.realTimeTextTyping();
  });

  test.describe.parallel('Shape Options', () => {
    test('Duplicate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, { testInfo });
      await shapeOptions.initUserPage(context, { testInfo });
      await shapeOptions.duplicate();
    });

    test('Rotate', async ({ browser, context, page }, testInfo) => {
      const shapeOptions = new ShapeOptions(browser, context);
      await shapeOptions.initModPage(page, { testInfo });
      await shapeOptions.initUserPage(context, { testInfo });
      await shapeOptions.rotate();
    });
  });

  test('Camera re-sync after container resize', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResync', browser, context, page, testInfo);
  });

  test('Camera re-sync visual regression after container resize', async ({ browser, context, page }, testInfo) => {
    await runResizeTest('cameraResyncVisual', browser, context, page, testInfo);
  });

  test('Camera re-sync visual regression after resize with canvas zoom', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await runResizeTest('cameraResyncZoomedVisual', browser, context, page, testInfo);
  });

  test('Camera zoom is preserved after minimizing and restoring the presentation', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await runResizeTest('cameraResyncAfterMinimizeRestore', browser, context, page, testInfo);
  });
});
