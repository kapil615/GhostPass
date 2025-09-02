// Matrix Rain Animation for GhostPass

class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        this.drops = [];
        this.fontSize = 14;
        this.columns = 0;
        
        // Matrix characters (including Japanese katakana)
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.resizeCanvas();
        this.initDrops();
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            this.start();
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.initDrops();
    }

    initDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100; // Start drops at random heights above screen
        }
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Handle reduced motion changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                this.stop();
            }
        });
    }

    draw() {
        // Create trailing effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set text properties
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;

        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            // Get random character
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            
            // Calculate position
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            // Create glow effect for some characters
            if (Math.random() > 0.98) {
                this.ctx.shadowColor = '#00ff41';
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.shadowBlur = 0;
            }

            // Draw character
            this.ctx.fillText(char, x, y);

            // Reset drop if it goes off screen or randomly
            if (y > this.canvas.height || Math.random() > 0.99) {
                this.drops[i] = 0;
            }

            // Move drop down
            this.drops[i]++;
        }
    }

    animate() {
        if (!this.isRunning) return;
        
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
        return this.isRunning;
    }

    isActive() {
        return this.isRunning;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatrixRain;
} else {
    window.MatrixRain = MatrixRain;
}