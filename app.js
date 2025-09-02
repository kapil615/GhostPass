// GhostPass - Main Application Logic

class GhostPassApp {
    constructor() {
        this.obfuscator = new GhostObfuscator();
        this.matrixRain = null;
        this.elements = {};
        this.isInputVisible = false;
        
        this.init();
    }

    init() {
        this.initElements();
        this.initMatrixRain();
        this.setupEventListeners();
        this.loadSettings();
    }

    initElements() {
        this.elements = {
            inputPhrase: document.getElementById('input-phrase'),
            outputResult: document.getElementById('output-result'),
            outputSection: document.getElementById('output-section'),
            generateBtn: document.getElementById('generate-btn'),
            clearBtn: document.getElementById('clear-btn'),
            copyBtn: document.getElementById('copy-btn'),
            toggleVisibility: document.getElementById('toggle-visibility'),
            matrixToggle: document.getElementById('matrix-toggle'),
            urlSafeToggle: document.getElementById('url-safe-toggle'),
            charCounter: document.getElementById('char-counter'),
            lengthCounter: document.getElementById('length-counter'),
            toast: document.getElementById('toast')
        };
    }

    initMatrixRain() {
        this.matrixRain = new MatrixRain('matrix-rain');
        
        // Update toggle button state
        this.updateMatrixToggleState();
    }

    setupEventListeners() {
        // Input field events
        this.elements.inputPhrase.addEventListener('input', (e) => {
            this.updateCharCounter();
            this.validateInput();
        });

        this.elements.inputPhrase.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateObfuscation();
            }
        });

        // Button events
        this.elements.generateBtn.addEventListener('click', () => {
            this.generateObfuscation();
        });

        this.elements.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        this.elements.copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        this.elements.toggleVisibility.addEventListener('click', () => {
            this.toggleInputVisibility();
        });

        this.elements.matrixToggle.addEventListener('click', () => {
            this.toggleMatrixRain();
        });

        // URL-safe toggle
        this.elements.urlSafeToggle.addEventListener('change', () => {
            this.saveSettings();
            // Regenerate if there's already output
            if (this.elements.outputResult.value) {
                this.generateObfuscation();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.generateObfuscation();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearAll();
                        break;
                    case 'c':
                        if (this.elements.outputResult.value) {
                            e.preventDefault();
                            this.copyToClipboard();
                        }
                        break;
                }
            }
        });
    }

    updateCharCounter() {
        const length = this.elements.inputPhrase.value.length;
        this.elements.charCounter.textContent = `${length}/50`;
        
        // Update counter color based on length
        if (length > 40) {
            this.elements.charCounter.style.color = '#ff4444';
        } else if (length > 30) {
            this.elements.charCounter.style.color = '#ffaa00';
        } else {
            this.elements.charCounter.style.color = '#00ffff';
        }
    }

    validateInput() {
        const input = this.elements.inputPhrase.value;
        const validation = this.obfuscator.validateInput(input);
        
        // Update generate button state
        this.elements.generateBtn.disabled = !validation.valid;
        
        return validation;
    }

    generateObfuscation() {
        const input = this.elements.inputPhrase.value;
        const validation = this.validateInput();
        
        if (!validation.valid) {
            this.showToast(validation.message, 'error');
            return;
        }

        try {
            const urlSafe = this.elements.urlSafeToggle.checked;
            const result = this.obfuscator.obfuscate(input, urlSafe);
            
            this.elements.outputResult.value = result;
            this.elements.lengthCounter.textContent = `Length: ${result.length}`;
            
            // Show output section with animation
            this.elements.outputSection.style.display = 'block';
            
            this.showToast('Obfuscation generated successfully!', 'success');
        } catch (error) {
            console.error('Obfuscation error:', error);
            this.showToast('Error generating obfuscation', 'error');
        }
    }

    clearAll() {
        this.elements.inputPhrase.value = '';
        this.elements.outputResult.value = '';
        this.elements.outputSection.style.display = 'none';
        this.updateCharCounter();
        this.elements.inputPhrase.focus();
        this.showToast('Cleared all fields', 'info');
    }

    async copyToClipboard() {
        const text = this.elements.outputResult.value;
        
        if (!text) {
            this.showToast('Nothing to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            
            // Visual feedback on copy button
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '✓';
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
            }, 1000);
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    toggleInputVisibility() {
        this.isInputVisible = !this.isInputVisible;
        
        if (this.isInputVisible) {
            this.elements.inputPhrase.type = 'text';
            this.elements.toggleVisibility.textContent = '🔓';
            this.elements.toggleVisibility.title = 'Hide input (Lock)';
            this.elements.toggleVisibility.setAttribute('aria-label', 'Hide input text');
        } else {
            this.elements.inputPhrase.type = 'password';
            this.elements.toggleVisibility.textContent = '🔒';
            this.elements.toggleVisibility.title = 'Show input (Unlock)';
            this.elements.toggleVisibility.setAttribute('aria-label', 'Show input text');
        }
        
        // Add visual feedback
        this.elements.toggleVisibility.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.elements.toggleVisibility.style.transform = 'scale(1)';
        }, 150);
    }

    toggleMatrixRain() {
        if (this.matrixRain) {
            const isActive = this.matrixRain.toggle();
            this.updateMatrixToggleState();
            this.saveSettings();
            
            const message = isActive ? 'Matrix rain enabled' : 'Matrix rain disabled';
            this.showToast(message, 'info');
        }
    }

    updateMatrixToggleState() {
        if (this.matrixRain && this.elements.matrixToggle) {
            const isActive = this.matrixRain.isActive();
            this.elements.matrixToggle.style.opacity = isActive ? '1' : '0.6';
            this.elements.matrixToggle.title = isActive ? 'Disable Matrix Rain' : 'Enable Matrix Rain';
        }
    }

    showToast(message, type = 'info') {
        this.elements.toast.textContent = message;
        this.elements.toast.className = `toast ${type}`;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    saveSettings() {
        const settings = {
            urlSafe: this.elements.urlSafeToggle.checked,
            matrixRain: this.matrixRain ? this.matrixRain.isActive() : true
        };
        
        localStorage.setItem('ghostpass-settings', JSON.stringify(settings));
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('ghostpass-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                // Apply URL-safe setting
                if (settings.urlSafe !== undefined) {
                    this.elements.urlSafeToggle.checked = settings.urlSafe;
                }
                
                // Apply matrix rain setting
                if (settings.matrixRain !== undefined && this.matrixRain) {
                    if (settings.matrixRain && !this.matrixRain.isActive()) {
                        this.matrixRain.start();
                    } else if (!settings.matrixRain && this.matrixRain.isActive()) {
                        this.matrixRain.stop();
                    }
                    this.updateMatrixToggleState();
                }
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ghostPassApp = new GhostPassApp();
});

// Handle page visibility changes to optimize performance
document.addEventListener('visibilitychange', () => {
    if (window.ghostPassApp && window.ghostPassApp.matrixRain) {
        if (document.hidden) {
            window.ghostPassApp.matrixRain.stop();
        } else {
            const settings = JSON.parse(localStorage.getItem('ghostpass-settings') || '{}');
            if (settings.matrixRain !== false) {
                window.ghostPassApp.matrixRain.start();
            }
        }
    }
});