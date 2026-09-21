# Geometry Dash — User Guide

## Getting Started

### Running the Game

1. **Simplest method** — double-click `index.html` to open in your default browser
2. **Local server** (recommended for full features):
   ```bash
   cd geometry-dash
   python3 -m http.server 8080
   ```
   Then open http://localhost:8080

### First Game

1. Click **START** (or press Space)
2. Time your jumps to avoid obstacles
3. Collect golden orbs for bonus points
4. Try to get as far as possible

## Controls

### Desktop
- **Space** or **Arrow Up** — Jump
- **Click** on the game canvas — Jump
- **P** or **Escape** — Pause / Resume

### Mobile
- **Tap** anywhere on the game canvas — Jump

## Gameplay

### Obstacles

| Type | Description | Strategy |
|------|-------------|----------|
| **Spike** | Single triangle | Standard jump |
| **Double Spike** | Two spikes in a row | Jump early to clear both |
| **Triple Spike** | Three spikes in a row | Jump early with good timing |
| **Block** | Square obstacle | Standard jump, slightly wider |
| **Pillar** | Tall narrow wall | Requires a full-height jump |

Obstacles appear in patterns that get more complex as your score increases. Early in the run you'll see simple single spikes and blocks. As difficulty ramps up, combined patterns appear — spikes followed by blocks, pillars next to spikes, etc.

### Orbs

Golden spinning diamond-shaped collectibles appear periodically above the ground. Each orb is worth **+3 points** and triggers a brief screen flash and sparkle effect.

### Combo System

Every obstacle you successfully pass adds to your combo counter. Every 5 consecutive passes earns a combo bonus:
- 5x combo: +1 bonus per obstacle
- 10x combo: +2 bonus per obstacle
- 15x combo: +3 bonus per obstacle
- And so on...

Your combo resets when you die.

### Difficulty Progression

The game gets faster as you travel further. Speed increases continuously based on distance traveled. Obstacle spawn rates also increase, and more complex patterns appear at higher scores.

### Progress Bar

The thin bar at the top of the canvas shows your distance as a percentage. Getting to 100% distance is the ultimate goal.

## Sound

Click **SOUND ON** before or during gameplay to enable:

- **Background music** — procedurally generated 140 BPM electronic track with bass, melody, kicks, and hi-hats
- **Jump sound** — quick rising tone
- **Landing sound** — subtle low thud
- **Orb collect** — ascending three-note chime
- **Death** — noise burst with low boom

Sound is generated entirely through the Web Audio API — no audio files needed.

## Scoring

| Action | Points |
|--------|--------|
| Pass an obstacle | +1 (base) |
| Combo bonus (every 5) | +1 extra per 5 combo |
| Collect an orb | +3 |

Your **best score** is saved automatically and displayed next to your current score.

## Tips

1. **Don't panic-jump** — timing is everything. Wait until obstacles are close before jumping.
2. **Learn the patterns** — obstacle patterns repeat. Recognizing them helps you react faster.
3. **Use jump buffering** — pressing jump slightly before landing still registers. You don't need perfect frame timing.
4. **Coyote time** — you have a few frames of grace after walking off an edge where you can still jump. This makes the controls feel responsive.
5. **Collect orbs** — they're worth 3x a normal obstacle pass and easy to grab.
6. **Watch the speed** — the game accelerates continuously. Reaction time matters more as you progress.
7. **Turn on sound** — the beat can help with jump timing.

## Data Storage

The game stores the following in your browser's localStorage:

| Key | Description |
|-----|-------------|
| `gd_best` | Your highest score |
| `gd_attempts` | Total number of attempts |

To reset your data, open the browser console and run:
```js
localStorage.removeItem('gd_best');
localStorage.removeItem('gd_attempts');
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Game doesn't load | Use a local HTTP server instead of opening the file directly |
| No sound | Click "SOUND ON" button; some browsers require a user interaction before audio plays |
| Laggy | Close other tabs; the game runs at 60fps on modern hardware |
| Canvas too small | Resize your browser window; the game scales to fit |
