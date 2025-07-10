import { ReactiveController } from '../../class/ReactiveController.js';
export const Corner = {
  END_START: 'end-start',
  END_END: 'end-end',
  START_START: 'start-start',
  START_END: 'start-end',
};

export class SurfacePositionController extends ReactiveController {
  constructor (
    host, // host extends ReactiveControllerHost
    getProperties
  ) {
    super();
    this.host = host;
    this.getProperties = getProperties;
    
    this.host.add(this);

    this.surfaceStylesInternal = { "display": "none" };
    this.lastValues = { isOpen: false };
  }
  get surfaceStyles () {
    return this.surfaceStylesInternal;
  }
  // Calculates the surface's new position 
  async position () {
    const {
      surfaceEl,
      anchorEl,
      anchorCorner: anchorCornerRaw,
      surfaceCorner: surfaceCornerRaw,
      positioning,
      xOffset,
      yOffset,
      disableBlockFlip,
      disableInlineFlip,
      repositionStrategy,
    } = this.getProperties();
    const anchorCorner = anchorCornerRaw.toLowerCase().trim();
    const surfaceCorner = surfaceCornerRaw.toLowerCase().trim();

    if (!surfaceEl || !anchorEl) { return; }
    // Store these before we potentially resize the window with the next set of
    // lines
    const windowInnerWidth = window.innerWidth;
    const windowInnerHeight = window.innerHeight;

    const div = document.createElement("div");
    div.style.opacity = "0";
    div.style.position = "fixed";
    div.style.display = "block";
    div.style.inset = "0";
    document.body.appendChild(div);
    const scrollbarTestRect = div.getBoundingClientRect();
    div.remove();

    // Calculate the widths of the scrollbars in the inline and block directions
    // to account for window-relative calculations.
    const blockScrollbarHeight = window.innerHeight - scrollbarTestRect.bottom;
    const inlineScrollbarWidth = window.innerWidth - scrollbarTestRect.right;

    // Paint the surface transparently so that we can get the position and the
    // rect info of the surface.
    this.surfaceStylesInternal = {
      "display": "block",
      "opacity": "0"
    };
    // Wait for it to be visible.
    this.host.requestUpdate(this.surfaceStylesInternal);
    await this.host.updateComplete;
    // Safari bug
    if (
      surfaceEl.popover &&
      surfaceEl.isConnected
    ) {
      surfaceEl.showPopover();
    }
    // Polyfilling
    const surfaceRect = surfaceEl.getSurfacePositionClientRect
      ? surfaceEl.getSurfacePositionClientRect()
      : surfaceEl.getBoundingClientRect();
    const anchorRect = anchorEl.getSurfacePositionClientRect
      ? anchorEl.getSurfacePositionClientRect()
      : anchorEl.getBoundingClientRect();
    const [surfaceBlock, surfaceInline] = surfaceCorner.split("-");
    const [anchorBlock, anchorInline] = anchorCorner.split("-");

    const isLTR =
      getComputedStyle(surfaceEl).direction === "ltr";

    // Calculate the block positioning properties
    let {blockInset, blockOutOfBoundsCorrection, surfaceBlockProperty} = 
      this.calculateBlock({
        surfaceRect,
        anchorRect,
        anchorBlock,
        surfaceBlock,
        yOffset,
        positioning,
        windowInnerHeight,
        blockScrollbarHeight,
      });
    // If the surface should be out of bounds in the block direction, flip the
    // surface and anchor corner block values and recalculate
    if (blockOutOfBoundsCorrection && !disableBlockFlip) {
      const flippedSurfaceBlock = surfaceBlock === "start" ? "end" : "start";
      const flippedAnchorBlock = anchorBlock === "start" ? "end" : "start";

      const flippedBlock = this.calculateBlock({
        surfaceRect,
        anchorRect,
        anchorBlock: flippedAnchorBlock,
        surfaceBlock: flippedSurfaceBlock,
        yOffset,
        positioning,
        windowInnerHeight,
        blockScrollbarHeight,
      });

      // In the case that the flipped verion would require less out of bounds
      // correcting, use the flipped corner block values
      if (blockOutOfBoundsCorrection > flippedBlock.blockOutOfBoundsCorrection) {
        blockInset = flippedBlock.blockInset;
        blockOutOfBoundsCorrection = flippedBlock.blockOutOfBoundsCorrection;
        surfaceBlockProperty = flippedBlock.surfaceBlockProperty;
      }
    }

    // Calculate the inline positioning properties
    let {inlineInset, inlineOutOfBoundsCorrection, surfaceInlineProperty} =
      this.calculateInline({
        surfaceRect,
        anchorRect,
        anchorInline,
        surfaceInline,
        xOffset,
        positioning,
        isLTR,
        windowInnerWidth,
        inlineScrollbarWidth,
      });

        // If the surface should be out of bounds in the inline direction, flip the
    // surface and anchor corner inline values and recalculate
    if (inlineOutOfBoundsCorrection && !disableInlineFlip) {
      const flippedSurfaceInline = surfaceInline === 'start' ? 'end' : 'start';
      const flippedAnchorInline = anchorInline === 'start' ? 'end' : 'start';

      const flippedInline = this.calculateInline({
        surfaceRect,
        anchorRect,
        anchorInline: flippedAnchorInline,
        surfaceInline: flippedSurfaceInline,
        xOffset,
        positioning,
        isLTR,
        windowInnerWidth,
        inlineScrollbarWidth,
      });

      // In the case that the flipped verion would require less out of bounds
      // correcting, use the flipped corner inline values
      if (
        Math.abs(inlineOutOfBoundsCorrection) >
        Math.abs(flippedInline.inlineOutOfBoundsCorrection)
      ) {
        inlineInset = flippedInline.inlineInset;
        inlineOutOfBoundsCorrection = flippedInline.inlineOutOfBoundsCorrection;
        surfaceInlineProperty = flippedInline.surfaceInlineProperty;
      }
    }

    // If we are simply repositioning the surface back inside the viewport,
    // subtract the out of bounds correction values from the positioning.
    if (repositionStrategy === "move") {
      blockInset = blockInset - blockOutOfBoundsCorrection;
      inlineInset = inlineInset - inlineOutOfBoundsCorrection;
    }
    
    this.surfaceStylesInternal = {
      "display": "block",
      "opacity": "1",
      [surfaceBlockProperty]: `${blockInset}px`,
      [surfaceInlineProperty]: `${inlineInset}px`,
    };

    // In the case that we are resizing the surface to stay inside the viewport
    // we need to set height and width on the surface.
    if (repositionStrategy === "resize") {
      // Add a height property to the styles if there is block height correction
      if (blockOutOfBoundsCorrection) {
        this.surfaceStylesInternal["height"] = `${
          surfaceRect.height - blockOutOfBoundsCorrection
        }px`;
      }

      // Add a width property to the styles if there is block height correction
      if (inlineOutOfBoundsCorrection) {
        this.surfaceStylesInternal["width"] = `${
          surfaceRect.width - inlineOutOfBoundsCorrection
        }px`;
      }
    }

    this.host.requestUpdate(this.surfaceStylesInternal);
  }
  calculateBlock ({
    surfaceRect,
    anchorRect,
    anchorBlock,
    surfaceBlock,
    yOffset,
    positioning,
    windowInnerHeight,
    blockScrollbarHeight,
  }) {
    const relativeToWindow =
      positioning === "fixed" || positioning === "document" ? 1 : 0;
    const relativeToDocument = positioning === "document" ? 1 : 0;
    const isSurfaceBlockStart = surfaceBlock === "start" ? 1 : 0;
    const isSurfaceBlockEnd = surfaceBlock === "end" ? 1 : 0;
    const isOneBlockEnd = anchorBlock !== surfaceBlock ? 1 : 0;

    // Whether or not to apply the height of the anchor
    const blockAnchorOffset = isOneBlockEnd * anchorRect.height + yOffset;
    // The absolute block position of the anchor relative to window
    const blockTopLayerOffset =
      isSurfaceBlockStart * anchorRect.top +
      isSurfaceBlockEnd *
        (windowInnerHeight - anchorRect.bottom - blockScrollbarHeight);
    const blockDocumentOffset =
      isSurfaceBlockStart * window.scrollY - isSurfaceBlockEnd * window.scrollY;

    // If the surface's block would be out of bounds of the window, move it back
    // in
    const blockOutOfBoundsCorrection = Math.abs(
      Math.min(
        0,
        windowInnerHeight -
          blockTopLayerOffset -
          blockAnchorOffset -
          surfaceRect.height,
      ),
    );
    // The block logical value of the surface
    const blockInset =
      relativeToWindow * blockTopLayerOffset +
      relativeToDocument * blockDocumentOffset +
      blockAnchorOffset;

    const surfaceBlockProperty =
      surfaceBlock === "start" ? "inset-block-start" : "inset-block-end";

    return {blockInset, blockOutOfBoundsCorrection, surfaceBlockProperty};
  }
  calculateInline({
    isLTR: isLTRBool,
    surfaceInline,
    anchorInline,
    anchorRect,
    surfaceRect,
    xOffset,
    positioning,
    windowInnerWidth,
    inlineScrollbarWidth
  }) {
    const relativeToWindow =
      positioning === "fixed" || positioning === "document" ? 1 : 0;
    const relativeToDocument = positioning === "document" ? 1 : 0;
    const isLTR = isLTRBool ? 1 : 0;
    const isRTL = isLTRBool ? 0 : 1;
    const isSurfaceInlineStart = surfaceInline === "start" ? 1 : 0;
    const isSurfaceInlineEnd = surfaceInline === "end" ? 1 : 0;
    const isOneInlineEnd = anchorInline !== surfaceInline ? 1 : 0;

    // Whether or not to apply the width of the anchor
    const inlineAnchorOffset = isOneInlineEnd * anchorRect.width + xOffset;
    // The inline position of the anchor relative to window in LTR
    const inlineTopLayerOffsetLTR = 
      isSurfaceInlineStart * anchorRect.left +
      isSurfaceInlineEnd *
        (windowInnerWidth - anchorRect.right - inlineScrollbarWidth);
    // The inline position of the anchor relative to window in RTL
    const inlineTopLayerOffsetRTL =
      isSurfaceInlineStart *
        (windowInnerWidth - anchorRect.right - inlineScrollbarWidth) +
      isSurfaceInlineEnd * anchorRect.left;
    // The inline position of the anchor relative to window
    const inlineTopLayerOffset =
      isLTR * inlineTopLayerOffsetLTR + isRTL * inlineTopLayerOffsetRTL;

    // The inline position of the anchor relative to window in LTR
    const inlineDocumentOffsetLTR =
      isSurfaceInlineStart * window.scrollX -
      isSurfaceInlineEnd * window.scrollX;
    // The inline position of the anchor relative to window in RTL
    const inlineDocumentOffsetRTL =
      isSurfaceInlineEnd * window.scrollX -
      isSurfaceInlineStart * window.scrollX;

    // The inline position of the anchor relative to window
    const inlineDocumentOffset =
      isLTR * inlineDocumentOffsetLTR + isRTL * inlineDocumentOffsetRTL;

    // If the surface's inline would be out of bounds of the window, move it
    // back in
    const inlineOutOfBoundsCorrection = Math.abs(
      Math.min(
        0,
        windowInnerWidth -
          inlineTopLayerOffset -
          inlineAnchorOffset -
          surfaceRect.width,
      ),
    );

    // The inline logical value of the surface
    const inlineInset =
      relativeToWindow * inlineTopLayerOffset +
      inlineAnchorOffset +
      relativeToDocument * inlineDocumentOffset;

    let surfaceInlineProperty =
      surfaceInline === "start" ? "inset-inline-start" : "inset-inline-end";

    // There are cases where the element is RTL but the root of the page is not.
    // In these cases we want to not use logical properties.
    if (positioning === "document" || positioning === "fixed") {
      if (
        (surfaceInline === "start" && isLTR) ||
        (surfaceInline === "end" && !isLTR)
      ) {
        surfaceInlineProperty = "left";
      } else {
        surfaceInlineProperty = "right";
      }
    }

    return {
      inlineInset,
      inlineOutOfBoundsCorrection,
      surfaceInlineProperty,
    };
  }
  hostUpdate() {
    this.onUpdate();
  }
  hostUpdated() {
    this.onUpdate();
  }
  async onUpdate() {
    const props = this.getProperties();
    let hasChanged = false;
    for (const [key, value] of Object.entries(props)) {
      hasChanged = hasChanged || value !== this.lastValues[key];
      if (hasChanged) break;
    }

    const openChanged = this.lastValues.isOpen !== props.isOpen;
    const hasAnchor = !!props.anchorEl;
    const hasSurface = !!props.surfaceEl;

    if (hasChanged && hasAnchor && hasSurface) {
      // Only update isOpen, because if it's closed, we do not want to waste
      // time on a useless reposition calculation. So save the other "dirty"
      // values until next time it opens.
      this.lastValues.isOpen = props.isOpen;

      if (props.isOpen) {
        // We are going to do a reposition, so save the prop values for future
        // dirty checking.
        this.lastValues = props;

        await this.position();
        props.onOpen();
      } else if (openChanged) {
        await props.beforeClose();
        this.close();
        props.onClose();
      }
    }
  }
  close() {
    this.surfaceStylesInternal = {
      "display": "none",
    };
    this.host.requestUpdate(this.surfaceStylesInternal);
    const surfaceEl = this.getProperties().surfaceEl;

    // The following type casts are required due to differing TS types in Google
    // and open source.
    if (
      surfaceEl?.popover &&
      surfaceEl?.isConnected
    ) {
      surfaceEl.hidePopover();
    }
  }
}
