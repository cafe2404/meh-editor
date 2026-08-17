# @meh-editor/embed

Standalone integration contract for embedding Meh Editor into another application such as Flowngon.

The package deliberately has **no auth, database, API server, or user/session dependency**. The host application owns those concerns.

## Task -> project

```ts
import { createProjectFromTask } from "@meh-editor/embed";

const project = createProjectFromTask({
  width: 1080,
  height: 1920,
  fps: 30,
  scenes: [
    { id: "scene-1", src: "/tmp/scene-1.mp4", duration: 5 },
    { id: "scene-2", src: "/tmp/scene-2.mp4", duration: 6 },
  ],
  voice: { id: "voice", type: "audio", src: "/tmp/voice.mp3" },
  music: { id: "music", type: "audio", src: "/tmp/music.mp3" },
});
```

The resulting JSON is intentionally editor-owned and independent from OpenCut's server/database models. It can be persisted by the host app and later mapped into the editor stores.

## Public operations

- `createProject()`
- `createProjectFromTask()`
- `addAsset()`
- `importAssets()`
- `addClip()`
- `serializeProject()`
- `deserializeProject()`

## Architecture

```text
Host App / Flowngon
        |
        v
 @meh-editor/embed
        |
        +--> project contract
        +--> media import contract
        +--> timeline contract
        |
        v
 Meh Editor UI + editor stores + WASM
```

The next integration step is to mount the existing Classic editor UI against this contract instead of its account/project backend.
