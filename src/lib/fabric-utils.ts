
import * as fabric from "fabric";

// Colors
const CARD_BG = "#0f172a";
const CARD_BORDER = "#334155";
const ACCENT_COLOR = "#3b82f6";
const TEXT_COLOR = "#f8fafc";

// Card size limits
const MAX_CARD_SIZE = 400;
const MIN_CARD_SIZE = 150;
const CORNER_RADIUS = 12;

/**
 * Initializes the infinite canvas behavior (Zoom/Pan)
 */
export function initInfiniteCanvas(canvas: fabric.Canvas) {
    // Zoom with mouse wheel
    canvas.on("mouse:wheel", (opt: any) => {
        const e = opt.e;
        const delta = e.deltaY;
        let zoom = canvas.getZoom();

        // Smoother zoom factor
        zoom *= 0.999 ** delta;

        // Clamp zoom
        zoom = Math.min(Math.max(zoom, 0.1), 10);

        canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
        e.preventDefault();
        e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    // Pan with Alt+drag, Space+drag, middle mouse, or hand tool
    canvas.on("mouse:down", (opt: any) => {
        const e = opt.e;
        const isHandMode = (canvas as any).isHandMode === true;
        const isMiddleClick = e.button === 1;
        const isLeftClick = e.button === 0;
        const isPanKey = e.altKey === true;

        // Only allow pan if:
        // 1. Hand mode is active (any click pans)
        // 2. Middle mouse button (always pans)
        // 3. Alt key + left click (pan shortcut)
        const shouldPan = isHandMode || isMiddleClick || (isLeftClick && isPanKey);

        if (shouldPan) {
            isDragging = true;
            canvas.selection = false;
            (canvas as any)._isDragging = true;
            canvas.setCursor('grabbing');
            lastPosX = e.clientX;
            lastPosY = e.clientY;
            e.preventDefault();
        }
    });

    canvas.on("mouse:move", (opt: any) => {
        if (isDragging) {
            const e = opt.e;
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            const dx = e.clientX - lastPosX;
            const dy = e.clientY - lastPosY;

            // Calculate new position
            let newX = vpt[4] + dx;
            let newY = vpt[5] + dy;

            // Pan limits - prevent going too far (2000px in each direction from center)
            const PAN_LIMIT = 2000;
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const zoom = canvas.getZoom();

            // Clamp pan values
            const minX = -PAN_LIMIT * zoom;
            const maxX = canvasWidth + PAN_LIMIT * zoom;
            const minY = -PAN_LIMIT * zoom;
            const maxY = canvasHeight + PAN_LIMIT * zoom;

            newX = Math.min(Math.max(newX, minX), maxX);
            newY = Math.min(Math.max(newY, minY), maxY);

            vpt[4] = newX;
            vpt[5] = newY;

            canvas.requestRenderAll();
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
    });

    canvas.on("mouse:up", () => {
        if (isDragging) {
            isDragging = false;
            (canvas as any)._isDragging = false;
            canvas.selection = !(canvas as any).isHandMode;
            canvas.setCursor((canvas as any).isHandMode ? 'grab' : 'default');
            canvas.setViewportTransform(canvas.viewportTransform!);
        }
    });

    // Selection style
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: "#ffffff",
        cornerStrokeColor: ACCENT_COLOR,
        borderColor: ACCENT_COLOR,
        cornerSize: 10,
        padding: 4,
        cornerStyle: "circle",
        borderScaleFactor: 2,
        lockUniScaling: true,
    });
}

/**
 * Creates a Studio Card - Image with rounded corners and label
 */
export const createGenerationCard = (imageUrl: string, options: {
    left: number;
    top: number;
    prompt?: string;
    id?: string;
    label?: string;
}) => {
    return new Promise<fabric.Group>((resolve) => {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";

        imgEl.onload = () => {
            const img = new fabric.Image(imgEl);
            const cardId = options.id || `card_${Date.now()}`;

            const origWidth = img.width || 400;
            const origHeight = img.height || 300;

            // Calculate scale to fit within max size while preserving aspect ratio
            const maxDim = Math.max(origWidth, origHeight);
            let scale = 1;

            if (maxDim > MAX_CARD_SIZE) {
                scale = MAX_CARD_SIZE / maxDim;
            }
            if (maxDim * scale < MIN_CARD_SIZE) {
                scale = MIN_CARD_SIZE / maxDim;
            }

            // Final displayed dimensions
            const displayW = origWidth * scale;
            const displayH = origHeight * scale;

            // ClipPath for rounded corners on the image
            const clipRect = new fabric.Rect({
                width: origWidth,
                height: origHeight,
                rx: CORNER_RADIUS / scale,
                ry: CORNER_RADIUS / scale,
                originX: 'center',
                originY: 'center',
            });

            // Scale the image with clipPath for rounded corners
            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                left: 0,
                top: 0,
                clipPath: clipRect,
            });

            // Border frame - exact same size as scaled image
            const frame = new fabric.Rect({
                width: displayW,
                height: displayH,
                fill: "transparent",
                stroke: "#475569", // More visible border (slate-600)
                strokeWidth: 2,
                rx: CORNER_RADIUS,
                ry: CORNER_RADIUS,
                originX: 'center',
                originY: 'center',
                left: 0,
                top: 0,
            });

            // Label - Dark floating badge with icon (matching reference style)
            const LABEL_H = 22;
            const labelText = options.label || `Creation #${cardId.slice(-4)}`;
            const labelFullText = `📷  ${labelText}`;
            const labelW = Math.max(labelFullText.length * 6.5 + 20, 100);

            const labelBg = new fabric.Rect({
                width: labelW,
                height: LABEL_H,
                fill: "rgba(15, 23, 42, 0.85)", // Dark semi-transparent
                rx: 6,
                ry: 6,
                originX: 'left',
                originY: 'bottom',
                left: -displayW / 2,
                top: -displayH / 2 - 8,
            });

            const label = new fabric.Text(labelFullText, {
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
                fontWeight: "500",
                fill: "#f8fafc", // White text
                originX: 'left',
                originY: 'center',
                left: -displayW / 2 + 8,
                top: -displayH / 2 - 8 - LABEL_H / 2,
            });

            // Create group with card elements (no connector button - was causing layout issues)
            const group = new fabric.Group([frame, img, labelBg, label], {
                left: options.left,
                top: options.top,
                hasControls: true,
                lockUniScaling: true,
                lockScalingFlip: true,
                subTargetCheck: true,
                data: {
                    type: "generation-frame",
                    id: cardId,
                    originalUrl: imageUrl,
                    prompt: options.prompt,
                    width: origWidth,
                    height: origHeight
                }
            } as any);

            // Corner-only resize (remove side handles)
            if (fabric.controlsUtils?.createObjectDefaultControls) {
                group.controls = { ...fabric.controlsUtils.createObjectDefaultControls() };
                delete (group.controls as any).mt;
                delete (group.controls as any).mb;
                delete (group.controls as any).ml;
                delete (group.controls as any).mr;
            }

            resolve(group);
        };

        imgEl.onerror = () => {
            const errorBox = new fabric.Rect({
                width: 200, height: 150, fill: CARD_BG, rx: 12, ry: 12,
                originX: 'center', originY: 'center', stroke: "#ef4444", strokeWidth: 2
            });
            const errorText = new fabric.Text("Image Error", {
                fontSize: 14, fill: "#ef4444", originX: 'center', originY: 'center'
            });
            resolve(new fabric.Group([errorBox, errorText], {
                left: options.left, top: options.top,
                data: { type: "generation-frame", id: options.id || Date.now().toString() }
            } as any));
        };

        imgEl.src = imageUrl;
    });
};

export function drawDotGrid(canvas: fabric.Canvas) {
    canvas.requestRenderAll();
}

// Connector functions
export const createConnector = (source: fabric.Object, target: fabric.Object) => {
    const id = `conn_${Date.now()}`;
    const path = new fabric.Path("M 0 0 C 0 0 0 0 0 0", {
        fill: "",
        stroke: "#3b82f6",
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        strokeLineCap: 'round',
        objectCaching: false,
        selectable: false,
        evented: false,
        data: {
            type: "connector",
            id,
            sourceId: (source as any).data?.id,
            targetId: (target as any).data?.id
        }
    });
    updateConnector(path, source, target);
    return path;
};

export const createSkeletonCard = (options: {
    left: number;
    top: number;
    scale?: number;
}): fabric.Group => {
    const defaultSize = 512 * (options.scale || 1);

    const frame = new fabric.Rect({
        width: defaultSize,
        height: defaultSize,
        fill: "#1e293b", // Slate-800
        stroke: "#334155",
        strokeWidth: 2,
        rx: 16,
        ry: 16,
        originX: 'center',
        originY: 'center',
    });

    // Loading Text
    const text = new fabric.Text("Generating...", {
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        fill: "#94a3b8",
        originX: 'center',
        originY: 'center',
    });

    const group = new fabric.Group([frame, text], {
        left: options.left,
        top: options.top,
        selectable: false, // Not interactable
        evented: false,
        data: { type: "skeleton" }
    } as any);

    // Manual pulse loop helper
    const pulse = () => {
        frame.animate({ opacity: 0.5 }, {
            duration: 800,
            onChange: (group.canvas as any)?.requestRenderAll.bind(group.canvas),
            onComplete: () => {
                frame.animate({ opacity: 1 }, {
                    duration: 800,
                    onChange: (group.canvas as any)?.requestRenderAll.bind(group.canvas),
                    onComplete: pulse
                });
            }
        });
    };
    (group as any).pulse = pulse;
    pulse();

    return group;
};

export const updateConnector = (connector: fabric.Path, source: fabric.Object, target: fabric.Object) => {
    const sCenter = source.getCenterPoint();
    const tCenter = target.getCenterPoint();
    const sW = source.getScaledWidth();
    const tW = target.getScaledWidth();

    const p0 = { x: sCenter.x + sW / 2, y: sCenter.y };
    const p3 = { x: tCenter.x - tW / 2, y: tCenter.y };
    const cpOffset = Math.max(Math.abs(p3.x - p0.x) * 0.5, 50);

    const newPath: any[] = [
        ['M', p0.x, p0.y],
        ['C', p0.x + cpOffset, p0.y, p3.x - cpOffset, p3.y, p3.x, p3.y]
    ];

    // @ts-ignore
    connector.path = newPath;
    const pathObj = new fabric.Path(newPath);
    const dims = pathObj.getBoundingRect();

    connector.set({
        path: newPath,
        width: dims.width,
        height: dims.height,
        left: dims.left + dims.width / 2,
        top: dims.top + dims.height / 2,
        pathOffset: { x: dims.left + dims.width / 2, y: dims.top + dims.height / 2 },
        dirty: true
    });
    connector.setCoords();
};

// Failed generation card type
interface GenerationParams {
    productImageUrl: string;
    prompt: string;
    stylePreset: string;
    aspectRatio: string;
    modelId: string;
}

/**
 * Creates a Failed Generation Card - Shows error with retry option
 */
export const createFailedCard = (options: {
    left: number;
    top: number;
    error: string;
    generationParams?: GenerationParams;
    id?: string;
}): fabric.Group => {
    const cardId = options.id || `failed_${Date.now()}`;
    const cardSize = 256;

    // Red-tinted background frame
    const frame = new fabric.Rect({
        width: cardSize,
        height: cardSize,
        fill: "#1e1520", // Dark red-tinted background
        stroke: "#dc2626", // Red border
        strokeWidth: 2,
        rx: 16,
        ry: 16,
        originX: 'center',
        originY: 'center',
    });

    // Error icon (X mark)
    const iconSize = 48;
    const iconCircle = new fabric.Circle({
        radius: iconSize / 2,
        fill: "transparent",
        stroke: "#ef4444",
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
        top: -40,
    });

    const iconX1 = new fabric.Line([-12, -12, 12, 12], {
        stroke: "#ef4444",
        strokeWidth: 3,
        strokeLineCap: 'round',
        originX: 'center',
        originY: 'center',
        top: -40,
    });

    const iconX2 = new fabric.Line([12, -12, -12, 12], {
        stroke: "#ef4444",
        strokeWidth: 3,
        strokeLineCap: 'round',
        originX: 'center',
        originY: 'center',
        top: -40,
    });

    // "Generation Failed" text
    const titleText = new fabric.Text("Generation Failed", {
        fontSize: 16,
        fontFamily: "Inter, sans-serif",
        fontWeight: "600",
        fill: "#fecaca", // Light red
        originX: 'center',
        originY: 'center',
        top: 20,
    });

    // Error message (truncated)
    const errorMsg = options.error.length > 40
        ? options.error.slice(0, 37) + "..."
        : options.error;

    const errorText = new fabric.Text(errorMsg, {
        fontSize: 12,
        fontFamily: "Inter, sans-serif",
        fill: "#f87171", // Red-400
        originX: 'center',
        originY: 'center',
        top: 45,
    });

    // "Click to Retry" text
    const retryText = new fabric.Text("Click to retry", {
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        fontWeight: "500",
        fill: "#94a3b8", // Slate-400
        originX: 'center',
        originY: 'center',
        top: 80,
    });

    // Create group
    const group = new fabric.Group([frame, iconCircle, iconX1, iconX2, titleText, errorText, retryText], {
        left: options.left,
        top: options.top,
        hasControls: true,
        lockUniScaling: true,
        lockScalingFlip: true,
        subTargetCheck: true,
        data: {
            type: "failed-generation",
            id: cardId,
            error: options.error,
            generationParams: options.generationParams,
        }
    } as any);

    // Corner-only resize
    if (fabric.controlsUtils?.createObjectDefaultControls) {
        group.controls = { ...fabric.controlsUtils.createObjectDefaultControls() };
        delete (group.controls as any).mt;
        delete (group.controls as any).mb;
        delete (group.controls as any).ml;
        delete (group.controls as any).mr;
    }

    return group;
};
