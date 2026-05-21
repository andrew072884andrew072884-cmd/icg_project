# Character Creator Pipeline

This project is now prepared for a `Character Creator -> Web` workflow.

## Recommended workflow

Preferred path:

1. Build the character in Character Creator.
2. Export as `FBX`.
3. Test the `FBX` directly in this project.
4. If materials or performance need cleanup, import the `FBX` into Blender.
5. Re-export as `GLB` for the final web version.

## Why this path

- Character Creator officially supports FBX export for external DCC and engine workflows.
- This project can now load both `FBX` and `GLB`.
- Final `GLB` is usually cleaner for Three.js deployment.

## Character Creator export steps

Based on Reallusion's official Character Creator export workflow:

1. Finish the character in Character Creator.
2. Use `File -> Export -> FBX -> Clothed Character`.
3. For a base avatar before dance animation, choose `Mesh Only`.
4. Export to a dedicated folder for this project.
5. Copy the exported `.fbx` into:
   - `public/assets/characters/`

Official references:

- FBX export overview:
  - https://manual.reallusion.com/Character-Creator-4/Content/ENU/4.1/17-Export/Export-FBX.htm
- Static FBX character export:
  - https://manual.reallusion.com/Character-Creator-5/Content/ENU/5.0/17-Export/Exporting_FBX_Avatars.htm

## Project import steps

1. Put your exported file in:
   - `public/assets/characters/lead.fbx`
   - or `public/assets/characters/partner.fbx`
2. Open:
   - `src/config/characterSlots.js`
3. Set a slot URL, for example:

```js
url: "/assets/characters/lead.fbx"
```

## Slot tuning options

Each slot supports:

- `position`: world pedestal position
- `rotationY`: facing direction
- `targetHeight`: auto-fit height
- `scaleMultiplier`: final scale adjustment
- `offsetX`, `offsetY`, `offsetZ`: manual correction if the avatar is not perfectly centered

## Important notes for Character Creator avatars

- `FBX` is acceptable for testing.
- `GLB` is preferred for final web delivery.
- Hair, skin shaders, and layered materials from CC may look different in Three.js than in CC.
- If the imported avatar is too glossy or too heavy, pass it through Blender before final export.

## Suggested final delivery pipeline

`Character Creator -> FBX -> Blender cleanup -> GLB -> Three.js`
