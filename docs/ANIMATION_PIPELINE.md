# Dance Animation Pipeline

This project now separates choreography planning from real character animation.

## Why the current moves are not real avatar animation yet

The current dance modules in `src/dance/danceLibrary.js` are high-level move IDs,
categories, timing rules, and procedural preview poses. They are useful for music
sync and sequence planning, but they are not full skeletal animation clips.

A Character Creator, Mixamo, ActorCore, or CMU motion file needs real bone tracks:

- target bones, such as hips, spine, arms, legs, hands, and feet
- keyframed transforms for those bones
- a known humanoid rest pose, usually T-pose or A-pose
- compatible scale, axis, and skeleton orientation
- a retarget step if the source skeleton and character skeleton are different

The missing conversion layer is:

1. motion source file, such as `.fbx`, `.bvh`, or `.glb`
2. retarget the source skeleton onto the final avatar skeleton
3. export a web-friendly `.glb` with embedded animation clips, or prepare separate clip files
4. map each project move ID to a real animation clip
5. let `AnimationMixer` sample the clip using the music beat grid

## How to use Mixamo dance clips

Mixamo dance downloads are usually single skeletal animation clips. They are
good as body-motion modules, but they are not a complete stage choreography by
themselves. A clip may contain arm, leg, spine, hip, and body motion, but it
usually does not contain a full song-level arrangement, dancer spacing, camera
blocking, or two-person formation design.

For this project, treat Mixamo clips as the body layer:

```text
final dancer transform =
stage formation transform
+ skeletal animation clip
+ optional small procedural preview offset
```

This means:

- Mixamo controls how the body dances.
- `src/dance/formationLibrary.js` controls where each dancer stands or moves.
- `src/dance/danceLibrary.js` controls which move module is active.
- the audio beat grid controls when each module starts and how fast it plays.

This separation is important because real choreography needs both body motion
and blocking. Blocking means stage position, spacing, facing direction, pair
distance, diagonal movement, center focus, and ending pose.

## Current implementation

- `src/dance/animationRegistry.js` maps every dance move ID to future animation clip aliases.
- `src/dance/formationLibrary.js` adds an independent formation layer for dancer root position and facing direction.
- `src/scene/CharacterSlots.jsx` now creates a `THREE.AnimationMixer` for imported characters.
- If an imported `.glb` or `.fbx` contains a matching embedded animation clip, the character uses it.
- Clip playback is sampled from `danceState.modulePhase`, so each clip is locked to the current 8-beat dance module.
- If no real clip exists yet, imported characters still receive a small procedural root-motion preview instead of staying completely frozen.

## Folder convention

Put future animation assets here:

```text
public/assets/animations/
```

Recommended final web format:

```text
public/assets/animations/dance-pack.glb
```

For early tests, a single animated `.fbx` or `.glb` can also be embedded directly
in the avatar file. If there is only one clip in the file, the adapter can use it
as a fallback preview for any selected module.

## Naming convention

The adapter first matches clips by aliases. Good clip names are:

- `side-groove`
- `bounce-step`
- `power-hit`
- `original-latin-01`
- `Original Latin 01 - Opening Arms & Kicks`

When adding a new real clip, keep the move ID stable and add clip aliases in
`src/dance/animationRegistry.js` only if the exported clip name is different.

## Timing rule

Every current dance module is treated as an 8-beat phrase. Runtime clip time is:

```text
clipTime = modulePhase * clip.duration
```

This means the music beat grid, not screen FPS, controls the dancer timing.
Later, individual clips can set `loopsPerModule` if a short clip should repeat
twice inside one 8-beat module.
