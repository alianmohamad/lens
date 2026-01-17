
import * as fabric from "fabric";

// Colors (Slate Palette - Brand Aligned)
const BG_COLOR = "#020617"; // slate-950 (Deep Blue/Black)
const CARD_BG = "#0f172a"; // slate-900 (Brand Card Color)
const CARD_BORDER = "#1e293b"; // slate-800
const ACCENT_COLOR = "#a855f7"; // purple-500 (Brand Accent)
const TEXT_COLOR = "#f8fafc"; // slate-50
const SUBTEXT_COLOR = "#94a3b8"; // slate-400

/**
 * Initializes the infinite canvas behavior (Zoom/Pan)
 */
export function initInfiniteCanvas(canvas: fabric.Canvas) {
    // Zoom with scroll
    canvas.on("mouse:wheel", (opt: any) => {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;

        // Limit zoom
        if (zoom > 5) zoom = 5;
        if (zoom < 0.2) zoom = 0.2;

        canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    // Pan with Alt + Drag or Space + Drag
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on("mouse:down", (opt: any) => {
        const evt = opt.e;
        // Check for 'hand' mode (custom property we'll set on canvas)
        const isHandMode = (canvas as any).isHandMode;

        if (evt.altKey || evt.code === "Space" || isHandMode) {
            isDragging = true;
            canvas.selection = false;
            canvas.setCursor(isHandMode ? 'grabbing' : 'default');

            const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX) || 0;
            const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY) || 0;
            lastPosX = clientX;
            lastPosY = clientY;
        }
    });

    canvas.on("mouse:move", (opt: any) => {
        if (isDragging) {
            const e = opt.e;
            const vpt = canvas.viewportTransform;
            if (!vpt) return;

            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            vpt[4] += clientX - lastPosX;
            vpt[5] += clientY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = clientX;
            lastPosY = clientY;
        }
    });

    canvas.on("mouse:up", () => {
        const vpt = canvas.viewportTransform;
        if (vpt) canvas.setViewportTransform(vpt);
        isDragging = false;
        canvas.selection = true;
    });

    // Custom selection style - Premium Look
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: "#ffffff",
        cornerStrokeColor: ACCENT_COLOR,
        borderColor: ACCENT_COLOR,
        cornerSize: 10,
        padding: 8,
        cornerStyle: "circle",
        borderDashArray: [0, 0], // Solid line
        borderScaleFactor: 2,
    });
}

/**
 * Creates a "Studio Card" node
 */
export const createGenerationCard = (imageUrl: string, options: {
    left: number;
    top: number;
    prompt: string;
    id?: string;
}) => {
    return new Promise<fabric.Group>((resolve) => {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";

        imgEl.onload = () => {
            const img = new fabric.Image(imgEl);

            // Config
            const CARD_W = 320;
            const CARD_H = 440;
            const PADDING = 16;
            const IMAGE_AREA_H = 300;

            const maxWidth = CARD_W - (PADDING * 2);
            const maxHeight = IMAGE_AREA_H - (PADDING * 2);

            const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1));

            img.scale(scale);

            const imgCenterY = (-CARD_H / 2) + (IMAGE_AREA_H / 2);

            img.set({
                originX: 'center',
                originY: 'center',
                left: 0,
                top: imgCenterY,
            });

            // Card Background (Frame)
            const frame = new fabric.Rect({
                width: CARD_W,
                height: CARD_H,
                fill: CARD_BG,
                stroke: CARD_BORDER,
                strokeWidth: 1,
                rx: 24,
                ry: 24,
                shadow: new fabric.Shadow({
                    color: 'rgba(2, 6, 23, 0.5)', // slate-950 shadow
                    blur: 40,
                    offsetX: 0,
                    offsetY: 20
                }),
                originX: 'center',
                originY: 'center',
            });

            // Divider Line
            const divider = new fabric.Line([-CARD_W / 2 + PADDING, 0, CARD_W / 2 - PADDING, 0], {
                stroke: CARD_BORDER,
                strokeWidth: 1,
                originX: 'center',
                originY: 'center',
                top: imgCenterY + IMAGE_AREA_H / 2 + 10 // Below image area
            });

            // Text
            const promptText = new fabric.Textbox(options.prompt || "Start your creation...", {
                fontSize: 14,
                fontFamily: "Inter, sans-serif",
                fill: SUBTEXT_COLOR,
                width: CARD_W - (PADDING * 2),
                splitByGrapheme: false,
                originX: 'center',
                originY: 'top',
                top: imgCenterY + IMAGE_AREA_H / 2 + 20, // Bottom section
                textAlign: 'left',
                maxLines: 3
            });

            const group = new fabric.Group([frame, img, promptText], {
                left: options.left,
                top: options.top,
                hasControls: true,
                subTargetCheck: true,
                data: {
                    type: "generation-frame",
                    id: options.id || Date.now().toString(),
                    originalUrl: imageUrl,
                    prompt: options.prompt
                }
            } as any);

            resolve(group);
        };

        imgEl.onerror = () => {
            // Fallback
            const errorBox = new fabric.Rect({
                width: 320, height: 440, fill: CARD_BG, rx: 24, ry: 24,
                originX: 'center', originY: 'center', stroke: ACCENT_COLOR
            });
            const errorText = new fabric.Text("Image Error", {
                fontSize: 20, fill: ACCENT_COLOR, originX: 'center', originY: 'center'
            });
            const group = new fabric.Group([errorBox, errorText], {
                left: options.left, top: options.top
            } as any);
            resolve(group);
        };

        imgEl.src = imageUrl;
    });
};

export function drawDotGrid(canvas: fabric.Canvas) {
    // Legacy function - kept for compatibility, but canvas is now transparent
    // canvas.backgroundColor = BG_COLOR; 
    canvas.requestRenderAll();
}

// --- Connector Lines ---

export const createConnector = (source: fabric.Object, target: fabric.Object) => {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initial Path (Correct Bezier structure)
    // We use a dummy path, it will be updated immediately.
    const path = new fabric.Path("M 0 0 C 0 0 0 0 0 0", {
        fill: "",
        stroke: "#94a3b8", // Slate 400
        strokeWidth: 2,
        strokeDashArray: [5, 5], // Dashed initially? Or solid? Solid looks cleaner.
        strokeLineCap: 'round',
        objectCaching: false,
        selectable: false,
        evented: false,
        data: {
            type: "connector",
            id,
            sourceId: source.data?.id,
            targetId: target.data?.id
        }
    });

    updateConnector(path, source, target);
    return path;
};

export const updateConnector = (connector: fabric.Path, source: fabric.Object, target: fabric.Object) => {
    // Robust absolute coordinates using getCenterPoint()
    // This works even if objects are inside a Group/ActiveSelection
    const sCenter = source.getCenterPoint();
    const tCenter = target.getCenterPoint();

    // Fabric.js v6+ safe width retrieval (getBoundingRect might be group-relative)
    // We actually know the card size (320x440) but let's be dynamic if possible.
    // getBoundingRect(true) forces absolute coords in recent versions? 
    // Let's stick to Center + Width/2 logic which is safer if rotation is 0.

    // Assume 0 rotation for now as cards are fixed upright.
    const sWidth = source.getScaledWidth();
    const tWidth = target.getScaledWidth();

    // Calculate Edge Points
    // Source Right
    const p0 = { x: sCenter.x + sWidth / 2, y: sCenter.y };
    // Target Left
    const p3 = { x: tCenter.x - tWidth / 2, y: tCenter.y };

    // Control Points (Curvature)
    const dist = Math.abs(p3.x - p0.x);
    // Ensure curve doesn't loop back weirdly if close
    const cpOffset = Math.max(dist * 0.5, 40);

    const p1 = { x: p0.x + cpOffset, y: p0.y };
    const p2 = { x: p3.x - cpOffset, y: p3.y };

    const newPathArray: any[] = [
        ['M', p0.x, p0.y],
        ['C', p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]
    ];

    // Update Path
    // @ts-ignore
    connector.path = newPathArray;

    // Recalculate dimensions for the new path
    // Fabric internal cache clean
    // @ts-ignore
    const pathObj = new fabric.Path(newPathArray);
    const dims = pathObj.getBoundingRect();

    connector.set({
        path: newPathArray,
        width: dims.width,
        height: dims.height,
        left: dims.left + dims.width / 2,
        top: dims.top + dims.height / 2,
        pathOffset: { x: dims.left + dims.width / 2, y: dims.top + dims.height / 2 },
        dirty: true
    });
    connector.setCoords();
};

