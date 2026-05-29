import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { DrawShape } from './drawShape';

// The drawn shape's svg path carries the visual styles (stroke, fill, dash, stroke width).
const drawnShapePath = (page: Page) => page.page.locator(`${e.wbDrawnShape} svg path`).first();

export class ChangeStyles extends DrawShape {
  async changingColor() {
    await this.drawShape(e.wbEllipseShape);
    await this.modPage.page.keyboard.press('v');
    // change the color of the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbColorRed);
    await this.modPage.press('Escape');
    // check for the new shape color on the moderator and (once synced) on the viewer.
    // toHaveCSS auto-retries, so it waits for the style change to propagate to the viewer.
    await expect(drawnShapePath(this.modPage), 'should the color of the shape be red for the moderator').toHaveCSS(
      'stroke',
      'rgb(224, 49, 49)',
    );
    await expect(drawnShapePath(this.userPage), 'should the color of the shape be red for the viewer').toHaveCSS(
      'stroke',
      'rgb(224, 49, 49)',
    );
  }

  async fillDrawing() {
    await this.drawShape(e.wbEllipseShape);
    await this.modPage.page.keyboard.press('v');
    // fill the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbFillDrawing);
    await this.modPage.press('Escape');
    // check for the filled shape on the moderator and (once synced) on the viewer
    await expect(
      drawnShapePath(this.modPage),
      'should the inner color of the shape be gray for the moderator',
    ).toHaveCSS('fill', 'rgb(232, 232, 232)');
    await expect(drawnShapePath(this.userPage), 'should the inner color of the shape be gray for the viewer').toHaveCSS(
      'fill',
      'rgb(232, 232, 232)',
    );
  }

  async dashDrawing() {
    await this.drawShape(e.wbEllipseShape);
    await this.modPage.page.keyboard.press('v');
    // dash the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbDashDotted);
    await this.modPage.press('Escape');
    // check for the dashed shape on the moderator and (once synced) on the viewer
    await expect(drawnShapePath(this.modPage), 'should the shape be dashed for the moderator').not.toHaveCSS(
      'stroke-dasharray',
      'none',
    );
    await expect(drawnShapePath(this.userPage), 'should the shape be dashed for the viewer').not.toHaveCSS(
      'stroke-dasharray',
      'none',
    );
  }

  async sizeDrawing() {
    await this.drawShape(e.wbEllipseShape);
    await this.modPage.page.keyboard.press('v');
    // change the size of the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbSizeLarge);
    await this.modPage.press('Escape');
    // check for the larger stroke on the moderator and (once synced) on the viewer
    await expect(drawnShapePath(this.modPage), 'should the shape have a larger stroke for the moderator').toHaveCSS(
      'stroke-width',
      '5px',
    );
    await expect(drawnShapePath(this.userPage), 'should the shape have a larger stroke for the viewer').toHaveCSS(
      'stroke-width',
      '5px',
    );
  }
}
