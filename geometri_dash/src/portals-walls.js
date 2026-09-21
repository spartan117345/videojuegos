// Helper function to draw labels with lines (ULTRA FLOATY VERSION!)
function drawLabel(x, y, text, color) {
    ctx.save();

    // Floating animation
    const floatOffset = Math.sin(Date.now() / 300) * 8;

    // BIGGER label
    ctx.font = 'bold 16px Courier New';
    const labelWidth = ctx.measureText(text).width + 30;
    const labelHeight = 28;
    const labelX = x - labelWidth / 2;
    const labelY = y - 70 + floatOffset;

    // Glowing line from object to label
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.setLineDash([8, 4]);
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, labelY + labelHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Label box with glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Inner glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.roundRect(labelX + 3, labelY + 3, labelWidth - 6, labelHeight - 6, 5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Label text with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, labelY + labelHeight / 2);

    ctx.restore();
}

// Portal Class - Gravity flip portals
class Portal {
    constructor(x) {
        this.x = x;
        this.width = 60;
        this.height = canvas.height - CONFIG.groundHeight;
        this.y = 0;
        this.color = 0;
        this.rotation = 0;
        this.particles = [];
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.color = (this.color + 3) % 360;
        this.rotation += 2;

        // Create portal particles
        if (Math.random() > 0.7) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 40,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 3 + 1
            });
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }

    draw() {
        ctx.save();

        // Portal frame
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, this.height);
        gradient.addColorStop(0, `hsl(${this.color}, 100%, 50%)`);
        gradient.addColorStop(0.5, `hsl(${this.color + 60}, 100%, 60%)`);
        gradient.addColorStop(1, `hsl(${this.color}, 100%, 50%)`);

        ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowBlur = 30;

        // Left portal edge
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, 8, this.height);
        ctx.fillRect(this.x + this.width - 8, this.y, 8, this.height);

        // Portal swirl effect
        ctx.translate(this.x + this.width / 2, this.height / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);

        for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = (5 - i) / 5 * 0.3;
            ctx.fillStyle = `hsl(${this.color + i * 20}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(0, 0, 20 + i * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.restore();

        // Draw portal particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = `hsl(${this.color}, 100%, 70%)`;
            ctx.shadowColor = `hsl(${this.color}, 100%, 70%)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Portal center icon
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.height / 2);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌀', 0, 0);
        ctx.restore();

        // Draw label
        drawLabel(this.x + this.width / 2, this.y + this.height / 2, 'GRAVITY FLIP', `hsl(${this.color}, 100%, 70%)`);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

// Wall Class - Vertical obstacles
class Wall {
    constructor(x) {
        this.x = x;
        this.width = 20;
        this.height = Math.random() * 60 + 80; // 80-140 height
        this.y = canvas.height - CONFIG.groundHeight - this.height;
        this.color = Math.random() * 360;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.color = (this.color + 1) % 360;
    }

    draw() {
        ctx.save();

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, `hsl(${this.color}, 100%, 60%)`);
        gradient.addColorStop(0.5, `hsl(${this.color + 30}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${this.color}, 100%, 40%)`);

        ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowBlur = 15;

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < this.height; i += 15) {
            ctx.fillRect(this.x, this.y + i, this.width, 7);
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        return (
            player.x < this.x + this.width - 3 &&
            player.x + player.width > this.x + 3 &&
            player.y < this.y + this.height - 3 &&
            player.y + player.height > this.y + 3
        );
    }
}

// Ceiling Obstacle Class
class CeilingObstacle {
    constructor(x) {
        this.x = x;
        this.width = 30;
        this.height = 40;
        this.y = 0;
        this.color = Math.random() * 360;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.color = (this.color + 1) % 360;
    }

    draw() {
        ctx.save();

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, `hsl(${this.color}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${this.color + 60}, 100%, 30%)`);

        ctx.shadowColor = `hsl(${this.color}, 100%, 50%)`;
        ctx.shadowBlur = 15;

        // Ceiling spike (upside-down triangle)
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(player) {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

// Platform Class - Different height levels
class Platform {
    constructor(x, height) {
        this.x = x;
        this.width = 100;
        this.height = height;
        this.y = canvas.height - this.height;
        this.color = Math.random() * 360;
    }

    update() {
        this.x -= CONFIG.obstacleSpeed * gameState.gameSpeed;
        this.color = (this.color + 0.5) % 360;
    }

    draw() {
        ctx.save();

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, `hsl(${this.color}, 70%, 40%)`);
        gradient.addColorStop(1, `hsl(${this.color + 30}, 70%, 30%)`);

        ctx.shadowColor = `hsl(${this.color}, 70%, 40%)`;
        ctx.shadowBlur = 10;

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Top edge highlight
        ctx.fillStyle = `hsl(${this.color}, 80%, 60%)`;
        ctx.fillRect(this.x, this.y, this.width, 5);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    // Check if player is on this platform
    isPlayerOn(player) {
        if (player.gravityMultiplier === 1) {
            // Normal gravity
            return (
                player.x + player.width > this.x &&
                player.x < this.x + this.width &&
                player.y + player.height >= this.y - 5 &&
                player.y + player.height <= this.y + 10
            );
        } else {
            // Flipped gravity - platforms don't apply
            return false;
        }
    }
}
