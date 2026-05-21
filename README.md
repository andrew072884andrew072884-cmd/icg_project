# VR Dance Term Project

This folder contains the modernized web project scaffold for the original `Dance.c` OpenGL demo.

## Current progress

This build is prepared for the stage before final dance animation:

- Vite + React + React Three Fiber scaffold
- stage layout inspired by the original ballroom demo
- dynamic lighting
- stable manual camera controls
- two reserved avatar slots
- Character Creator-friendly avatar import path

## Current camera controls

- left drag: orbit view
- wheel: zoom in / out
- zoom range: about `0.5x` to `1.0x` of the initial distance
- horizontal rotation range: about `120 degrees`
- camera state stays where you stop dragging or zooming

## How to run

```bash
npm install
npm run dev
```

## Character workflow

This project is now prepared for `Character Creator`:

1. Create your character in Character Creator.
2. Export the character as `.fbx`.
3. Put the file into `public/assets/characters/`.
4. Open `src/config/characterSlots.js`.
5. Set the `url` field, for example:

```js
url: "/assets/characters/lead.fbx"
```

## Recommended avatar requirements

- testing format: `.fbx`
- preferred final web format: `.glb`
- humanoid rig
- consistent unit scale
- neutral T-pose or A-pose before adding dance animation

## Character Creator notes

- detailed pipeline: `docs/CHARACTER_CREATOR_PIPELINE.md`
- importer now auto-centers avatars
- importer now grounds feet onto the stage pedestal
- importer now auto-fits character height

## Music sync phase

- you can now load a local audio file from the in-app control panel
- BPM is manually editable so you can test `4/4` timing before final animation exists
- the stage lights, floor, and placeholder performers now react to beat pulse and bass energy
- this lets us validate the music-driven timing system before real dancer models are attached

## Next implementation phase

- import real Character Creator avatars
- load dance animation clips
- attach real dancer animation timing to the music clock
- restore color-change and zoom-change effects from the original project
