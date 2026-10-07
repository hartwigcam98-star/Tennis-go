# Real crowd recordings (optional)

The game generates all of its sounds in code. To use real recordings for the crowd instead, put audio files
(mp3, m4a, ogg or wav) in this folder and list them in `sounds.json`, for example:

```json
{
  "applause-small": "applause-small.mp3",
  "applause-medium": "applause-medium.mp3",
  "applause-large": "applause-large.mp3",
  "cheer": "cheer.mp3",
  "ooh": "ooh.mp3",
  "crowd-ambience": "crowd-ambience.mp3"
}
```

| Name | What it should be | Length |
|---|---|---|
| applause-small | A few dozen people clapping (club, college) | 2–4 s |
| applause-medium | A few thousand (tour stadium) | 3–5 s |
| applause-large | A full stadium (majors, masters) | 4–6 s |
| cheer | A crowd cheering, "yeah!", whistles | 2–4 s |
| ooh | A crowd's "ooh" at a near miss | 1–2 s |
| crowd-ambience | Quiet stadium murmur between points; loops | 5–20 s |

Leave out any you don't have; those keep the generated sound. Only use recordings you're allowed to use (public domain / CC0, or your own).

## What's in here now

`applause-small`, `applause-medium` and `applause-large` are trimmed, faded and level-matched from BigSoundBank's CC0 recordings
(Applause about 25–50 people #1, Applause: 300 people, Applause: 600 people — bigsoundbank.com, public domain).
