// Advanced Terrain System with 3D Spiral Support
// Supports: Flat, Hills, Curves, and 3D Spirals

class TerrainSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.segments = [];
        this.activeSegments = [];
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            rotation: 0,
            focalLength: 300,
            followPlayer: true
        };
        this.debug = false;
    }

    // Add a terrain segment
    addSegment(segment) {
        this.segments.push(segment);
        // Sort by startX for efficient lookup
        this.segments.sort((a, b) => a.startX - b.startX);
    }

    // Get height at a specific X position
    getHeightAt(x) {
        const segment = this.getSegmentAt(x);
        return segment ? segment.getHeightAt(x) : 50; // Default to original ground height
    }

    // Get terrain normal (angle) at position for physics
    getNormalAt(x) {
        const segment = this.getSegmentAt(x);
        return segment ? segment.getNormalAt(x) : 0;
    }

    // Get terrain type at position
    getTypeAt(x) {
        const segment = this.getSegmentAt(x);
        return segment ? segment.type : 'flat';
    }

    // Find segment at X position
    getSegmentAt(x) {
        // Binary search for efficiency
        let left = 0;
        let right = this.segments.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const segment = this.segments[mid];

            if (x >= segment.startX && x <= segment.endX) {
                return segment;
            } else if (x < segment.startX) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return null;
    }

    // Update active segments based on camera position
    updateActiveSegments(cameraX) {
        const viewWidth = this.canvas.width;
        const buffer = 200; // Extra buffer for smooth transitions

        this.activeSegments = this.segments.filter(segment =>
            segment.endX >= cameraX - buffer &&
            segment.startX <= cameraX + viewWidth + buffer
        );
    }

    // Render all active terrain segments
    render(cameraX, cameraY) {
        this.updateActiveSegments(cameraX);

        // Save context state
        this.ctx.save();

        // Apply camera transform
        this.ctx.translate(-cameraX, -cameraY);

        // Render each active segment
        this.activeSegments.forEach(segment => {
            segment.render(this.ctx, this.camera);
        });

        // Restore context
        this.ctx.restore();

        // Debug info
        if (this.debug) {
            this.renderDebugInfo();
        }
    }

    // Update camera position (for 3D sections)
    updateCamera(player, deltaTime) {
        if (!this.camera.followPlayer) return;

        // Smooth camera following
        const targetX = player.x - this.canvas.width / 3;
        const targetY = -player.y + this.canvas.height / 2;

        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.05;

        // Handle 3D spiral camera rotation
        const currentSegment = this.getSegmentAt(player.x);
        if (currentSegment && currentSegment.type === 'spiral3d') {
            this.camera.rotation = currentSegment.getCameraRotation(player.x);
            this.camera.z = currentSegment.getCameraZ(player.x);
        } else {
            this.camera.rotation *= 0.9; // Smooth return to normal
            this.camera.z *= 0.9;
        }
    }

    renderDebugInfo() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Active Segments: ${this.activeSegments.length}`, 10, 20);
        this.ctx.fillText(`Camera: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}, ${Math.round(this.camera.z)})`, 10, 35);
        this.ctx.fillText(`Camera Rotation: ${Math.round(this.camera.rotation * 180 / Math.PI)}°`, 10, 50);
    }
}

// Base Terrain Segment Class
class TerrainSegment {
    constructor(startX, endX, type = 'flat') {
        this.startX = startX;
        this.endX = endX;
        this.type = type;
        this.color = '#444';
        this.cache = new Map(); // Performance cache
    }

    getHeightAt(x) {
        // Override in subclasses
        return 50;
    }

    getNormalAt(x) {
        // Calculate terrain angle for physics
        const h = 0.1;
        const y1 = this.getHeightAt(x - h);
        const y2 = this.getHeightAt(x + h);
        return Math.atan2(y2 - y1, h * 2);
    }

    render(ctx, camera) {
        // Override in subclasses
    }

    // Check collision with entity
    checkCollision(entity) {
        const terrainY = this.getHeightAt(entity.x + entity.width / 2);
        const entityBottom = entity.y + entity.height;

        if (entity.gravityMultiplier === 1) {
            // Normal gravity
            return entityBottom >= (ctx.canvas.height - terrainY);
        } else {
            // Flipped gravity
            return entity.y <= terrainY;
        }
    }
}

// Flat Terrain (Original)
class FlatTerrain extends TerrainSegment {
    constructor(startX, endX, height = 50) {
        super(startX, endX, 'flat');
        this.height = height;
    }

    getHeightAt(x) {
        return this.height;
    }

    render(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.startX,
            ctx.canvas.height - this.height,
            this.endX - this.startX,
            this.height
        );
    }
}

// Hill Terrain (Linear Slopes)
class HillTerrain extends TerrainSegment {
    constructor(startX, endX, startHeight, endHeight) {
        super(startX, endX, 'hill');
        this.startHeight = startHeight;
        this.endHeight = endHeight;
        this.slope = (endHeight - startHeight) / (endX - startX);
    }

    getHeightAt(x) {
        if (x <= this.startX) return this.startHeight;
        if (x >= this.endX) return this.endHeight;

        const t = (x - this.startX) / (this.endX - this.startX);
        return this.startHeight + (this.endHeight - this.startHeight) * t;
    }

    render(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.startX, ctx.canvas.height);
        ctx.lineTo(this.startX, ctx.canvas.height - this.startHeight);
        ctx.lineTo(this.endX, ctx.canvas.height - this.endHeight);
        ctx.lineTo(this.endX, ctx.canvas.height);
        ctx.closePath();
        ctx.fill();
    }
}

// Curved Terrain (Bézier/Sine Waves)
class CurveTerrain extends TerrainSegment {
    constructor(startX, endX, curveType = 'sine', amplitude = 50, frequency = 0.01, baseHeight = 50) {
        super(startX, endX, 'curve');
        this.curveType = curveType;
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.baseHeight = baseHeight;
        this.phase = 0;
    }

    getHeightAt(x) {
        if (x < this.startX || x > this.endX) return this.baseHeight;

        const relativeX = x - this.startX;

        switch(this.curveType) {
            case 'sine':
                return this.baseHeight + Math.sin(relativeX * this.frequency + this.phase) * this.amplitude;

            case 'cosine':
                return this.baseHeight + Math.cos(relativeX * this.frequency + this.phase) * this.amplitude;

            case 'bezier':
                // Quadratic Bézier curve
                const t = relativeX / (this.endX - this.startX);
                const controlHeight = this.baseHeight + this.amplitude;
                return (1-t)*(1-t)*this.baseHeight + 2*(1-t)*t*controlHeight + t*t*this.baseHeight;

            case 'perlin':
                // Simplified Perlin-like noise
                return this.baseHeight + this.perlinNoise(relativeX * this.frequency) * this.amplitude;

            default:
                return this.baseHeight;
        }
    }

    perlinNoise(x) {
        // Simplified noise function
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const t = x - x0;
        const fade = t * t * (3 - 2 * t);

        const n0 = Math.sin(x0 * 12.9898 + 78.233) * 43758.5453 % 1;
        const n1 = Math.sin(x1 * 12.9898 + 78.233) * 43758.5453 % 1;

        return n0 * (1 - fade) + n1 * fade;
    }

    render(ctx, camera) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.startX, ctx.canvas.height);

        // Draw curve with resolution based on screen pixels
        const step = 2;
        for (let x = this.startX; x <= this.endX; x += step) {
            const height = this.getHeightAt(x);
            ctx.lineTo(x, ctx.canvas.height - height);
        }

        ctx.lineTo(this.endX, ctx.canvas.height);
        ctx.closePath();
        ctx.fill();
    }
}

// 3D Spiral Terrain (The Ultimate Challenge!)
class Spiral3DTerrain extends TerrainSegment {
    constructor(startX, endX, config = {}) {
        super(startX, endX, 'spiral3d');

        // Spiral configuration
        this.centerX = config.centerX || (startX + endX) / 2;
        this.centerY = config.centerY || 250;
        this.centerZ = config.centerZ || 0;
        this.radius = config.radius || 150;
        this.pitch = config.pitch || 100; // Height per rotation
        this.rotations = config.rotations || 2;
        this.startAngle = config.startAngle || 0;
        this.tubeRadius = config.tubeRadius || 30;

        // Visual settings
        this.segments = 64; // Resolution of spiral
        this.color = config.color || '#666';
        this.edgeColor = config.edgeColor || '#888';

        // Precompute spiral points for performance
        this.precomputePoints();
    }

    precomputePoints() {
        this.points3D = [];
        this.points2D = [];

        const totalAngle = this.rotations * Math.PI * 2;
        const angleStep = totalAngle / this.segments;

        for (let i = 0; i <= this.segments; i++) {
            const t = i / this.segments;
            const angle = this.startAngle + t * totalAngle;

            // 3D spiral position
            const point3D = {
                x: this.centerX + Math.cos(angle) * this.radius,
                y: this.centerY + Math.sin(angle) * this.radius,
                z: this.centerZ + (angle / (Math.PI * 2)) * this.pitch,
                angle: angle,
                t: t
            };

            this.points3D.push(point3D);
        }
    }

    // Convert 3D point to 2D screen coordinates
    project3Dto2D(point3D, camera) {
        // Apply camera transformation
        const relZ = point3D.z - camera.z;
        const distance = camera.focalLength;

        // Perspective projection
        const scale = distance / (distance + relZ);

        // Apply camera rotation for dynamic view
        const rotatedX = Math.cos(camera.rotation) * (point3D.x - camera.x) -
                        Math.sin(camera.rotation) * (point3D.y - camera.y);
        const rotatedY = Math.sin(camera.rotation) * (point3D.x - camera.x) +
                        Math.cos(camera.rotation) * (point3D.y - camera.y);

        return {
            x: camera.x + rotatedX * scale,
            y: camera.y + rotatedY * scale,
            scale: scale,
            depth: relZ
        };
    }

    getHeightAt(x) {
        // Map X position to spiral parameter t
        const t = (x - this.startX) / (this.endX - this.startX);
        const angle = this.startAngle + t * this.rotations * Math.PI * 2;

        // Return Y position on spiral
        const spiralY = Math.sin(angle) * this.radius;
        const spiralZ = (angle / (Math.PI * 2)) * this.pitch;

        // Apply perspective for height
        const scale = 300 / (300 + spiralZ);
        return this.centerY - spiralY * scale;
    }

    getNormalAt(x) {
        // Calculate tangent angle on spiral
        const t = (x - this.startX) / (this.endX - this.startX);
        const angle = this.startAngle + t * this.rotations * Math.PI * 2;

        // Derivative of spiral gives tangent
        const dx = -Math.sin(angle) * this.radius;
        const dy = Math.cos(angle) * this.radius;
        const dz = this.pitch / (Math.PI * 2);

        // Return angle for physics
        return Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
    }

    getCameraRotation(x) {
        // Rotate camera as player moves through spiral
        const t = (x - this.startX) / (this.endX - this.startX);
        return t * this.rotations * Math.PI * 2 * 0.3; // Partial rotation for effect
    }

    getCameraZ(x) {
        // Move camera forward/back through spiral
        const t = (x - this.startX) / (this.endX - this.startX);
        const angle = this.startAngle + t * this.rotations * Math.PI * 2;
        return (angle / (Math.PI * 2)) * this.pitch * 0.5;
    }

    render(ctx, camera) {
        // Update 2D projections
        this.points2D = this.points3D.map(p => this.project3Dto2D(p, camera));

        // Sort by depth for proper rendering order
        const sortedIndices = [...Array(this.points2D.length).keys()]
            .sort((a, b) => this.points2D[b].depth - this.points2D[a].depth);

        // Draw spiral tube
        ctx.strokeStyle = this.edgeColor;
        ctx.lineWidth = 2;

        // Draw back half first (farther from camera)
        this.drawSpiralHalf(ctx, sortedIndices.filter(i => this.points2D[i].depth > 0));

        // Draw front half (closer to camera)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        this.drawSpiralHalf(ctx, sortedIndices.filter(i => this.points2D[i].depth <= 0));

        // Draw spiral surface/track
        this.drawSpiralSurface(ctx);
    }

    drawSpiralHalf(ctx, indices) {
        if (indices.length < 2) return;

        ctx.beginPath();
        for (let i = 0; i < indices.length - 1; i++) {
            const idx = indices[i];
            const nextIdx = indices[i + 1];

            if (Math.abs(idx - nextIdx) === 1) {
                const p1 = this.points2D[idx];
                const p2 = this.points2D[nextIdx];

                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
        }
        ctx.stroke();
    }

    drawSpiralSurface(ctx) {
        // Draw the runnable surface of the spiral
        ctx.fillStyle = this.color + '44'; // Semi-transparent

        for (let i = 0; i < this.points2D.length - 1; i++) {
            const p1 = this.points2D[i];
            const p2 = this.points2D[i + 1];

            const width = this.tubeRadius * p1.scale;

            ctx.beginPath();
            ctx.moveTo(p1.x - width, p1.y);
            ctx.lineTo(p1.x + width, p1.y);
            ctx.lineTo(p2.x + width, p2.y);
            ctx.lineTo(p2.x - width, p2.y);
            ctx.closePath();
            ctx.fill();
        }
    }

    checkCollision(entity) {
        // Map entity X to spiral position
        const t = (entity.x - this.startX) / (this.endX - this.startX);
        if (t < 0 || t > 1) return false;

        const angle = this.startAngle + t * this.rotations * Math.PI * 2;

        // Get 3D position on spiral
        const spiralPoint = {
            x: this.centerX + Math.cos(angle) * this.radius,
            y: this.centerY + Math.sin(angle) * this.radius,
            z: this.centerZ + (angle / (Math.PI * 2)) * this.pitch
        };

        // Check if entity is within tube radius
        const dx = entity.x - spiralPoint.x;
        const dy = entity.y - spiralPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.tubeRadius;
    }
}

// Terrain Generator for procedural levels
class TerrainGenerator {
    static generateLevel(length, difficulty = 1) {
        const segments = [];
        let currentX = 0;

        while (currentX < length) {
            const segmentType = this.chooseSegmentType(difficulty);
            const segmentLength = 200 + Math.random() * 400;

            switch(segmentType) {
                case 'flat':
                    segments.push(new FlatTerrain(
                        currentX,
                        currentX + segmentLength,
                        50 + Math.random() * 30
                    ));
                    break;

                case 'hill':
                    segments.push(new HillTerrain(
                        currentX,
                        currentX + segmentLength,
                        50 + Math.random() * 50,
                        50 + Math.random() * 100
                    ));
                    break;

                case 'curve':
                    const curveTypes = ['sine', 'cosine', 'bezier'];
                    segments.push(new CurveTerrain(
                        currentX,
                        currentX + segmentLength,
                        curveTypes[Math.floor(Math.random() * curveTypes.length)],
                        30 + Math.random() * 50 * difficulty,
                        0.005 + Math.random() * 0.01,
                        50 + Math.random() * 20
                    ));
                    break;

                case 'spiral3d':
                    segments.push(new Spiral3DTerrain(
                        currentX,
                        currentX + segmentLength * 2,
                        {
                            radius: 100 + Math.random() * 100,
                            pitch: 50 + Math.random() * 100,
                            rotations: 1 + Math.floor(Math.random() * difficulty * 2),
                            centerY: 200 + Math.random() * 100
                        }
                    ));
                    break;
            }

            currentX += segmentLength;
        }

        return segments;
    }

    static chooseSegmentType(difficulty) {
        const rand = Math.random();

        if (difficulty < 2) {
            // Easy: mostly flat and hills
            if (rand < 0.4) return 'flat';
            if (rand < 0.7) return 'hill';
            if (rand < 0.95) return 'curve';
            return 'spiral3d';
        } else if (difficulty < 4) {
            // Medium: balanced mix
            if (rand < 0.2) return 'flat';
            if (rand < 0.45) return 'hill';
            if (rand < 0.8) return 'curve';
            return 'spiral3d';
        } else {
            // Hard: mostly curves and spirals
            if (rand < 0.1) return 'flat';
            if (rand < 0.25) return 'hill';
            if (rand < 0.6) return 'curve';
            return 'spiral3d';
        }
    }
}

// Make classes available globally for browser
if (typeof window !== 'undefined') {
    window.TerrainSystem = TerrainSystem;
    window.TerrainSegment = TerrainSegment;
    window.FlatTerrain = FlatTerrain;
    window.HillTerrain = HillTerrain;
    window.CurveTerrain = CurveTerrain;
    window.Spiral3DTerrain = Spiral3DTerrain;
    window.TerrainGenerator = TerrainGenerator;
}