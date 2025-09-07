// ================================
// Authentication & Session Management
// ================================
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupSessionHandling();
    }

    // ================================
    // Session Management
    // ================================
    checkExistingSession() {
        const sessionData = localStorage.getItem('schoolHub_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = new Date().getTime();
                
                // Check if session is still valid
                if (session.expiresAt > now) {
                    this.currentUser = session.user;
                    this.startSessionTimer();
                    return true;
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.error('Error parsing session data:', error);
                this.clearSession();
            }
        }
        return false;
    }

    saveSession(user) {
        const now = new Date().getTime();
        const session = {
            user: user,
            createdAt: now,
            expiresAt: now + this.sessionTimeout,
            lastActivity: now
        };
        
        localStorage.setItem('schoolHub_session', JSON.stringify(session));
        this.currentUser = user;
        this.startSessionTimer();
    }

    updateActivity() {
        const sessionData = localStorage.getItem('schoolHub_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                session.lastActivity = new Date().getTime();
                session.expiresAt = session.lastActivity + this.sessionTimeout;
                localStorage.setItem('schoolHub_session', JSON.stringify(session));
            } catch (error) {
                console.error('Error updating session activity:', error);
            }
        }
    }

    clearSession() {
        localStorage.removeItem('schoolHub_session');
        this.currentUser = null;
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
    }

    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.handleSessionExpiry();
        }, this.sessionTimeout);
    }

    handleSessionExpiry() {
        this.clearSession();
        if (window.schoolApp) {
            window.schoolApp.logout();
            showWarning('Your session has expired. Please log in again.');
        }
    }

    setupSessionHandling() {
        // Update activity on user interactions
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.updateActivity();
                }
            }, { passive: true, capture: true });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentUser) {
                this.updateActivity();
            }
        });
    }

    // ================================
    // Authentication Methods
    // ================================
    login(credentials, userData) {
        // In a real app, this would make an API call
        if (this.validateCredentials(credentials, userData)) {
            const user = { ...userData, type: credentials.userType };
            this.saveSession(user);
            this.logSecurityEvent('login_success', user.id);
            return { success: true, user: user };
        } else {
            this.logSecurityEvent('login_failed', credentials.loginId);
            return { success: false, error: 'Invalid credentials' };
        }
    }

    logout() {
        if (this.currentUser) {
            this.logSecurityEvent('logout', this.currentUser.id);
        }
        this.clearSession();
    }

    validateCredentials(credentials, userData) {
        return (
            (userData.id === credentials.loginId || userData.email === credentials.loginId) &&
            userData.password === credentials.password
        );
    }

    // ================================
    // Security & Audit Logging
    // ================================
    logSecurityEvent(event, userId, additionalData = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            userId: userId,
            userAgent: navigator.userAgent,
            ip: 'client-side', // In real app, this would come from server
            ...additionalData
        };

        // Store in localStorage for demo (in real app, send to server)
        const logs = JSON.parse(localStorage.getItem('schoolHub_security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 entries
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('schoolHub_security_logs', JSON.stringify(logs));
    }

    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('schoolHub_security_logs') || '[]');
    }

    // ================================
    // Password Utilities
    // ================================
    static hashPassword(password) {
        // Simple hash for demo purposes - use proper hashing in production
        return btoa(password + 'schoolhub_salt').replace(/[^a-zA-Z0-9]/g, '');
    }

    static validatePasswordStrength(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(requirements).filter(Boolean).length;
        
        return {
            score: score,
            requirements: requirements,
            strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
            isValid: score >= 3
        };
    }

    // ================================
    // Permission Management
    // ================================
    hasPermission(permission) {
        if (!this.currentUser) return false;

        const permissions = this.getUserPermissions(this.currentUser);
        return permissions.includes(permission) || permissions.includes('admin');
    }

    getUserPermissions(user) {
        const basePermissions = ['view_profile', 'edit_own_profile'];
        
        if (user.type === 'student') {
            return [
                ...basePermissions,
                'view_timetable',
                'view_assignments',
                'submit_assignments',
                'view_grades',
                'view_attendance',
                'view_announcements',
                'chat_with_teachers'
            ];
        } else if (user.type === 'teacher') {
            return [
                ...basePermissions,
                'view_timetable',
                'edit_timetable',
                'create_assignments',
                'grade_assignments',
                'mark_attendance',
                'view_student_info',
                'create_announcements',
                'chat_with_students',
                'view_class_analytics'
            ];
        }
        
        return basePermissions;
    }

    // ================================
    // Two-Factor Authentication (Demo)
    // ================================
    enableTwoFactor() {
        if (!this.currentUser) return false;
        
        // Generate a demo TOTP secret
        const secret = this.generateTOTPSecret();
        
        // In real app, save to user profile on server
        const userData = { ...this.currentUser, twoFactorEnabled: true, totpSecret: secret };
        this.saveSession(userData);
        
        showSuccess('Two-factor authentication enabled successfully!');
        return secret;
    }

    disableTwoFactor() {
        if (!this.currentUser) return false;
        
        const userData = { ...this.currentUser };
        delete userData.twoFactorEnabled;
        delete userData.totpSecret;
        
        this.saveSession(userData);
        showInfo('Two-factor authentication disabled.');
        return true;
    }

    generateTOTPSecret() {
        // Simple demo secret generation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }

    // ================================
    // Account Recovery
    // ================================
    requestPasswordReset(email) {
        // Demo implementation
        console.log(`Password reset requested for: ${email}`);
        
        // In real app, send email with reset token
        const resetToken = this.generateResetToken();
        
        // Store token temporarily (demo only)
        localStorage.setItem('demo_reset_token', JSON.stringify({
            email: email,
            token: resetToken,
            expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
        }));
        
        showInfo('Password reset email sent! Check your inbox.');
        return resetToken;
    }

    resetPassword(token, newPassword) {
        const resetData = localStorage.getItem('demo_reset_token');
        if (!resetData) {
            return { success: false, error: 'Invalid or expired reset token' };
        }
        
        try {
            const data = JSON.parse(resetData);
            if (data.token === token && data.expiresAt > Date.now()) {
                // In real app, update password on server
                console.log(`Password reset for ${data.email} with new password`);
                localStorage.removeItem('demo_reset_token');
                
                showSuccess('Password reset successfully! You can now log in with your new password.');
                return { success: true };
            } else {
                return { success: false, error: 'Invalid or expired reset token' };
            }
        } catch (error) {
            return { success: false, error: 'Error processing reset request' };
        }
    }

    generateResetToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}

// ================================
// Demo Data Manager
// ================================
class DemoDataManager {
    constructor() {
        this.initializeDemoData();
    }

    initializeDemoData() {
        // Check if demo data already exists
        if (!localStorage.getItem('schoolHub_demo_initialized')) {
            this.createDemoData();
            localStorage.setItem('schoolHub_demo_initialized', 'true');
        }
    }

    createDemoData() {
        // Create demo users with hashed passwords
        const demoUsers = {
            students: [
                {
                    id: 'STU001',
                    name: 'Alex Johnson',
                    email: 'alex.johnson@school.edu',
                    password: 'student123', // In real app, this would be hashed
                    grade: '10',
                    class: '10A',
                    avatar: null,
                    phone: '+1234567890',
                    address: '123 Student St, City, State',
                    parentContact: 'parent@email.com',
                    enrollmentDate: '2023-09-01',
                    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'History']
                },
                {
                    id: 'STU002',
                    name: 'Emma Wilson',
                    email: 'emma.wilson@school.edu',
                    password: 'student123',
                    grade: '11',
                    class: '11B',
                    avatar: null,
                    phone: '+1234567891',
                    address: '456 Scholar Ave, City, State',
                    parentContact: 'emma.parent@email.com',
                    enrollmentDate: '2022-09-01',
                    subjects: ['Mathematics', 'Biology', 'Chemistry', 'English', 'History']
                }
            ],
            teachers: [
                {
                    id: 'TEACH001',
                    name: 'Dr. Sarah Wilson',
                    email: 'sarah.wilson@school.edu',
                    password: 'teacher123',
                    subjects: ['Mathematics', 'Physics'],
                    classes: ['10A', '10B', '11A'],
                    department: 'Science',
                    qualification: 'Ph.D. in Mathematics',
                    experience: '8 years',
                    phone: '+1234567892',
                    office: 'Room 301'
                },
                {
                    id: 'TEACH002',
                    name: 'Prof. Michael Chen',
                    email: 'michael.chen@school.edu',
                    password: 'teacher123',
                    subjects: ['Chemistry', 'Biology'],
                    classes: ['10A', '11B', '12A'],
                    department: 'Science',
                    qualification: 'M.S. in Chemistry',
                    experience: '12 years',
                    phone: '+1234567893',
                    office: 'Room 205'
                }
            ]
        };

        localStorage.setItem('schoolHub_demo_users', JSON.stringify(demoUsers));
    }

    getDemoUsers() {
        return JSON.parse(localStorage.getItem('schoolHub_demo_users') || '{"students":[],"teachers":[]}');
    }

    updateUser(userId, userData) {
        const users = this.getDemoUsers();
        
        // Find and update user
        let updated = false;
        ['students', 'teachers'].forEach(userType => {
            const index = users[userType].findIndex(user => user.id === userId);
            if (index !== -1) {
                users[userType][index] = { ...users[userType][index], ...userData };
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('schoolHub_demo_users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    resetDemoData() {
        localStorage.removeItem('schoolHub_demo_initialized');
        localStorage.removeItem('schoolHub_demo_users');
        localStorage.removeItem('schoolHub_session');
        localStorage.removeItem('schoolHub_security_logs');
        this.initializeDemoData();
        showInfo('Demo data has been reset to defaults.');
    }
}

// ================================
// Initialize Auth System
// ================================
let authManager;
let demoDataManager;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    demoDataManager = new DemoDataManager();
    
    // Make globally available
    window.authManager = authManager;
    window.demoDataManager = demoDataManager;
});

// ================================
// Demo Credentials Helper
// ================================
function showDemoCredentials() {
    const credentialsModal = document.createElement('div');
    credentialsModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;

    credentialsModal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
            <h2 style="margin-bottom: 20px; color: #4FADF7;">Demo Credentials</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2E2E2E; margin-bottom: 10px;">Student Account:</h3>
                <p><strong>ID:</strong> STU001</p>
                <p><strong>Email:</strong> alex.johnson@school.edu</p>
                <p><strong>Password:</strong> student123</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2E2E2E; margin-bottom: 10px;">Teacher Account:</h3>
                <p><strong>ID:</strong> TEACH001</p>
                <p><strong>Email:</strong> sarah.wilson@school.edu</p>
                <p><strong>Password:</strong> teacher123</p>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #4FADF7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(credentialsModal);
}

// Add demo credentials button to login screen
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            const demoButton = document.createElement('button');
            demoButton.type = 'button';
            demoButton.textContent = 'View Demo Credentials';
            demoButton.style.cssText = `
                width: 100%;
                padding: 10px;
                background: #E3D5FF;
                color: #2E2E2E;
                border: none;
                border-radius: 6px;
                margin-top: 15px;
                cursor: pointer;
                font-size: 14px;
            `;
            demoButton.onclick = showDemoCredentials;
            loginCard.appendChild(demoButton);
        }
    }, 1000);
});
