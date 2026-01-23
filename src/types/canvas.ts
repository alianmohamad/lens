import * as fabric from "fabric";

// Canvas object data types
export interface CanvasObjectData {
    type: "generation-frame" | "skeleton" | "connector" | "image" | "text";
    id?: string;
    prompt?: string;
    label?: string;
    createdAt?: string;
    modelId?: string;
}

// Extended Fabric object with custom data
export interface FabricObjectWithData extends fabric.FabricObject {
    data?: CanvasObjectData;
}

// Generation card options
export interface GenerationCardOptions {
    left: number;
    top: number;
    prompt?: string;
    label?: string;
    scale?: number;
}

// Skeleton card options
export interface SkeletonCardOptions {
    left: number;
    top: number;
    scale?: number;
}

// Canvas state for persistence
export interface CanvasState {
    version: string;
    objects: fabric.FabricObject[];
    background?: string;
    viewportTransform?: number[];
}

// Canvas persistence data
export interface CanvasPersistenceData {
    id: string;
    userId: string;
    projectName: string;
    canvasData: string;
    createdAt: string;
    updatedAt: string;
}

// Export options
export interface ExportOptions {
    format: "png" | "jpeg";
    quality?: number;
    multiplier?: number;
    withBackground?: boolean;
}

// Viewport bounds
export interface ViewportBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

// Canvas tool types
export type CanvasTool = "select" | "hand" | "zoom";

// Canvas event types
export interface CanvasEvents {
    onObjectAdded?: (obj: FabricObjectWithData) => void;
    onObjectRemoved?: (obj: FabricObjectWithData) => void;
    onObjectModified?: (obj: FabricObjectWithData) => void;
    onSelectionCreated?: (obj: FabricObjectWithData[]) => void;
    onSelectionCleared?: () => void;
}
