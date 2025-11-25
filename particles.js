// Particle animation with state persistence
const ParticleSystem = (function() {
    let canvas, ctx;
    let particles = [];
    let mouse = {
        x: undefined,
        y: undefined,
        radius: 100,
        isPressed: false // Track if left mouse button is held
    };
    const maxParticles = 5000;
    const connectionDistance = 150;
    const STATE_KEY = 'particleState';

    // Particle class with enhanced features
    class Particle {
        constructor(x, y, vx = null, vy = null) {
            this.x = x;
            this.y = y;
            this.vx = vx !== null ? vx : (Math.random() - 0.5) * 2;
            this.vy = vy !== null ? vy : (Math.random() - 0.5) * 2;
            this.radius = Math.random() * 2 + 1;

            const colorVariant = Math.random();
            if (colorVariant < 0.6) {
                this.color = `rgba(74, 158, 255, ${Math.random() * 0.5 + 0.5})`;
            } else if (colorVariant < 0.85) {
                this.color = `rgba(107, 182, 255, ${Math.random() * 0.5 + 0.5})`;
            } else {
                this.color = `rgba(138, 196, 255, ${Math.random() * 0.4 + 0.4})`;
            }

            this.mass = this.radius;
            this.opacity = Math.random() * 0.5 + 0.5;
        }

        update() {
            this.vy += 0.1;

            this.x += this.vx;
            this.y += this.vy;

            this.vx *= 0.99;
            this.vy *= 0.99;

            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -0.85;
            } else if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -0.85;
            }

            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -0.75;
            } else if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -0.95;
                // Ground friction
                this.vx *= 0.7;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        applyForce(fx, fy) {
            this.vx += fx / this.mass;
            this.vy += fy / this.mass;
        }

        toJSON() {
            return {
                x: this.x,
                y: this.y,
                vx: this.vx,
                vy: this.vy
            };
        }

        static fromJSON(data, canvasWidth, canvasHeight) {
            const x = data.x;
            const y = data.y;
            return new Particle(x, y, data.vx, data.vy);
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(74, 158, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function saveState() {
        try {
            const state = {
                particles: particles.slice(0, 200).map(p => p.toJSON()), // Save max 200 particles
                timestamp: Date.now(),
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            };
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save particle state:', e);
        }
    }

    let saveInterval;
    function startAutoSave() {
        saveInterval = setInterval(saveState, 1000);
    }

    function loadState() {
        try {
            const stored = localStorage.getItem(STATE_KEY);
            if (!stored) return false;

            const state = JSON.parse(stored);

            // Only load if state is recent (within 5 minutes)
            if (Date.now() - state.timestamp > 5 * 60 * 1000) {
                localStorage.removeItem(STATE_KEY);
                return false;
            }

            particles = state.particles.map(p =>
                Particle.fromJSON(p, canvas.width, canvas.height)
            );

            return true;
        } catch (e) {
            console.warn('Failed to load particle state:', e);
            localStorage.removeItem(STATE_KEY);
            return false;
        }
    }

    function initParticles() {
        if (!loadState()) {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(
                    Math.random() * canvas.width,
                    Math.random() * -200
                ));
            }
        }
    }

    function setupMouseEvents() {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Left mouse button hold to release particles
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                mouse.isPressed = true;
                canvas.style.cursor = 'grab';
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) { // Left mouse button
                mouse.isPressed = false;
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            for (let i = 0; i < 20; i++) {
                if (particles.length < maxParticles) {
                    const angle = (Math.PI * 2 * i) / 50;
                    const speed = Math.random() * 2 + 1;
                    const particle = new Particle(
                        e.clientX + (Math.random() - 0.5) * 20,
                        e.clientY + (Math.random() - 0.5) * 20
                    );
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                    particles.push(particle);
                }
            }
        });

        window.addEventListener('beforeunload', saveState);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveState();
            }
        });
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(particle => {
            // Mouse attraction/repulsion (only when not pressed)
            if (mouse.x !== undefined && mouse.y !== undefined && !mouse.isPressed) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);

                    // Repulsion with enhanced effect
                    particle.applyForce(
                        Math.cos(angle) * force * -100,
                        Math.sin(angle) * force * -100
                    );
                }
            }

            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    // Public initialization function
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        ctx = canvas.getContext('2d');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        initParticles();
        setupMouseEvents();
        startAutoSave();
        animate();
    }


    return {
        init: init
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ParticleSystem.init('particle-canvas');
    });
} else {
    ParticleSystem.init('particle-canvas');
}
