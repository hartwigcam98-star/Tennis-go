# Tennis Go

A Hot Shots–style 3D tennis game for phones with a junior → college → pro career.
Play it at https://hartwigcam98-star.github.io/Tennis-go/

## How the project is put together

`index.html` is the whole game in one file. It is **built** from the parts in `src/` — edit those, never `index.html` directly.

| Path | What it is |
|---|---|
| `src/head.html` | Page head and all CSS |
| `src/body.html` | Screens: title, player select, play style, career hub, recruiting, season, match HUD, results |
| `src/game.js` | Career data and logic, ball physics, stroke animation, player rig, match engine, input, camera |
| `src/venue.js` | Venues (club, college, tour, four majors), court surfaces, stands, the animated crowd. Inserted at `/*@VENUE*/` in game.js |
| `src/fx.js` | Game clock (hit-stop, slow motion), contact and bounce effects, haptics, replays. Inserted at `/*@FX*/` |
| `src/learn.js` | Lessons with Coach Dot and the practice court. Inserted at `/*@LEARN*/` |
| `src/progress.js` | Profile levels, coins, gear, mastery, cosmetics, achievements, daily challenges, locker room. Inserted at `/*@PROGRESS*/` |
| `src/tune.js` | Automatic quality scaling and the Game settings panel (long-press the scoreboard). Inserted at `/*@TUNE*/` |
| `src/draw.js` | The career's field of fictional players, tournament draws, bracket screen, appearance variants. Inserted at `/*@DRAW*/` |
| `src/session.js` | Pause menu, game-clock timers (`after`), saving and resuming a match in progress. Inserted at `/*@SESSION*/` |
| `src/career.js` | Weekly schedule choice and rest weeks, fatigue between matches, Sim, aging, earned rivals, the Tour Finals. Inserted at `/*@CAREER*/` |
| `src/audio.js` | Synthesised sound and officials' calls. Inserted at `/*@AUDIO*/` in game.js |
| `src/vendor/three.js` | three.js r170 |
| `src/assets/boss.js` | Fallback character (R3BOSS) |
| `src/assets/mclips.json` | Mixamo locomotion clips converted for the rig |
| `tools/build.py` | Builds `index.html` from `src/` |
| `tools/convert.mjs` | Converts Mixamo FBX clips to `mclips.json` |
| `tools/tests/` | Playwright scripts used to check strokes, alignment, volleys, smashes, venues and sound (paths inside point at a local checkout) |

Player characters live in `chars/` (copied from the golf game). The golf site is only a fallback if a file is missing.

## Build

```
python3 tools/build.py
```

Then commit `src/` changes together with the rebuilt `index.html`.
