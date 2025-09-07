// ================================
// Notification System
// ================================
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 4000; // 4 seconds
        this.init();
    }

    init() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        // Check if container already exists
        if (document.getElementById('notificationContainer')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            z-index: 1000;
            max-width: 400px;
            width: 100%;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = this.defaultDuration) {
        const notification = this.createNotification(message, type);
        this.addNotification(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);

        return notification.id;
    }

    createNotification(message, type) {
        const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const notification = {
            id: id,
            message: message,
            type: type,
            timestamp: new Date(),
            element: null
        };

        const element = document.createElement('div');
        element.id = id;
        element.className = `notification-toast ${type}`;
        element.style.cssText = `
            background: var(--white);
            border-radius: var(--radius-medium);
            padding: 16px 20px;
            margin-bottom: 12px;
            box-shadow: var(--shadow-medium);
            border-left: 4px solid ${this.getTypeColor(type)};
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            cursor: pointer;
        `;

        const content = document.createElement('div');
        content.className = 'toast-content';
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const icon = document.createElement('i');
        icon.className = `fas ${this.getTypeIcon(type)} toast-icon`;
        icon.style.cssText = `
            font-size: 18px;
            color: ${this.getTypeColor(type)};
            flex-shrink: 0;
        `;

        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-message';
        messageSpan.textContent = message;
        messageSpan.style.cssText = `
            font-weight: 500;
            color: var(--text-charcoal);
            flex: 1;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: var(--medium-gray);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
        `;

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(id);
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = 'var(--light-gray)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'transparent';
        });

        // Click to dismiss
        element.addEventListener('click', () => {
            this.removeNotification(id);
        });

        content.appendChild(icon);
        content.appendChild(messageSpan);
        content.appendChild(closeBtn);
        element.appendChild(content);

        notification.element = element;
        return notification;
    }

    addNotification(notification) {
        // Remove oldest if at max capacity
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0].id);
        }

        this.notifications.push(notification);
        
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification.element);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.element.style.transform = 'translateX(0)';
            notification.element.style.opacity = '1';
        });
    }

    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        
        // Animate out
        notification.element.style.transform = 'translateX(100%)';
        notification.element.style.opacity = '0';

        setTimeout(() => {
            if (notification.element && notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.splice(index, 1);
        }, 300);
    }

    removeAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
    }

    getTypeColor(type) {
        switch (type) {
            case 'success': return 'var(--success-green)';
            case 'error': return 'var(--error-red)';
            case 'warning': return 'var(--warning-orange)';
            case 'info': return 'var(--info-blue)';
            default: return 'var(--primary-blue)';
        }
    }

    getTypeIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bell';
        }
    }
}

// ================================
// Global Notification Functions
// ================================
let notificationManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
    
    // Make showNotification globally available
    window.showNotification = (message, type = 'info', duration = 4000) => {
        return notificationManager.show(message, type, duration);
    };

    // Additional convenience functions
    window.showSuccess = (message, duration = 4000) => {
        return notificationManager.show(message, 'success', duration);
    };

    window.showError = (message, duration = 5000) => {
        return notificationManager.show(message, 'error', duration);
    };

    window.showWarning = (message, duration = 4500) => {
        return notificationManager.show(message, 'warning', duration);
    };

    window.showInfo = (message, duration = 4000) => {
        return notificationManager.show(message, 'info', duration);
    };

    window.clearNotifications = () => {
        notificationManager.removeAll();
    };
});

// ================================
// Notification Presets for School App
// ================================
const SchoolNotifications = {
    login: {
        success: () => showSuccess('Welcome to SchoolHub! Login successful.'),
        failed: () => showError('Invalid credentials. Please check your login details.'),
        logout: () => showInfo('You have been logged out successfully.')
    },
    
    assignment: {
        submitted: (title) => showSuccess(`Assignment "${title}" submitted successfully!`),
        saved: (title) => showInfo(`Assignment "${title}" saved as draft.`),
        deadline: (title, days) => showWarning(`Assignment "${title}" is due in ${days} day(s)!`),
        overdue: (title) => showError(`Assignment "${title}" is overdue!`)
    },
    
    grades: {
        updated: (subject, grade) => showSuccess(`New grade for ${subject}: ${grade}`),
        improved: (subject) => showSuccess(`Your grade in ${subject} has improved!`)
    },
    
    attendance: {
        marked: () => showSuccess('Attendance marked successfully.'),
        absent: () => showWarning('You were marked absent for today.'),
        lowAttendance: (percentage) => showWarning(`Your attendance is ${percentage}%. Please improve your attendance.`)
    },
    
    announcements: {
        new: (title) => showInfo(`New announcement: ${title}`),
        important: (title) => showWarning(`Important announcement: ${title}`)
    },
    
    chat: {
        messageSent: () => showSuccess('Message sent successfully.'),
        messageReceived: (from) => showInfo(`New message from ${from}`),
        connectionError: () => showError('Failed to send message. Please check your connection.')
    },
    
    system: {
        saveSuccess: () => showSuccess('Changes saved successfully.'),
        saveError: () => showError('Failed to save changes. Please try again.'),
        loadError: () => showError('Failed to load data. Please refresh the page.'),
        connectionLost: () => showError('Connection lost. Attempting to reconnect...'),
        connectionRestored: () => showSuccess('Connection restored.'),
        maintenance: () => showWarning('System maintenance scheduled. Some features may be temporarily unavailable.')
    },
    
    profile: {
        updated: () => showSuccess('Profile updated successfully.'),
        passwordChanged: () => showSuccess('Password changed successfully.'),
        imageUploaded: () => showSuccess('Profile picture updated.'),
        updateError: () => showError('Failed to update profile. Please try again.')
    }
};

// Make school notifications globally available
window.SchoolNotifications = SchoolNotifications;

// ================================
// Auto-notification Triggers
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // Listen for form submissions
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.classList.contains('auto-notify')) {
            const successMessage = form.dataset.successMessage || 'Form submitted successfully!';
            setTimeout(() => showSuccess(successMessage), 500);
        }
    });

    // Listen for button clicks with notification data
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-notify]');
        if (button) {
            const message = button.dataset.notify;
            const type = button.dataset.notifyType || 'info';
            showNotification(message, type);
        }
    });

    // Welcome notification on first visit
    if (!localStorage.getItem('hasVisited')) {
        setTimeout(() => {
            showInfo('Welcome to SchoolHub! Explore all the features available to you.', 6000);
            localStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
});

// ================================
// Keyboard Shortcuts for Notifications
// ================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + C to clear all notifications
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearNotifications();
        showInfo('All notifications cleared.');
    }
});

// ================================
// Notification Sound (Optional)
// ================================
const NotificationSound = {
    enabled: localStorage.getItem('notificationSound') !== 'false',
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('notificationSound', this.enabled.toString());
        showInfo(`Notification sounds ${this.enabled ? 'enabled' : 'disabled'}.`);
    },
    
    play(type = 'default') {
        if (!this.enabled) return;
        
        try {
            // Create audio context for different notification types
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for different notification types
            const frequencies = {
                success: 800,
                error: 300,
                warning: 600,
                info: 500,
                default: 400
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.default, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Silently fail if audio context is not supported
            console.warn('Audio context not supported:', error);
        }
    }
};

window.NotificationSound = NotificationSound;
