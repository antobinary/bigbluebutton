import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { skipSlide } from '../presentation/util';
import { DrawShape } from './drawShape';

export class ShapeTools extends DrawShape {
  async pan() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);
    // skip slide (blank slide)
    await skipSlide(this.modPage);
    // draw line
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbLineShape);
    await this.drawShapeMiddleSlide();
    // check if the line was drawn
    await this.modPage.hasElement(e.wbDrawnLine, 'should display the drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnLine, 'should display the drawn shape for the viewer');
    const zoomResetBtn = this.modPage.page.locator(e.resetZoomButton);
    // zoom in until 200%
    for (let i = 100; i < 200; i += 25) {
      const currentZoomLabel = await zoomResetBtn.textContent();
      await this.modPage.waitAndClick(e.zoomInButton);
      await expect(zoomResetBtn, 'reset zoom button label should change after clicking to zoom in').not.toContainText(
        currentZoomLabel || '',
      );
    }
    // pan the whiteboard and assert the drawn content actually moved on screen
    const lineLocator = this.modPage.page.locator(e.wbDrawnLine);
    const boxBeforePan = await lineLocator.boundingBox();
    if (!boxBeforePan) throw new Error('line boundingBox is null before panning');
    await this.modPage.waitAndClick(e.wbHandButton);
    await this.drawShapeMiddleSlide();
    await this.modPage.page.waitForTimeout(1500); // wait for the whiteboard to be panned
    const boxAfterPan = await lineLocator.boundingBox();
    if (!boxAfterPan) throw new Error('line boundingBox is null after panning');
    const panDistance = Math.hypot(boxBeforePan.x - boxAfterPan.x, boxBeforePan.y - boxAfterPan.y);
    expect(panDistance, 'the whiteboard content should move after panning').toBeGreaterThan(50);
  }

  async eraser() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    // draw a line
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbLineShape);
    await this.drawShapeMiddleSlide();
    // erase the line
    await this.modPage.waitAndClick(e.wbEraser);
    await this.drawShapeMiddleSlide();
    // check if the line was removed
    await this.modPage.wasRemoved(e.wbDrawnLine, 'should remove the drawn line for the moderator');
    await this.userPage.wasRemoved(e.wbDrawnLine, 'should remove the drawn line for the viewer');
  }

  async delete() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    // draw an arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.drawShapeMiddleSlide();
    // check existence of the drawn arrow
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the viewer');
    // delete the drawn arrow by 'Delete' key
    await this.modPage.press('Delete');
    await this.modPage.wasRemoved(
      e.wbDrawnArrow,
      'should delete the drawn shape for the moderator by pressing the "Delete" key',
    );
    await this.userPage.wasRemoved(
      e.wbDrawnArrow,
      'should delete the drawn shape for the viewer by pressing the "Delete" key',
    );
    // draw another arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.drawShapeMiddleSlide();
    // check existence of the new drawn arrow
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the new drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the new drawn shape for the viewer');
    // delete the drawn arrow by 'Backspace' key
    await this.modPage.press('Backspace');
    await this.modPage.wasRemoved(
      e.wbDrawnArrow,
      'should delete the drawn shape for the moderator by pressing the "Backspace" key',
    );
    await this.userPage.wasRemoved(
      e.wbDrawnArrow,
      'should delete the drawn shape for the viewer by pressing the "Backspace" key',
    );
  }

  async undo() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    // draw an arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.drawShapeMiddleSlide();
    // check if the arrow was drawn
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the viewer');
    // undo the drawn arrow
    await this.modPage.page.keyboard.press('Control+Z');
    // check if the arrow was removed
    await this.modPage.wasRemoved(
      e.wbDrawnArrow,
      'should remove the drawn shape for the moderator by pressing "Ctrl+Z"',
    );
    await this.userPage.wasRemoved(e.wbDrawnArrow, 'should remove the drawn shape for the viewer by pressing "Ctrl+Z"');
  }

  async redo() {
    await this.undo();
    // redo the undone arrow
    await this.modPage.page.keyboard.press('Control+Shift+Z');
    // check if the arrow reappeared
    await this.modPage.hasElement(
      e.wbDrawnArrow,
      'should display again the drawn shape for the moderator after redoing',
    );
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display again the drawn shape for the viewer after redoing');
  }
}
