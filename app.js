// ================================
// App State Management
// ================================
class SchoolApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.sampleData = this.initializeSampleData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.loadLoginScreen();
    }

    // ================================
    // Sample Data Initialization
    // ================================
    initializeSampleData() {
        return {
            students: [
                {
                    id: 'STU001',
                    name: 'Alex Johnson',
                    email: 'alex.johnson@school.edu',
                    password: 'student123',
                    grade: '10',
                    class: '10A',
                    attendance: 92,
                    grades: [
                        { subject: 'Mathematics', grade: 'A-', score: 88 },
                        { subject: 'Physics', grade: 'B+', score: 82 },
                        { subject: 'Chemistry', grade: 'A', score: 95 },
                        { subject: 'English', grade: 'B', score: 78 }
                    ],
                    assignments: [
                        {
                            id: 1,
                            title: 'Calculus Problems Set 1',
                            subject: 'Mathematics',
                            dueDate: '2024-07-15',
                            status: 'pending',
                            description: 'Complete problems 1-20 from Chapter 5'
                        },
                        {
                            id: 2,
                            title: 'Physics Lab Report',
                            subject: 'Physics',
                            dueDate: '2024-07-12',
                            status: 'submitted',
                            description: 'Write a report on the pendulum experiment'
                        }
                    ]
                }
            ],
            teachers: [
                {
                    id: 'TEACH001',
                    name: 'Dr. Sarah Wilson',
                    email: 'sarah.wilson@school.edu',
                    password: 'teacher123',
                    subjects: ['Mathematics', 'Physics'],
                    classes: ['10A', '10B', '11A']
                }
            ],
            timetable: {
                STU001: {
                    Monday: [
                        { time: '9:00-10:00', subject: 'Mathematics', teacher: 'Dr. Wilson', room: 'Room 101' },
                        { time: '10:00-11:00', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 1' },
                        { time: '11:00-12:00', subject: 'Chemistry', teacher: 'Prof. Brown', room: 'Lab 2' },
                        { time: '1:00-2:00', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' }
                    ],
                    Tuesday: [
                        { time: '9:00-10:00', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' },
                        { time: '10:00-11:00', subject: 'Mathematics', teacher: 'Dr. Wilson', room: 'Room 101' },
                        { time: '11:00-12:00', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 1' },
                        { time: '1:00-2:00', subject: 'History', teacher: 'Mr. Johnson', room: 'Room 301' }
                    ],
                    Wednesday: [
                        { time: '9:00-10:00', subject: 'Chemistry', teacher: 'Prof. Brown', room: 'Lab 2' },
                        { time: '10:00-11:00', subject: 'Mathematics', teacher: 'Dr. Wilson', room: 'Room 101' },
                        { time: '11:00-12:00', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' },
                        { time: '1:00-2:00', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 1' }
                    ],
                    Thursday: [
                        { time: '9:00-10:00', subject: 'History', teacher: 'Mr. Johnson', room: 'Room 301' },
                        { time: '10:00-11:00', subject: 'Chemistry', teacher: 'Prof. Brown', room: 'Lab 2' },
                        { time: '11:00-12:00', subject: 'Mathematics', teacher: 'Dr. Wilson', room: 'Room 101' },
                        { time: '1:00-2:00', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' }
                    ],
                    Friday: [
                        { time: '9:00-10:00', subject: 'Physics', teacher: 'Dr. Smith', room: 'Lab 1' },
                        { time: '10:00-11:00', subject: 'English', teacher: 'Ms. Davis', room: 'Room 205' },
                        { time: '11:00-12:00', subject: 'Chemistry', teacher: 'Prof. Brown', room: 'Lab 2' },
                        { time: '1:00-2:00', subject: 'Mathematics', teacher: 'Dr. Wilson', room: 'Room 101' }
                    ]
                }
            },
            announcements: [
                {
                    id: 1,
                    title: 'Parent-Teacher Meeting',
                    content: 'Parent-teacher meetings are scheduled for next week. Please check the schedule.',
                    date: '2024-07-08',
                    type: 'important',
                    author: 'Principal Office'
                },
                {
                    id: 2,
                    title: 'Science Fair 2024',
                    content: 'Registration for the annual science fair is now open. Submit your projects by July 20th.',
                    date: '2024-07-05',
                    type: 'event',
                    author: 'Science Department'
                },
                {
                    id: 3,
                    title: 'Library Hours Extended',
                    content: 'The library will now be open until 7 PM on weekdays to support exam preparation.',
                    date: '2024-07-03',
                    type: 'info',
                    author: 'Library Staff'
                }
            ]
        };
    }

    // ================================
    // Event Listeners Setup
    // ================================
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.navigateToSection(section);
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    // ================================
    // Authentication Functions
    // ================================
    handleLogin(event) {
        event.preventDefault();
        
        const loginId = document.getElementById('loginId').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        // Simple authentication check
        let user = null;
        
        if (userType === 'student') {
            user = this.sampleData.students.find(s => 
                (s.id === loginId || s.email === loginId) && s.password === password
            );
        } else if (userType === 'teacher') {
            user = this.sampleData.teachers.find(t => 
                (t.id === loginId || t.email === loginId) && t.password === password
            );
        }

        if (user) {
            this.currentUser = { ...user, type: userType };
            this.showMainApp();
            showNotification('Login successful! Welcome to SchoolHub.', 'success');
        } else {
            showNotification('Invalid credentials. Please try again.', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.loadLoginScreen();
        showNotification('You have been logged out successfully.', 'info');
    }

    // ================================
    // UI Navigation Functions
    // ================================
    loadLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        
        // Update user name in header
        document.getElementById('userName').textContent = `Welcome, ${this.currentUser.name}`;
        
        // Show appropriate navigation based on user type
        this.setupNavigation();
        
        // Load default section
        this.navigateToSection(this.currentUser.type === 'student' ? 'dashboard' : 'teacher-dashboard');
    }

    setupNavigation() {
        const studentNav = document.querySelector('.student-nav');
        const teacherNav = document.querySelector('.teacher-nav');
        
        if (this.currentUser.type === 'student') {
            studentNav.style.display = 'block';
            teacherNav.style.display = 'none';
        } else {
            studentNav.style.display = 'none';
            teacherNav.style.display = 'block';
        }
    }

    navigateToSection(sectionId) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Add active class to corresponding nav link
            const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            
            // Load section content
            this.loadSectionContent(sectionId);
        }
        
        this.currentSection = sectionId;
    }

    // ================================
    // Content Loading Functions
    // ================================
    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'timetable':
                this.loadTimetable();
                break;
            case 'assignments':
                this.loadAssignments();
                break;
            case 'grades':
                this.loadGrades();
                break;
            case 'attendance':
                this.loadAttendance();
                break;
            case 'announcements':
                this.loadAnnouncements();
                break;
            case 'chat':
                this.loadChat();
                break;
            case 'profile':
                this.loadProfile();
                break;
            default:
                // Dashboard content is already loaded in HTML
                break;
        }
    }

    loadTimetable() {
        const container = document.getElementById('timetableContainer');
        const userTimetable = this.sampleData.timetable[this.currentUser.id];
        
        if (!userTimetable) {
            container.innerHTML = '<p>No timetable available.</p>';
            return;
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let html = '<div class="timetable-grid">';
        
        days.forEach(day => {
            html += `
                <div class="timetable-day">
                    <h3>${day}</h3>
                    <div class="day-schedule">
            `;
            
            userTimetable[day].forEach(period => {
                html += `
                    <div class="schedule-item">
                        <div class="time">${period.time}</div>
                        <div class="subject">${period.subject}</div>
                        <div class="teacher">${period.teacher}</div>
                        <div class="room">${period.room}</div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    loadAssignments() {
        const container = document.getElementById('assignmentsContainer');
        const assignments = this.sampleData.students[0].assignments; // Using first student's assignments
        
        let html = '<div class="assignments-list">';
        
        assignments.forEach(assignment => {
            const statusClass = assignment.status === 'submitted' ? 'success' : 'pending';
            const statusText = assignment.status === 'submitted' ? 'Submitted' : 'Pending';
            
            html += `
                <div class="assignment-card">
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="assignment-details">
                        <p><strong>Subject:</strong> ${assignment.subject}</p>
                        <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p><strong>Description:</strong> ${assignment.description}</p>
                    </div>
                    <div class="assignment-actions">
                        ${assignment.status === 'pending' ? 
                            '<button class="btn btn-primary">Submit Assignment</button>' : 
                            '<button class="btn btn-secondary">View Submission</button>'
                        }
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    loadGrades() {
        const container = document.getElementById('gradesContainer');
        const grades = this.sampleData.students[0].grades; // Using first student's grades
        
        let html = `
            <div class="grades-overview">
                <div class="grades-summary">
                    <h3>Grade Summary</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="label">Average Grade:</span>
                            <span class="value">B+</span>
                        </div>
                        <div class="stat">
                            <span class="label">Total Subjects:</span>
                            <span class="value">${grades.length}</span>
                        </div>
                    </div>
                </div>
                <div class="grades-list">
        `;
        
        grades.forEach(grade => {
            const gradeClass = this.getGradeClass(grade.grade);
            html += `
                <div class="grade-card">
                    <div class="subject-name">${grade.subject}</div>
                    <div class="grade-info">
                        <span class="grade ${gradeClass}">${grade.grade}</span>
                        <span class="score">${grade.score}%</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
    }

    loadAttendance() {
        const container = document.getElementById('attendanceContainer');
        const attendanceRate = this.sampleData.students[0].attendance;
        
        const html = `
            <div class="attendance-overview">
                <div class="attendance-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Overall Attendance</h3>
                            <div class="attendance-rate">${attendanceRate}%</div>
                            <div class="attendance-bar">
                                <div class="attendance-fill" style="width: ${attendanceRate}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="attendance-calendar">
                    <h3>This Month's Attendance</h3>
                    <div class="calendar-placeholder">
                        <p>Interactive calendar will be displayed here showing daily attendance status.</p>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    loadAnnouncements() {
        const container = document.getElementById('announcementsContainer');
        const announcements = this.sampleData.announcements;
        
        let html = '<div class="announcements-list">';
        
        announcements.forEach(announcement => {
            const typeClass = this.getAnnouncementTypeClass(announcement.type);
            html += `
                <div class="announcement-card">
                    <div class="announcement-header">
                        <div class="announcement-type ${typeClass}">
                            <i class="fas ${this.getAnnouncementIcon(announcement.type)}"></i>
                            ${announcement.type.toUpperCase()}
                        </div>
                        <div class="announcement-date">
                            ${new Date(announcement.date).toLocaleDateString()}
                        </div>
                    </div>
                    <h3>${announcement.title}</h3>
                    <p>${announcement.content}</p>
                    <div class="announcement-author">
                        <i class="fas fa-user"></i> ${announcement.author}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    loadChat() {
        const container = document.getElementById('chatContainer');
        
        const html = `
            <div class="chat-interface">
                <div class="chat-sidebar">
                    <h3>Teachers</h3>
                    <div class="teacher-list">
                        <div class="teacher-item active">
                            <div class="teacher-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="teacher-info">
                                <div class="teacher-name">Dr. Sarah Wilson</div>
                                <div class="teacher-subject">Mathematics</div>
                            </div>
                            <div class="unread-count">2</div>
                        </div>
                        <div class="teacher-item">
                            <div class="teacher-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="teacher-info">
                                <div class="teacher-name">Dr. John Smith</div>
                                <div class="teacher-subject">Physics</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chat-main">
                    <div class="chat-header">
                        <h3>Dr. Sarah Wilson</h3>
                        <p>Mathematics Teacher</p>
                    </div>
                    
                    <div class="chat-messages">
                        <div class="message received">
                            <div class="message-content">Hello! How are you doing with the calculus problems?</div>
                            <div class="message-time">10:30 AM</div>
                        </div>
                        <div class="message sent">
                            <div class="message-content">Hi Dr. Wilson! I'm working through them. Could you help clarify problem #15?</div>
                            <div class="message-time">10:32 AM</div>
                        </div>
                        <div class="message received">
                            <div class="message-content">Of course! Problem #15 deals with integration by parts. Let me explain...</div>
                            <div class="message-time">10:35 AM</div>
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" placeholder="Type your message..." class="message-input">
                        <button class="send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    loadProfile() {
        const container = document.getElementById('profileContainer');
        const user = this.currentUser;
        
        const html = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="profile-info">
                        <h2>${user.name}</h2>
                        <p class="profile-role">${user.type === 'student' ? 'Student' : 'Teacher'}</p>
                        <p class="profile-email">${user.email}</p>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="profile-section">
                        <h3>Personal Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Full Name:</label>
                                <span>${user.name}</span>
                            </div>
                            <div class="detail-item">
                                <label>Email:</label>
                                <span>${user.email}</span>
                            </div>
                            ${user.type === 'student' ? `
                                <div class="detail-item">
                                    <label>Student ID:</label>
                                    <span>${user.id}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Grade:</label>
                                    <span>${user.grade}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Class:</label>
                                    <span>${user.class}</span>
                                </div>
                            ` : `
                                <div class="detail-item">
                                    <label>Teacher ID:</label>
                                    <span>${user.id}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Subjects:</label>
                                    <span>${user.subjects.join(', ')}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Classes:</label>
                                    <span>${user.classes.join(', ')}</span>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-primary">Edit Profile</button>
                        <button class="btn btn-secondary">Change Password</button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    // ================================
    // Theme Management
    // ================================
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
        
        const themeText = this.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
        showNotification(themeText, 'info');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === 'light' ? 
                '<i class="fas fa-moon"></i>' : 
                '<i class="fas fa-sun"></i>';
        }
    }

    // ================================
    // Utility Functions
    // ================================
    getGradeClass(grade) {
        if (grade.startsWith('A')) return 'excellent';
        if (grade.startsWith('B')) return 'good';
        if (grade.startsWith('C')) return 'average';
        return 'needs-improvement';
    }

    getAnnouncementTypeClass(type) {
        switch (type) {
            case 'important': return 'type-important';
            case 'event': return 'type-event';
            case 'info': return 'type-info';
            default: return 'type-general';
        }
    }

    getAnnouncementIcon(type) {
        switch (type) {
            case 'important': return 'fa-exclamation-triangle';
            case 'event': return 'fa-calendar-event';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bullhorn';
        }
    }
}

// ================================
// Initialize App
// ================================
document.addEventListener('DOMContentLoaded', () => {
    window.schoolApp = new SchoolApp();
});

// ================================
// Global Utility Functions
// ================================
function showNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    }
}
