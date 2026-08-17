import type {
  CreateProjectOptions,
  EditorAsset,
  EditorClip,
  EditorProject,
  EditorTrack,
  TaskAssetInput,
  TaskProjectInput,
} from "./types";

const id = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function createProject(options: CreateProjectOptions = {}): EditorProject {
  return {
    id: options.id ?? id("project"),
    version: 1,
    width: options.width ?? 1080,
    height: options.height ?? 1920,
    fps: options.fps ?? 30,
    duration: 0,
    assets: [],
    tracks: [],
  };
}

function ensureTrack(
  project: EditorProject,
  type: EditorTrack["type"],
  name: string,
): EditorTrack {
  const existing = project.tracks.find((track) => track.type === type);
  if (existing) return existing;

  const track: EditorTrack = { id: id("track"), type, name, clips: [] };
  project.tracks.push(track);
  return track;
}

export function addAsset(project: EditorProject, input: TaskAssetInput): EditorAsset {
  const asset: EditorAsset = {
    id: input.id ?? id("asset"),
    type: input.type,
    src: input.src,
    name: input.name,
    duration: input.duration,
  };

  project.assets.push(asset);
  return asset;
}

export function addClip(
  project: EditorProject,
  assetId: string,
  start: number,
  options: Omit<EditorClip, "id" | "assetId" | "trackId" | "start"> & { trackType?: EditorTrack["type"] } = {},
): EditorClip {
  const asset = project.assets.find((item) => item.id === assetId);
  if (!asset) throw new Error(`Unknown asset: ${assetId}`);

  const trackType = options.trackType ?? (asset.type === "audio" ? "audio" : "video");
  const track = ensureTrack(project, trackType, trackType === "audio" ? "Audio" : "Video");
  const clip: EditorClip = {
    id: id("clip"),
    assetId,
    trackId: track.id,
    start,
    duration: options.duration ?? asset.duration,
    sourceStart: options.sourceStart,
    sourceDuration: options.sourceDuration,
    volume: options.volume,
    speed: options.speed,
  };

  track.clips.push(clip);
  project.duration = Math.max(project.duration, start + (clip.duration ?? 0));
  return clip;
}

export function importAssets(
  project: EditorProject,
  inputs: TaskAssetInput[],
): EditorAsset[] {
  return inputs.map((input) => addAsset(project, input));
}

export function createProjectFromTask(input: TaskProjectInput): EditorProject {
  const project = createProject(input);

  const scenes = input.scenes ?? [];
  const assets: TaskAssetInput[] = [
    ...scenes.map((scene) => ({
      id: scene.id,
      type: "video" as const,
      src: scene.src,
      name: scene.name,
      duration: scene.duration,
    })),
    ...(input.assets ?? []),
    ...(input.voice ? [input.voice] : []),
    ...(input.music ? [input.music] : []),
  ];

  importAssets(project, assets);

  let cursor = 0;
  for (const scene of scenes) {
    const asset = project.assets.find((item) => item.id === scene.id || item.src === scene.src);
    if (!asset) continue;
    addClip(project, asset.id, cursor, { duration: scene.duration, trackType: "video" });
    cursor += scene.duration ?? asset.duration ?? 0;
  }

  if (input.voice) {
    const asset = project.assets.find((item) => item.id === input.voice?.id || item.src === input.voice?.src);
    if (asset) addClip(project, asset.id, 0, { duration: asset.duration, trackType: "audio" });
  }

  if (input.music) {
    const asset = project.assets.find((item) => item.id === input.music?.id || item.src === input.music?.src);
    if (asset) addClip(project, asset.id, 0, { duration: project.duration, trackType: "audio" });
  }

  return project;
}

export function serializeProject(project: EditorProject): string {
  return JSON.stringify(project, null, 2);
}

export function deserializeProject(value: string): EditorProject {
  const project = JSON.parse(value) as EditorProject;
  if (project.version !== 1 || !Array.isArray(project.assets) || !Array.isArray(project.tracks)) {
    throw new Error("Invalid Meh Editor project");
  }
  return project;
}
