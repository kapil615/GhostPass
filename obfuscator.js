// GhostPass - Deterministic Password Obfuscation Engine

class GhostObfuscator {
    constructor() {
        // Character sets for transformations
        this.codeLanguages = ['js', 'py', 'go', 'rs', 'cpp', 'java', 'php', 'rb', 'swift', 'kt'];
        this.matrixWords = ['matrix', 'ghost', 'cipher', 'code', 'hack', 'neo', 'zion', 'morph'];
        this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.urlSafeSymbols = '-_.~@';
        this.digits = '0123456789';
        this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
        this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    // Simple hash function for deterministic seeding
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Seeded random number generator
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Caesar cipher with variable shift
    caesarShift(str, shift) {
        return str.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                const base = code >= 65 && code <= 90 ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            }
            return char;
        }).join('');
    }

    // Apply uppercase substitutions based on position and hash
    applyUppercaseSubstitutions(str, hash) {
        return str.split('').map((char, index) => {
            const shouldUppercase = (hash + index) % 3 === 0;
            return shouldUppercase ? char.toUpperCase() : char;
        }).join('');
    }

    // Get deterministic language suffix
    getLanguageSuffix(hash) {
        const langIndex = hash % this.codeLanguages.length;
        return this.codeLanguages[langIndex];
    }

    // Get deterministic matrix word
    getMatrixWord(hash) {
        const wordIndex = hash % this.matrixWords.length;
        return this.matrixWords[wordIndex];
    }

    // Insert digit at deterministic position
    insertDigit(str, hash) {
        const digit = this.digits[hash % this.digits.length];
        const position = Math.min(hash % (str.length + 1), str.length);
        return str.slice(0, position) + digit + str.slice(position);
    }

    // Insert symbol at deterministic position
    insertSymbol(str, hash, urlSafe = false) {
        const symbolSet = urlSafe ? this.urlSafeSymbols : this.symbols;
        const symbol = symbolSet[hash % symbolSet.length];
        const position = Math.min((hash * 2) % (str.length + 1), str.length);
        return str.slice(0, position) + symbol + str.slice(position);
    }

    // Insert lowercase characters at intervals
    insertLowercaseChars(str, hash) {
        const interval = 3 + (hash % 3); // Interval between 3-5
        let result = str;
        let insertCount = 0;
        
        for (let i = interval; i < result.length && insertCount < 2; i += interval + insertCount) {
            const char = this.lowercase[(hash + i) % this.lowercase.length];
            result = result.slice(0, i) + char + result.slice(i);
            insertCount++;
        }
        
        return result;
    }

    // Deterministic permutation (simple character swapping)
    deterministicPermutation(str, hash) {
        const chars = str.split('');
        const swapCount = Math.min(2, chars.length - 1);
        
        for (let i = 0; i < swapCount; i++) {
            const pos1 = (hash + i) % chars.length;
            const pos2 = (hash + i + 1) % chars.length;
            [chars[pos1], chars[pos2]] = [chars[pos2], chars[pos1]];
        }
        
        return chars.join('');
    }

    // Sanitize for URL safety
    sanitizeForUrl(str) {
        return str.replace(/[^A-Za-z0-9\-_.~@]/g, '');
    }

    // Main obfuscation function
    obfuscate(input, urlSafe = false) {
        if (!input || input.trim().length === 0) {
            return '';
        }

        // Generate hash from input for deterministic operations
        const hash = this.simpleHash(input);
        let result = input.trim();

        // Step 1: Caesar shift
        const shift = (hash % 25) + 1; // Shift between 1-25
        result = this.caesarShift(result, shift);

        // Step 2: Apply uppercase substitutions
        result = this.applyUppercaseSubstitutions(result, hash);

        // Step 3: Append language suffix
        const langSuffix = this.getLanguageSuffix(hash);
        result += langSuffix;

        // Step 4: Append matrix word with separator
        const matrixWord = this.getMatrixWord(hash * 2);
        result += '-' + matrixWord + '-';

        // Step 5: Insert digit
        result = this.insertDigit(result, hash * 3);

        // Step 6: Insert symbol
        result = this.insertSymbol(result, hash * 4, urlSafe);

        // Step 7: Reverse the string
        result = result.split('').reverse().join('');

        // Step 8: Insert lowercase characters
        result = this.insertLowercaseChars(result, hash * 5);

        // Step 9: Deterministic permutation
        result = this.deterministicPermutation(result, hash * 6);

        // Step 10: Trim to desired length (8-20 characters)
        const targetLength = 8 + (hash % 13); // Length between 8-20
        if (result.length > targetLength) {
            result = result.substring(0, targetLength);
        }

        // Step 11: Add final symbol
        const finalSymbol = urlSafe ? 
            this.urlSafeSymbols[(hash * 7) % this.urlSafeSymbols.length] :
            this.symbols[(hash * 7) % this.symbols.length];
        result += finalSymbol;

        // Step 12: URL sanitization if needed
        if (urlSafe) {
            result = this.sanitizeForUrl(result);
            // Ensure minimum length after sanitization
            while (result.length < 8) {
                result += this.lowercase[result.length % this.lowercase.length];
            }
        }

        return result;
    }

    // Validate input length and characters
    validateInput(input) {
        if (!input) return { valid: false, message: 'Input cannot be empty' };
        if (input.length < 1) return { valid: false, message: 'Input too short' };
        if (input.length > 50) return { valid: false, message: 'Input too long (max 50 characters)' };
        return { valid: true, message: '' };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GhostObfuscator;
} else {
    window.GhostObfuscator = GhostObfuscator;
}