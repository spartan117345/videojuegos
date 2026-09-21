// Game Integration for Advanced Terrain System
// This file shows how to integrate the terrain system with your existing game

// Import terrain and physics systems
// Note: In browser, these would be loaded via script tags before this file

// Initialize terrain system in your game
function initializeTerrainGame(canvas, ctx) {
    // Create terrain system
    const terrainSystem = new TerrainSystem(canvas, ctx);

    // Create enhanced physics
    const physics = new EnhancedPhysics();

    // Create particle system for effects
    const particles = new TerrainParticles(ctx);

    // Create terrain effects
    const terrainEffects = new TerrainEffects(ctx, canvas);

    // Generate a demo level with all terrain types
    const demoLevel = createDemoLevel(canvas);

    // Add all segments to terrain system
    demoLevel.forEach(segment => terrainSystem.addSegment(segment));

    return {
        terrainSystem,
        physics,
        particles,
        terrainEffects
    };
}

// Create a demo level showcasing all terrain types
function createDemoLevel(canvas) {
    const segments = [];
    let currentX = 0;

    // Start with flat terrain
    segments.push(new FlatTerrain(currentX, currentX + 300, 50));
    currentX += 300;

    // Add gentle hills
    segments.push(new HillTerrain(currentX, currentX + 400, 50, 100));
    currentX += 400;
    segments.push(new HillTerrain(currentX, currentX + 400, 100, 30));
    currentX += 400;

    // Add sine wave terrain
    segments.push(new CurveTerrain(
        currentX,
        currentX + 600,
        'sine',
        40,     // amplitude
        0.01,   // frequency
        60      // base height
    ));
    currentX += 600;

    // Flat section for preparation
    segments.push(new FlatTerrain(currentX, currentX + 200, 50));
    currentX += 200;

    // Add Bézier curve terrain
    segments.push(new CurveTerrain(
        currentX,
        currentX + 500,
        'bezier',
        80,     // amplitude
        0.008,  // frequency
        70      // base height
    ));
    currentX += 500;

    // Another flat section
    segments.push(new FlatTerrain(currentX, currentX + 300, 50));
    currentX += 300;

    // Epic 3D spiral!
    segments.push(new Spiral3DTerrain(
        currentX,
        currentX + 800,
        {
            centerX: currentX + 400,
            centerY: canvas.height / 2,
            centerZ: 0,
            radius: 120,
            pitch: 80,
            rotations: 2,
            tubeRadius: 40,
            color: '#4a90e2',
            edgeColor: '#6cafff'
        }
    ));
    currentX += 800;

    // Recovery flat section
    segments.push(new FlatTerrain(currentX, currentX + 300, 50));
    currentX += 300;

    // Complex curve combination
    segments.push(new CurveTerrain(
        currentX,
        currentX + 600,
        'perlin',
        50,
        0.015,
        60
    ));
    currentX += 600;

    // Second spiral with different parameters
    segments.push(new Spiral3DTerrain(
        currentX,
        currentX + 1000,
        {
            centerX: currentX + 500,
            centerY: canvas.height / 2 - 50,
            centerZ: 0,
            radius: 150,
            pitch: 120,
            rotations: 3,
            tubeRadius: 35,
            color: '#e24a90',
            edgeColor: '#ff6caf'
        }
    ));
    currentX += 1000;

    // Final stretch with varied terrain
    segments.push(new HillTerrain(currentX, currentX + 300, 50, 120));
    currentX += 300;
    segments.push(new HillTerrain(currentX, currentX + 300, 120, 20));
    currentX += 300;
    segments.push(new FlatTerrain(currentX, currentX + 500, 50));
    currentX += 500;

    return segments;
}

// Modified player update function
function updatePlayerWithTerrain(player, terrainSystem, physics, particles, deltaTime) {
    // Update physics with terrain
    physics.updatePlayer(player, terrainSystem, deltaTime);

    // Update camera to follow player
    terrainSystem.updateCamera(player, deltaTime);

    // Emit particles when landing or running on special terrain
    if (!player.isJumping) {
        const terrainType = terrainSystem.getTypeAt(player.x);
        if (terrainType !== 'flat' && Math.random() < 0.3) {
            particles.emit(
                player.x + player.width / 2,
                player.y + player.height,
                terrainType,
                2
            );
        }
    }

    // Update particles
    particles.update();
}

// Modified jump function
function playerJumpWithTerrain(player, terrainSystem, physics) {
    if (!player.isJumping) {
        physics.applyJump(player, terrainSystem);

        // Emit jump particles
        const terrainType = terrainSystem.getTypeAt(player.x);
        const particles = new TerrainParticles(null); // Would use actual ctx
        particles.emit(
            player.x + player.width / 2,
            player.y + player.height,
            terrainType,
            8
        );

    } else if (player.canDoubleJump && !player.hasUsedDoubleJump) {
        player.velocityY = -15 * 0.8 * player.gravityMultiplier;
        player.hasUsedDoubleJump = true;
    }
}

// Modified render function
function renderGameWithTerrain(ctx, canvas, gameObjects, terrainSystem, particles, terrainEffects) {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get current terrain type for background effects
    const player = gameObjects.player;
    const currentTerrainType = terrainSystem.getTypeAt(player.x);

    // Apply terrain-specific visual effects
    terrainEffects.render(currentTerrainType, terrainSystem.camera);

    // Apply screen shake if active
    const shakeOffset = gameObjects.getScreenShakeOffset ? gameObjects.getScreenShakeOffset() : {x: 0, y: 0};
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // Render terrain
    terrainSystem.render(terrainSystem.camera.x, terrainSystem.camera.y);

    // Render particles
    particles.render();

    // Render other game objects (obstacles, powerups, etc.)
    // ... existing render code ...

    ctx.restore();

    // Render UI elements
    renderTerrainUI(ctx, canvas, terrainSystem, player);
}

// UI for terrain information
function renderTerrainUI(ctx, canvas, terrainSystem, player) {
    const terrainType = terrainSystem.getTypeAt(player.x);
    const terrainHeight = terrainSystem.getHeightAt(player.x);
    const terrainNormal = terrainSystem.getNormalAt(player.x);

    // Terrain indicator
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`Terrain: ${terrainType.toUpperCase()}`, 10, canvas.height - 60);

    if (terrainType === 'hill' || terrainType === 'curve') {
        const angle = terrainNormal * (180 / Math.PI);
        ctx.fillText(`Slope: ${angle.toFixed(1)}°`, 10, canvas.height - 40);
    }

    if (terrainType === 'spiral3d') {
        ctx.fillStyle = '#00ffff';
        ctx.fillText('3D SPIRAL MODE ACTIVE', 10, canvas.height - 40);

        // Draw spiral progress indicator
        const segment = terrainSystem.getSegmentAt(player.x);
        if (segment) {
            const progress = (player.x - segment.startX) / (segment.endX - segment.startX);
            const barWidth = 200;
            const barHeight = 10;
            const barX = canvas.width / 2 - barWidth / 2;
            const barY = 50;

            // Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Progress
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);

            // Border
            ctx.strokeStyle = 'white';
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // Label
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SPIRAL PROGRESS', canvas.width / 2, barY - 5);
            ctx.textAlign = 'left';
        }
    }
}

// Generate endless terrain procedurally
function generateEndlessTerrain(terrainSystem, playerX, difficultyLevel) {
    const lastSegment = terrainSystem.segments[terrainSystem.segments.length - 1];
    if (!lastSegment) return;

    const generateAhead = 2000; // Generate terrain 2000px ahead

    if (lastSegment.endX < playerX + generateAhead) {
        const newSegments = TerrainGenerator.generateLevel(
            1000,  // Length to generate
            difficultyLevel
        );

        // Adjust positions to connect with existing terrain
        const offset = lastSegment.endX;
        newSegments.forEach(segment => {
            segment.startX += offset;
            segment.endX += offset;
            terrainSystem.addSegment(segment);
        });
    }

    // Clean up old terrain segments (memory optimization)
    const cleanupDistance = 2000;
    terrainSystem.segments = terrainSystem.segments.filter(
        segment => segment.endX > playerX - cleanupDistance
    );
}

// Collision detection with terrain-aware obstacles
function checkObstacleCollisionWithTerrain(player, obstacle, terrainSystem) {
    // Adjust obstacle position based on terrain
    const obstacleTerrainHeight = terrainSystem.getHeightAt(obstacle.x);
    const adjustedObstacleY = terrainSystem.canvas.height - obstacleTerrainHeight - obstacle.height;

    // Standard AABB collision with terrain adjustment
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < adjustedObstacleY + obstacle.height &&
           player.y + player.height > adjustedObstacleY;
}

// Handle special terrain interactions
function handleTerrainInteractions(player, terrainSystem) {
    const terrainType = terrainSystem.getTypeAt(player.x);

    switch(terrainType) {
        case 'spiral3d':
            // Special scoring in spirals
            if (!player.inSpiral) {
                player.inSpiral = true;
                player.spiralBonus = 2; // Double points in spirals
                showNotification('SPIRAL BONUS x2!', '🌀');
            }
            break;

        case 'curve':
            // Speed boost on curves
            if (!player.onCurve) {
                player.onCurve = true;
                player.speedBoost = 1.2;
                showNotification('SPEED BOOST!', '⚡');
            }
            break;

        default:
            // Reset special states
            player.inSpiral = false;
            player.spiralBonus = 1;
            player.onCurve = false;
            player.speedBoost = 1;
            break;
    }
}

// Notification system for terrain events
function showNotification(text, icon) {
    // This would integrate with your existing notification system
    console.log(`${icon} ${text}`);
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.initializeTerrainGame = initializeTerrainGame;
    window.createDemoLevel = createDemoLevel;
    window.updatePlayerWithTerrain = updatePlayerWithTerrain;
    window.playerJumpWithTerrain = playerJumpWithTerrain;
    window.renderGameWithTerrain = renderGameWithTerrain;
    window.renderTerrainUI = renderTerrainUI;
    window.generateEndlessTerrain = generateEndlessTerrain;
    window.checkObstacleCollisionWithTerrain = checkObstacleCollisionWithTerrain;
    window.handleTerrainInteractions = handleTerrainInteractions;
}