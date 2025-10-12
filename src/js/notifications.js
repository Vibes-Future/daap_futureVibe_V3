/**
 * VIBES DeFi - Notification System
 * Professional toast notification system with multiple types and animations
 * 
 * @author VIBES DeFi Team
 * @version 1.0.0
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5; // Maximum notifications shown at once
        this.defaultDuration = 5000; // 5 seconds default
        this.init();
    }

    /**
     * Initialize the notification container
     */
    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    /**
     * Show a notification
     * @param {string} message - The notification message
     * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     * @param {object} options - Additional options
     */
    show(message, type = 'info', duration = this.defaultDuration, options = {}) {
        // Remove oldest notification if we've reached the limit
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0]);
        }

        // Create notification element
        const notification = this.createNotification(message, type, options);
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove after duration (unless duration is 0)
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        // Play sound if enabled
        if (options.playSound) {
            this.playNotificationSound(type);
        }

        return notification;
    }

    /**
     * Create a notification element
     * @param {string} message - The notification message
     * @param {string} type - Type of notification
     * @param {object} options - Additional options
     * @returns {HTMLElement}
     */
    createNotification(message, type, options) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        // Get icon based on type
        const icon = this.getIcon(type);

        // Create title if provided
        const title = options.title || this.getDefaultTitle(type);

        // Build notification HTML
        notification.innerHTML = `
            <div class="notification-icon">
                ${icon}
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
                ${options.action ? `<button class="notification-action">${options.action}</button>` : ''}
            </div>
            <button class="notification-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        // Add close button listener
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));

        // Add action button listener if provided
        if (options.action && options.onAction) {
            const actionBtn = notification.querySelector('.notification-action');
            actionBtn.addEventListener('click', () => {
                options.onAction();
                this.remove(notification);
            });
        }

        return notification;
    }

    /**
     * Remove a notification
     * @param {HTMLElement} notification - The notification element to remove
     */
    remove(notification) {
        if (!notification || !notification.parentElement) return;

        // Add hide animation
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Remove from array
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Get icon SVG based on notification type
     * @param {string} type - Notification type
     * @returns {string} SVG icon
     */
    getIcon(type) {
        const icons = {
            success: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            error: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            warning: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 20H22L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            info: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            transaction: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `
        };

        return icons[type] || icons.info;
    }

    /**
     * Get default title based on notification type
     * @param {string} type - Notification type
     * @returns {string}
     */
    getDefaultTitle(type) {
        const titles = {
            success: '✅ Success',
            error: '❌ Error',
            warning: '⚠️ Warning',
            info: 'ℹ️ Information',
            transaction: '💎 Transaction'
        };

        return titles[type] || 'Notification';
    }

    /**
     * Play notification sound (optional feature)
     * @param {string} type - Notification type
     */
    playNotificationSound(type) {
        // Simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different types
            const frequencies = {
                success: 800,
                error: 400,
                warning: 600,
                info: 700
            };

            oscillator.frequency.value = frequencies[type] || 700;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    /**
     * Helper method for success notifications
     */
    success(message, options = {}) {
        return this.show(message, 'success', options.duration || this.defaultDuration, options);
    }

    /**
     * Helper method for error notifications
     */
    error(message, options = {}) {
        return this.show(message, 'error', options.duration || 7000, options); // Longer duration for errors
    }

    /**
     * Helper method for warning notifications
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options.duration || this.defaultDuration, options);
    }

    /**
     * Helper method for info notifications
     */
    info(message, options = {}) {
        return this.show(message, 'info', options.duration || this.defaultDuration, options);
    }

    /**
     * Helper method for transaction notifications with link
     */
    transaction(message, signature, options = {}) {
        const explorerUrl = `https://explorer.solana.com/tx/${signature}${NETWORK_CONFIG.NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet'}`;
        
        return this.show(message, 'transaction', 0, {
            ...options,
            action: 'View on Explorer',
            onAction: () => {
                window.open(explorerUrl, '_blank');
            }
        });
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }
}

// Create global instance
window.NotificationSystem = NotificationSystem;

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notifications = new NotificationSystem();
    });
} else {
    window.notifications = new NotificationSystem();
}

