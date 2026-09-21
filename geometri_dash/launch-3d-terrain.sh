#!/bin/bash

# Launch script for 3D Terrain Geometry Dash
echo "🎮 Launching Geometry Dash - 3D Spiral Terrain Edition"
echo "================================================"
echo ""
echo "Features included:"
echo "✓ Flat terrain (original)"
echo "✓ Hills with linear interpolation"
echo "✓ Smooth Bézier curves"
echo "✓ Sine wave terrain"
echo "✓ Perlin noise terrain"
echo "✓ Full 3D spiral corkscrews with perspective projection"
echo "✓ Dynamic camera system"
echo "✓ Slope physics with rotation"
echo "✓ Particle effects"
echo "✓ Terrain-specific bonuses"
echo "✓ Three game modes:"
echo "  - Demo Level (showcases all terrain)"
echo "  - Endless Mode (procedural generation)"
echo "  - Spiral Challenge (spiral-focused)"
echo ""
echo "Controls:"
echo "• SPACE/Click - Jump"
echo "• P - Pause"
echo "• D - Debug mode"
echo ""
echo "Opening in browser..."

# Detect OS and open appropriately
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open game-terrain-3d.html
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open game-terrain-3d.html
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start game-terrain-3d.html
else
    echo "Please open game-terrain-3d.html in your browser manually"
fi

echo ""
echo "Game launched! Enjoy the 3D spirals! 🌀"