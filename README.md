# VR Dance Term Project

This folder contains the modernized web project scaffold for the original `Dance.c` OpenGL demo.

## Oral Presentation

### PBR shading introduction

This project uses Three.js / WebGL real-time forward rasterization. For the
placeholder performers and many stage objects, the material model is
`MeshStandardMaterial`, which follows a Physically Based Rendering style with a
metallic-roughness workflow.

PBR, or Physically Based Rendering, tries to describe how light interacts with
surfaces using physically meaningful material properties. Instead of only tuning
an artificial highlight like older Phong shading, PBR describes a surface with
parameters such as:

- `baseColor`: the visible surface color
- `metalness`: whether the surface behaves like metal or dielectric material
- `roughness`: how sharp or blurred the specular reflection is
- `normal`: small surface detail direction
- `emissive`: self-glow used for stylized stage effects

This is useful for this dance stage project because realistic characters, skin,
clothing, metallic accessories, and stage materials should respond consistently
when the lighting changes.

### Rendering equation

The core idea of physically based shading is the rendering equation. For a point
`p` on a surface, the outgoing light toward the viewer direction `ω_o` is:

```text
L_o(p, ω_o) = ∫Ω f_r(p, ω_i, ω_o) L_i(p, ω_i) max(n · ω_i, 0) dω_i
```

Where:

- `L_o` is the outgoing radiance toward the camera.
- `L_i` is incoming radiance from a light direction.
- `ω_i` is the incoming light direction.
- `ω_o` is the outgoing view direction.
- `n` is the surface normal.
- `f_r` is the BRDF, which describes how the material reflects light.
- `max(n · ω_i, 0)` darkens light that hits the surface at a shallow angle.

The BRDF can be understood as:

```text
f_r = dL_o / dE_i
```

This means it is the ratio between outgoing radiance and incoming irradiance.
In other words, it tells the renderer how much incoming light is reflected toward
the viewer.

### PBR BRDF components

In real-time PBR, the surface reflection is usually separated into diffuse and
specular components:

```text
f_r = f_diffuse + f_specular
```

The diffuse part is often Lambertian:

```text
f_diffuse = (1 - F) * c_diff / π
```

The specular part is commonly modeled with a microfacet BRDF:

```text
f_specular = D(h) G(l, v) F(v, h) / [4(n · l)(n · v)]
```

Where:

- `n` is the normal direction.
- `l` is the light direction.
- `v` is the view direction.
- `h = normalize(l + v)` is the half vector.
- `D` describes the distribution of tiny mirror-like microfacets.
- `G` describes masking and shadowing between microfacets.
- `F` is the Fresnel term, which increases reflection at grazing angles.

### Metallic-roughness model

Three.js and glTF commonly use the metallic-roughness workflow:

```text
α = roughness²
```

```text
c_diff = baseColor * (1 - metallic)
```

```text
F0 = mix(0.04, baseColor, metallic)
```

Here, `roughness` controls how wide and soft the highlight is. A low roughness
value creates a sharp highlight, while a high roughness value creates a wider
and blurrier highlight.

`metallic` controls whether the material behaves like a non-metal or a metal.
For non-metal materials such as skin, fabric, or plastic, most color appears in
the diffuse part. For metal, most color appears in the specular reflection.

### GGX microfacet distribution

PBR assumes the surface is made of many tiny mirror-like microfacets. A common
distribution is GGX:

```text
D_GGX(n, h, α) =
α² / [π ((n · h)²(α² - 1) + 1)²]
```

When `α` is small, the microfacets point in similar directions, creating a
sharp highlight. When `α` is large, the microfacets are more scattered, creating
a soft highlight. This makes roughness more physically meaningful than the older
Phong `shininess` parameter.

### Fresnel term

The Fresnel effect means surfaces reflect more strongly when viewed at a shallow
angle. A common approximation is Schlick Fresnel:

```text
F(v, h) = F0 + (1 - F0)(1 - v · h)^5
```

In this project, this helps stage rim lights and back lights create stronger
character silhouettes, especially around the edge of clothing and accessories.

### Geometry term

The geometry term models how microfacets block each other:

```text
G1(x) = (n · x) / [(n · x)(1 - k) + k]
```

```text
G(l, v) = G1(l) G1(v)
```

```text
k = (α + 1)² / 8
```

This prevents the specular reflection from becoming unrealistically bright and
helps preserve energy conservation.

### Comparison with older shading

- Gouraud shading computes lighting at vertices and interpolates the result, so
  it is fast but can look coarse on characters.
- Phong shading computes lighting per pixel and gives better highlights, but it
  is still mostly an empirical model.
- PBR uses physically motivated BRDF terms such as roughness, Fresnel, and
  microfacet visibility, which makes it more suitable for modern characters and
  stage lighting.

For this project, PBR is a better fit because the goal is not only to render a
simple object, but to make imported characters, costumes, lights, shadows, and
stage materials react consistently during a music performance.

### Technical innovation of this project

- Modernizes the original C/OpenGL fixed-style dance demo into a Vite + React +
  Three.js WebGL application.
- Replaces cube-based body parts with a pipeline prepared for Character Creator,
  Mixamo, ActorCore, or other humanoid avatar sources.
- Uses PBR-style materials so characters and stage objects can respond naturally
  to dynamic lighting.
- Uses the audio beat grid as the master simulation clock, reducing music and
  animation drift.
- Performs automatic BPM and main-section detection from an uploaded music file.
- Converts choreography into modular 8-beat dance blocks that can be recommended,
  restored to the original sequence, or manually rearranged by the user.
- Adds a real-animation adapter so future `.fbx` or `.glb` character animation
  clips can be mapped to the same dance module IDs.
- Simulates Korean stage lighting with dynamic spotlights, additive beam meshes,
  localized haze, and beat-reactive lighting changes.
- Adds beat-synced background fan-ray lights and stronger LED color changes as
  non-physical background screen effects.
- Adds automatic camera direction, including full-stage views, two-person
  framing, and individual fancam-style closeups.

In short, the technical goal is to combine PBR character rendering, beat-synced
music analysis, modular choreography, stage lighting, haze, and camera direction
into one real-time WebGL performance simulator.

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
- zoom range: now supports close-up manual zoom for individual dancer framing
- horizontal rotation range: about `120 degrees`
- camera state stays where you stop dragging or zooming
- auto camera includes chorus individual fancam-style shots for the lead and partner

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
- current stage scale uses a larger performance floor with slightly smaller avatar targets for better stage-to-dancer proportion

## Music sync phase

- you can now load a local audio file from the in-app control panel
- the project now attempts automatic beat detection after upload
- detected beat times are used as the simulator's master timing grid
- BPM can still be manually corrected if the auto estimate is slightly off
- the stage lights, floor, and placeholder performers react to beat pulse and section emphasis
- the UI now shows main-section candidates as a first-pass chorus / highlight heuristic
- haze is localized to translucent stage-area layers instead of global scene fog, so camera distance no longer changes the whole-space fog density

## Modular dance sequence phase

- dance moves are now represented as reusable 8-beat modules in `src/dance/danceLibrary.js`
- the original `Dance.c` choreography is preserved as 16 required `Original Latin` modules derived from `MMOVIE.TXT` and `FMOVIE.TXT`
- every move is categorized as intro, verse/basic, transition, formation, main section, accent, or ending
- `src/dance/animationRegistry.js` maps move IDs to future real animation clip names
- `src/dance/formationLibrary.js` separates stage blocking from skeletal dance clips
- after audio analysis finishes, the app calculates how many 8-beat modules fit into the track
- a bottom `Dance Sequence Builder` panel appears with a recommended move order
- the dance sequence panel can now collapse downward from the bottom of the screen
- `Recommend` builds a new sequence by matching music sections to move categories
- `Original` loads the source project order with the restored block dancers
- `Original Puppet` loads the same source project order and drives the imported humanoid characters from the 16 original choreography modules
- users can manually replace each module before confirming the sequence
- playback is locked until the dance sequence is confirmed
- while music is playing, the dance sequence is read-only; pause playback before editing
- placeholder dancers now preview the selected module sequence with beat-synced procedural motion
- imported characters can use embedded `.fbx` / `.glb` animation clips through `THREE.AnimationMixer`
- Mixamo animation-only FBX files in `public/assets/animations/` can now drive both imported characters through the shared external animation registry
- character position, spacing, and facing direction are controlled separately from body animation, so simple Mixamo clips can still support pair formations
- detailed animation pipeline: `docs/ANIMATION_PIPELINE.md`

### Current dance move choices

- Original legacy: 16 `Original Latin` modules from the old `MMOVIE.TXT` / `FMOVIE.TXT` choreography render through the restored block dancers.
- Original puppet: the same 16 modules drive the imported humanoid characters through a coarse block-rig puppet mapping.
- Mixamo real clips: `Breakdance Ready` and `Breakdance Ending 1`, loaded from `public/assets/animations/`.
- The external Mixamo clips are automatically retargeted from `mixamorig:*` / `mixamorig...` track names to the active character rig, including `mixamorig1:*` naming.
- `Original Latin` modules no longer use breakdance approximations; the old block-rig segment directions are mapped onto the current humanoid bones.
- Long source clips can reserve more timeline space: `Breakdance Ending 1` uses a 16-beat module, while shorter ready/neutral clips use 8 beats.
- `Bounce Step` is a legacy placeholder; when humanoid FBX characters are loaded it maps to the neutral ready clip so the characters do not fall back to an unmoving T/A-pose.
- Procedural placeholders: `Side Groove`, `Bounce Step`, `Arm Wave`, `Cross Step`, `Turn Accent`, `Power Hit`, `Jump Kick`, and `Freeze Pose`.
- Embedded character clips: if an imported FBX contains only one animation and no exact move match is found, the character can still fall back to that embedded clip.

### Public dance motion sources

- Mixamo: free Adobe character animation library with dance clips suitable for `.fbx` / retargeting workflows.
- CMU Graphics Lab Motion Capture Database: public academic motion-capture dataset with BVH / AMC-style conversion pipelines available through community mirrors.
- Rokoko Motion Library: searchable motion library with free and paid dance / performance motion assets.
- ActorCore / Reallusion: commercial and free motion packs that pair well with Character Creator avatars.
- DeepMotion / AI mocap tools: useful when converting reference dance video into custom motion, but the generated result still needs cleanup before final import.

### Adding more dance modules

1. Add a new move object to `danceMoves` in `src/dance/danceLibrary.js`.
2. Give it a stable `id`, a user-facing `label`, a short dropdown label, `category`, `energy`, and `tags`.
3. Add a matching procedural preview branch in `src/dance/proceduralDance.js`.
4. Put future real animation clips in `public/assets/animations/`.
5. If the clip name does not match the move ID, add aliases in `src/dance/animationRegistry.js`.

## Korean stage lighting method

This project now includes a Korean performance-stage lighting layer focused on
spatial division, beam matrices, and beat-reactive haze.

### Spatial division and beam matrix

- `src/scene/BeamMatrix.jsx` creates an array of eight rear moving-head-style spotlights.
- The lights are arranged as a high rear truss matrix above the stage, pointing down toward target objects on the floor.
- The beam matrix stays off during `intro`, `verse`, and `preChorus` so silhouette and side/rim lighting remain readable.
- In `chorus`, the targets cycle through moving vertical walls, horizontal tilt walls, fan-open/fan-close looks, diagonal walls, tilt-wave walls, and split-curtain walls.
- Subtle additive floor hits mark where each beam lands, making the rear-to-front beam depth easier to read.
- Every 16-beat phrase is treated as a larger formation phrase, so the light movement feels choreographed instead of jittery.

### Background fan-ray LED effect

- `src/scene/BackgroundFanLights.jsx` creates four additive background fan rigs.
- Two upper rigs are placed closer to center and project toward the audience/front plus upward, using roughly a 2:1 forward-to-up direction ratio.
- Two side rigs sit farther outside the LED back panel and forward between the back panel and dancers, then project inward/upward using roughly a 1:1.5 inward-to-up ratio.
- Each rig emits eight thicker rays, so the look is closer to concert laser/VJ fan graphics.
- The fan rays can tilt up and down with the beat, clamped between horizontal and about 70 degrees upward.
- Side rigs add a small per-ray tilt offset so individual lines remain distinguishable from the front view.
- The visible hub/light-source circles are removed, leaving only the fan-ray shafts.
- Fan-ray brightness has three music-driven modes: `off` for intro, `weak` for verse, and `full` for chorus or pre-chorus accents.
- All rays use one shared color at a time; the color changes by music section instead of mixing multiple colors simultaneously.
- These rays are rendered as `ShaderMaterial` planes with `THREE.AdditiveBlending`, `depthWrite=false`, and `toneMapped=false`.
- They are not real lights and do not illuminate the dancers; they behave like LED screen / background VJ graphics.
- Beat pulse controls opacity, width, shimmer, and fan spread so the background accents match the music without disturbing stage shadows.
- The LED back panel in `src/scene/Stage.jsx` now cycles through wider color palettes per section and uses stronger emissive/additive glow.

### Beat-driven movement

- The simulator uses `audioMetrics.beatIndex`, `beatPhase`, `beatPulse`, and `bassEnergy` as lighting inputs.
- `beatPhase` drives slow wall-position movement inside the main section.
- `beatPulse` creates short brightness and haze emphasis bursts on strong beats.
- `bassEnergy` increases beam width and brightness when low-frequency energy rises.
- The stage cue system changes the lighting profile for `intro`, `verse`, `preChorus`, and `chorus`.

### Visible beam rendering

Three.js `SpotLight` affects surfaces, but it does not automatically render visible
light shafts in empty air. To make the beams visible, the project uses a hybrid method:

- real lighting: `SpotLight` provides actual illumination in the scene
- visible beam mesh: transparent `coneGeometry` represents the light volume
- shading style: a custom additive shader keeps the beam color independent of scene lighting
- blending: `THREE.AdditiveBlending` makes overlapping beams glow brighter
- depth behavior: `depthWrite={false}` prevents transparent beams from blocking each other visually
- orientation: each cone is rotated every frame so it connects the light source to its moving target
- opacity: shader alpha fades along beam length and adds layered haze noise, avoiding a solid colored block look

This is an efficient real-time approximation of volumetric lighting. It is not a
full physical volumetric renderer, but it gives the visual language of haze-scattered
concert beams at much lower performance cost.

### Beat-reactive haze

- `src/scene/BeatHaze.jsx` uses localized translucent stage layers to simulate haze.
- Haze density increases from `intro` to `chorus`.
- Beat pulse and bass energy temporarily raise fog density, making beams appear thicker on musical accents.
- Density is interpolated smoothly each frame to avoid sudden visual popping.

### Tuning guide

- Beam count, color, source position, and sweep direction are defined in `beamRig`.
- Lighting intensity, beam angle, sweep spread, beam radius, and opacity are defined in `cueProfiles`.
- Haze density for each music section is defined in `hazeProfiles`.
- Stronger Korean-stage impact usually comes from increasing `chorus.opacity`, `chorus.spread`, and `chorus.intensity`.
- More subtle haze usually comes from lowering the `beatPulse` and `bassEnergy` multipliers in `BeatHaze.jsx`.

## Original legacy dance mode

- Pressing `Original` or `Original Puppet` in the Dance Sequence Builder loads the original project audio from `public/assets/original/dance.mp3`.
- The same audio analysis pipeline detects BPM, beat grid, section candidates, bass energy, and lighting cues for the legacy track.
- Original motion data is loaded from `public/assets/original/MMOVIE.TXT` and `public/assets/original/FMOVIE.TXT`.
- `src/dance/originalMovie.js` parses the old 32-channel keyframe rows and samples the correct frame inside each 8-beat phrase.
- `Original` renders `src/scene/OriginalBlockDancers.jsx`, the restored Three.js block-rig version of the old male/female dancers.
- `Original Puppet` keeps the imported humanoid characters visible; `src/dance/originalMovie.js` maps old block-rig segment directions onto the major humanoid bones while preserving the characters' mesh, texture, and material.
- The `Original Latin 01-16` modules repeat until the analyzed audio duration ends, so the legacy choreography stays aligned to the beat grid instead of the old fixed `117 ms` timer.
- The mode is auto-confirmed after loading, so Play is available once the browser has loaded and analyzed the audio.

## Next implementation phase

- import real Character Creator avatars
- load dance animation clips
- attach real dancer animation timing to the music clock
- restore color-change and zoom-change effects from the original project
