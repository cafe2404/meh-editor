export type EditorAssetType = "video" | "image" | "audio" | "text";

export interface EditorAsset {
  id: string;
  type: EditorAssetType;
  src: string;
  name?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface EditorClip {
  id: string;
  assetId: string;
  trackId: string;
  start: number;
  duration?: number;
  sourceStart?: number;
  sourceDuration?: number;
  volume?: number;
  speed?: number;
}

export interface EditorTrack {
  id: string;
  type: "video" | "audio" | "overlay" | "text";
  name?: string;
  clips: EditorClip[];
}

export interface EditorProject {
  id: string;
  version: 1;
  width: number;
  height: number;
  fps: number;
  duration: number;
  assets: EditorAsset[];
  tracks: EditorTrack[];
}

export interface CreateProjectOptions {
  id?: string;
  width?: number;
  height?: number;
  fps?: number;
}

export interface TaskAssetInput {
  id?: string;
  type: EditorAssetType;
  src: string;
  name?: string;
  duration?: number;
}

export interface TaskSceneInput {
  id?: string;
  src: string;
  duration?: number;
  name?: string;
}

export interface TaskProjectInput {
  id?: string;
  width?: number;
  height?: number;
  fps?: number;
  scenes?: TaskSceneInput[];
  assets?: TaskAssetInput[];
  voice?: TaskAssetInput;
  music?: TaskAssetInput;
}
