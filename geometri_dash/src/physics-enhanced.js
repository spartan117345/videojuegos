// Enhanced Physics System for Terrain Interaction
// Handles slopes, curves, and 3D spiral physics

class EnhancedPhysics {
    constructor() {
        this.gravity = 0.8;
        this.maxVelocity = 20;
        this.friction = 0.98;
        this.slopeAdjustment = true;
        this.centrifugalForce = true;
    }

    // Update player physics based on terrain
    updatePlayer(player, terrain, deltaTime = 1) {
        const terrainType = terrain.getTypeAt(player.x + player.width / 2);
        const terrainHeight = terrain.getHeightAt(player.x + player.width / 2);
        const terrainNormal = terrain.getNormalAt(player.x + player.width / 2);

        // Store original values for interpolation
        const originalY = player.y;
        const originalRotation = player.rotation;

        // Apply gravity with terrain adjustment
        if (terrainType === 'spiral3d') {
            this.updateSpiral3DPhysics(player, terrain, deltaTime);
        } else {
            this.updateNormalPhysics(player, terrain, terrainHeight, terrainNormal, deltaTime);
        }

        // Smooth transitions
        if (Math.abs(player.y - originalY) > 50) {
            player.y = originalY + (player.y - originalY) * 0.3;
        }

        // Update rotation based on terrain
        this.updatePlayerRotation(player, terrainNormal, terrainType);
    }

    updateNormalPhysics(player, terrain, terrainHeight, terrainNormal, deltaTime) {
        // Apply gravity
        player.velocityY += this.gravity * player.gravityMultiplier * deltaTime;

        // Apply slope physics
        if (this.slopeAdjustment && Math.abs(terrainNormal) > 0.1) {
            // Adjust horizontal velocity based on slope
            const slopeForce = Math.sin(terrainNormal) * this.gravity * 0.5;
            player.velocityX = (player.velocityX || 0) + slopeForce * deltaTime;

            // Apply friction on slopes
            player.velocityX *= this.friction;

            // Limit horizontal velocity
            player.velocityX = Math.max(-10, Math.min(10, player.velocityX));
        }

        // Update position
        player.y += player.velocityY * deltaTime;
        if (player.velocityX) {
            player.x += player.velocityX * deltaTime;
        }

        // Ground collision with terrain
        const canvas = terrain.canvas;
        const groundY = canvas.height - terrainHeight - player.height;

        if (player.gravityMultiplier === 1) {
            // Normal gravity
            if (player.y >= groundY) {
                player.y = groundY;
                player.velocityY = 0;
                player.isJumping = false;
                player.hasUsedDoubleJump = false;

                // Stick to slopes
                if (Math.abs(terrainNormal) > 0.1) {
                    const nextHeight = terrain.getHeightAt(player.x + player.width / 2 + 1);
                    const heightDiff = nextHeight - terrainHeight;
                    player.y -= heightDiff;
                }
            }
        } else {
            // Flipped gravity
            const ceilingY = terrainHeight;
            if (player.y <= ceilingY) {
                player.y = ceilingY;
                player.velocityY = 0;
                player.isJumping = false;
                player.hasUsedDoubleJump = false;
            }
        }

        // Limit fall speed
        player.velocityY = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, player.velocityY));
    }

    updateSpiral3DPhysics(player, terrain, deltaTime) {
        const segment = terrain.getSegmentAt(player.x);
        if (!segment) return;

        // Map player position to spiral parameter
        const t = (player.x - segment.startX) / (segment.endX - segment.startX);
        const angle = segment.startAngle + t * segment.rotations * Math.PI * 2;

        // Calculate position on spiral
        const spiralX = segment.centerX + Math.cos(angle) * segment.radius;
        const spiralY = segment.centerY + Math.sin(angle) * segment.radius;
        const spiralZ = segment.centerZ + (angle / (Math.PI * 2)) * segment.pitch;

        // Apply centrifugal force
        if (this.centrifugalForce) {
            const centrifugalStrength = Math.abs(player.velocityY) * 0.1;
            const outwardForce = {
                x: (player.x - spiralX) * centrifugalStrength,
                y: (player.y - spiralY) * centrifugalStrength
            };

            player.velocityX = (player.velocityX || 0) + outwardForce.x * deltaTime;
            player.velocityY += outwardForce.y * deltaTime;
        }

        // Constrain to spiral path
        const distanceFromCenter = Math.sqrt(
            Math.pow(player.x - spiralX, 2) +
            Math.pow(player.y - spiralY, 2)
        );

        if (distanceFromCenter > segment.radius + segment.tubeRadius) {
            // Pull back to spiral
            const pullStrength = 0.5;
            const pullX = (spiralX - player.x) * pullStrength;
            const pullY = (spiralY - player.y) * pullStrength;

            player.x += pullX * deltaTime;
            player.y += pullY * deltaTime;
        }

        // Apply gravity along spiral tangent
        const tangentAngle = angle + Math.PI / 2;
        const gravityAlongSpiral = this.gravity * Math.cos(tangentAngle) * 0.7;
        player.velocityY += gravityAlongSpiral * player.gravityMultiplier * deltaTime;

        // Update position
        player.y += player.velocityY * deltaTime;

        // Check spiral collision
        const spiralHeight = terrain.canvas.height - segment.getHeightAt(player.x) - player.height;
        if (player.y >= spiralHeight) {
            player.y = spiralHeight;
            player.velocityY = 0;
            player.isJumping = false;
            player.hasUsedDoubleJump = false;
        }
    }

    updatePlayerRotation(player, terrainNormal, terrainType) {
        if (player.isJumping) {
            // Rotation in air
            if (terrainType === 'spiral3d') {
                player.rotation += 8; // Faster rotation in spirals
            } else {
                player.rotation += 5 * player.gravityMultiplier;
            }
        } else {
            // Align with terrain when grounded
            const targetRotation = terrainNormal * (180 / Math.PI);
            player.rotation += (targetRotation - player.rotation) * 0.2;
        }
    }

    // Apply jump with terrain-aware adjustments
    applyJump(player, terrain) {
        const terrainNormal = terrain.getNormalAt(player.x + player.width / 2);
        const terrainType = terrain.getTypeAt(player.x + player.width / 2);

        let jumpForce = -15; // Base jump force

        // Adjust jump based on terrain
        if (terrainType === 'spiral3d') {
            jumpForce *= 1.2; // Stronger jump in spirals
        } else if (Math.abs(terrainNormal) > 0.2) {
            // Adjust jump angle based on slope
            const angleAdjustment = Math.cos(terrainNormal);
            jumpForce *= angleAdjustment;

            // Add horizontal component for slope jumps
            player.velocityX = (player.velocityX || 0) + Math.sin(terrainNormal) * 5;
        }

        player.velocityY = jumpForce * player.gravityMultiplier;
        player.isJumping = true;

        return true;
    }

    // Check if player can stand on terrain
    canStandOnTerrain(player, terrain) {
        const terrainHeight = terrain.getHeightAt(player.x + player.width / 2);
        const terrainNormal = terrain.getNormalAt(player.x + player.width / 2);

        // Can't stand on slopes steeper than 60 degrees
        const maxSlope = Math.PI / 3;
        if (Math.abs(terrainNormal) > maxSlope) {
            return false;
        }

        const groundY = terrain.canvas.height - terrainHeight - player.height;
        const tolerance = 5;

        return Math.abs(player.y - groundY) < tolerance;
    }

    // Calculate effective speed based on terrain
    getEffectiveSpeed(baseSpeed, terrainNormal) {
        if (Math.abs(terrainNormal) < 0.1) {
            return baseSpeed;
        }

        // Slower uphill, faster downhill
        const slopeModifier = 1 - Math.sin(terrainNormal) * 0.3;
        return baseSpeed * slopeModifier;
    }

    // Check collision between entity and terrain
    checkTerrainCollision(entity, terrain) {
        const terrainType = terrain.getTypeAt(entity.x);
        const segment = terrain.getSegmentAt(entity.x);

        if (!segment) return false;

        if (terrainType === 'spiral3d') {
            return segment.checkCollision(entity);
        } else {
            const terrainHeight = segment.getHeightAt(entity.x + entity.width / 2);
            const entityBottom = entity.y + entity.height;
            const groundY = terrain.canvas.height - terrainHeight;

            return entityBottom >= groundY;
        }
    }

    // Apply force to entity
    applyForce(entity, forceX, forceY) {
        entity.velocityX = (entity.velocityX || 0) + forceX;
        entity.velocityY += forceY;
    }

    // Dampen velocity
    dampenVelocity(entity, dampingFactor = 0.95) {
        if (entity.velocityX) {
            entity.velocityX *= dampingFactor;
            if (Math.abs(entity.velocityX) < 0.01) {
                entity.velocityX = 0;
            }
        }

        entity.velocityY *= dampingFactor;
    }
}

// Particle system for terrain effects
class TerrainParticles {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 100;
    }

    emit(x, y, terrainType, count = 5) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1,
                life: 1,
                color: this.getParticleColor(terrainType),
                size: Math.random() * 3 + 1
            });
        }
    }

    getParticleColor(terrainType) {
        switch(terrainType) {
            case 'spiral3d':
                return `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.8)`; // Blue-purple
            case 'curve':
                return `hsla(${Math.random() * 30 + 90}, 60%, 50%, 0.8)`; // Green
            case 'hill':
                return `hsla(${Math.random() * 20 + 30}, 50%, 40%, 0.8)`; // Brown
            default:
                return `hsla(0, 0%, ${Math.random() * 30 + 40}%, 0.8)`; // Gray
        }
    }

    update() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life -= 0.02;
            p.vx *= 0.98; // Friction

            return p.life > 0;
        });
    }

    render() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            this.ctx.restore();
        });
    }
}

// Visual effects for different terrain types
class TerrainEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.effects = {
            spiral3d: new Spiral3DEffect(ctx, canvas),
            curve: new CurveEffect(ctx, canvas),
            hill: new HillEffect(ctx, canvas)
        };
    }

    render(terrainType, camera) {
        if (this.effects[terrainType]) {
            this.effects[terrainType].render(camera);
        }
    }
}

class Spiral3DEffect {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.trails = [];
    }

    addTrail(x, y) {
        this.trails.push({
            x, y,
            age: 0,
            maxAge: 30
        });
    }

    render(camera) {
        // Render motion blur and trails
        this.trails = this.trails.filter(trail => {
            trail.age++;
            const alpha = 1 - (trail.age / trail.maxAge);

            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.fillStyle = '#00ffff';
            this.ctx.beginPath();
            this.ctx.arc(trail.x - camera.x, trail.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            return trail.age < trail.maxAge;
        });

        // Render depth fog
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class CurveEffect {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    render(camera) {
        // Wind/speed lines effect
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < 5; i++) {
            const y = Math.random() * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width * 0.3, y + (Math.random() - 0.5) * 20);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
}

class HillEffect {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    render(camera) {
        // Simple dust effect
        // Handled by particle system instead
    }
}

// Make classes available globally for browser
if (typeof window !== 'undefined') {
    window.EnhancedPhysics = EnhancedPhysics;
    window.TerrainParticles = TerrainParticles;
    window.TerrainEffects = TerrainEffects;
    window.Spiral3DEffect = Spiral3DEffect;
    window.CurveEffect = CurveEffect;
    window.HillEffect = HillEffect;
}