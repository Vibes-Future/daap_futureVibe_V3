/**
 * Secure Logger Module
 * Prevents sensitive information from being logged to the browser console
 * 
 * Automatically redacts:
 * - API keys
 * - Private keys
 * - Secret keys
 * - Seed phrases
 * - Full RPC URLs with API keys
 */

// Environment detection
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Logging configuration
const LOG_CONFIG = {
    // Disable verbose logging in production
    ENABLE_DEBUG: !IS_PRODUCTION,
    ENABLE_INFO: true,
    ENABLE_WARN: true,
    ENABLE_ERROR: true,
    
    // Security: Redact sensitive patterns
    REDACT_PATTERNS: [
        // API keys in URLs
        /api-key=[^&\s]*/gi,
        /apikey=[^&\s]*/gi,
        /key=[^&\s]*/gi,
        
        // Private/secret keys (Base58 format)
        /[1-9A-HJ-NP-Za-km-z]{87,88}/g, // Solana private keys
        
        // Helius/RPC endpoints
        /helius-rpc\.com\/\?[^\s]*/gi,
        
        // Generic secret patterns
        /secret[=:]\s*[^\s]*/gi,
        /private[=:]\s*[^\s]*/gi,
    ]
};

/**
 * Redacts sensitive information from a string
 * @param {string} str - String to redact
 * @returns {string} - Redacted string
 */
function redactSensitive(str) {
    if (typeof str !== 'string') return str;
    
    let redacted = str;
    
    // Apply all redaction patterns
    LOG_CONFIG.REDACT_PATTERNS.forEach(pattern => {
        redacted = redacted.replace(pattern, (match) => {
            if (match.includes('api-key') || match.includes('apikey') || match.includes('key=')) {
                return match.split('=')[0] + '=[REDACTED]';
            }
            return '[REDACTED]';
        });
    });
    
    return redacted;
}

/**
 * Recursively redacts sensitive info from objects
 * @param {any} obj - Object to redact
 * @returns {any} - Redacted object
 */
function redactObject(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return redactSensitive(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => redactObject(item));
    }
    
    if (typeof obj === 'object') {
        const redacted = {};
        for (const key in obj) {
            // Redact keys that might contain sensitive info
            if (/secret|private|key|seed|phrase|password|token/i.test(key)) {
                redacted[key] = '[REDACTED]';
            } else {
                redacted[key] = redactObject(obj[key]);
            }
        }
        return redacted;
    }
    
    return obj;
}

/**
 * Safe logging functions
 */
const SecureLogger = {
    /**
     * Debug logging (disabled in production)
     */
    debug(...args) {
        if (!LOG_CONFIG.ENABLE_DEBUG) return;
        
        const redactedArgs = args.map(arg => redactObject(arg));
        console.log(...redactedArgs);
    },
    
    /**
     * Info logging
     */
    info(...args) {
        if (!LOG_CONFIG.ENABLE_INFO) return;
        
        const redactedArgs = args.map(arg => redactObject(arg));
        console.log(...redactedArgs);
    },
    
    /**
     * Warning logging
     */
    warn(...args) {
        if (!LOG_CONFIG.ENABLE_WARN) return;
        
        const redactedArgs = args.map(arg => redactObject(arg));
        console.warn(...redactedArgs);
    },
    
    /**
     * Error logging (always enabled, but still redacts)
     */
    error(...args) {
        if (!LOG_CONFIG.ENABLE_ERROR) return;
        
        const redactedArgs = args.map(arg => redactObject(arg));
        console.error(...redactedArgs);
    },
    
    /**
     * Logs RPC URL safely (hides API key)
     */
    logRpcUrl(url) {
        if (!url) return;
        
        try {
            const urlObj = new URL(url);
            const safeUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}?api-key=[REDACTED]`;
            this.info('🔗 RPC URL:', safeUrl);
        } catch (error) {
            this.info('🔗 RPC URL: [Invalid URL]');
        }
    },
    
    /**
     * Logs connection info safely
     */
    logConnection(connection) {
        this.info('✅ Solana connection initialized:', {
            endpoint: '[REDACTED for security]',
            commitment: connection?.commitment || 'confirmed'
        });
    },
    
    /**
     * Check if we're in production
     */
    isProduction() {
        return IS_PRODUCTION;
    }
};

// Expose globally
window.SecureLogger = SecureLogger;

// Log initialization
if (IS_PRODUCTION) {
    console.log('🔒 Secure logging enabled (production mode - limited verbosity)');
} else {
    console.log('🔓 Debug logging enabled (development mode)');
}

