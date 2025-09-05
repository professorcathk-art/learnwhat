// LearnWhat MVP - Main JavaScript functionality

class LearnWhatApp {
    constructor() {
        this.currentStep = 1;
        this.userData = {
            topic: '',
            level: '',
            purpose: '',
            duration: '',
            intensity: '',
            materials: []
        };
        this.learningPlan = null;
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
        this.updateStepVisibility();
    }

    bindEvents() {
        // Topic selection
        document.getElementById('topicSearch').addEventListener('input', (e) => {
            this.handleTopicSearch(e.target.value);
        });

        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectTopic(card);
            });
        });

        // Step navigation
        document.getElementById('nextStep1').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep2').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('nextStep2').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep3').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('nextStep3').addEventListener('click', () => {
            this.generateLearningPlan();
        });

        document.getElementById('prevStep4').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showRegistrationModal();
        });

        // Form events
        document.querySelectorAll('input[name="level"], input[name="purpose"], input[name="duration"], input[name="intensity"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateStep2Validation();
            });
        });

        document.querySelectorAll('input[name="materials"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateStep3Validation();
            });
        });

        // Registration form
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration(e);
        });

        // Login/Logout
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('signupBtn').addEventListener('click', () => {
            this.showRegistrationModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    handleTopicSearch(value) {
        if (value.trim()) {
            this.userData.topic = value.trim();
            this.updateStep1Validation();
        }
    }

    selectTopic(card) {
        document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.userData.topic = card.dataset.topic;
        this.updateStep1Validation();
    }

    updateStep1Validation() {
        const nextBtn = document.getElementById('nextStep1');
        nextBtn.disabled = !this.userData.topic;
    }

    updateStep2Validation() {
        const level = document.querySelector('input[name="level"]:checked');
        const purpose = document.querySelector('input[name="purpose"]:checked');
        const duration = document.querySelector('input[name="duration"]:checked');
        const intensity = document.querySelector('input[name="intensity"]:checked');
        
        const nextBtn = document.getElementById('nextStep2');
        nextBtn.disabled = !(level && purpose && duration && intensity);
        
        if (level) this.userData.level = level.value;
        if (purpose) this.userData.purpose = purpose.value;
        if (duration) this.userData.duration = duration.value;
        if (intensity) this.userData.intensity = intensity.value;
    }

    updateStep3Validation() {
        const selectedMaterials = document.querySelectorAll('input[name="materials"]:checked');
        const nextBtn = document.getElementById('nextStep3');
        
        this.userData.materials = Array.from(selectedMaterials).map(input => input.value);
        nextBtn.disabled = selectedMaterials.length === 0;
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepVisibility();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepVisibility();
        }
    }

    updateStepVisibility() {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.getElementById(`step${this.currentStep}`).classList.add('active');
        
        if (this.currentStep === 4) {
            this.updatePlanPreview();
        }
    }

    generateLearningPlan() {
        this.learningPlan = this.createLearningPlan();
        this.nextStep();
    }

    createLearningPlan() {
        const duration = parseInt(this.userData.duration);
        const intensity = this.userData.intensity;
        const materials = this.userData.materials;
        
        return {
            topic: this.userData.topic,
            level: this.userData.level,
            purpose: this.userData.purpose,
            duration: duration,
            intensity: intensity,
            materials: materials,
            timeline: this.generateTimeline(duration, intensity, materials),
            checklist: this.generateChecklist(duration, intensity, materials)
        };
    }

    generateTimeline(duration, intensity, materials) {
        const timeline = [];
        const weeks = Math.ceil(duration / 7);
        
        for (let week = 1; week <= weeks; week++) {
            timeline.push({
                week: week,
                title: this.getWeekTitle(week, weeks),
                activities: this.getWeekActivities(week, weeks, intensity, materials)
            });
        }
        
        return timeline;
    }

    getWeekTitle(week, totalWeeks) {
        if (week === 1) return "Foundation & Introduction";
        if (week <= totalWeeks * 0.3) return "Building Fundamentals";
        if (week <= totalWeeks * 0.7) return "Intermediate Concepts";
        if (week <= totalWeeks * 0.9) return "Advanced Topics";
        return "Mastery & Projects";
    }

    getWeekActivities(week, totalWeeks, intensity, materials) {
        const activities = [];
        const hoursPerDay = intensity === 'light' ? 0.5 : intensity === 'moderate' ? 1.5 : 3;
        
        if (materials.includes('youtube-tutorials')) {
            activities.push(`${hoursPerDay * 2} hours of video tutorials`);
        }
        if (materials.includes('books')) {
            activities.push(`Read 1-2 chapters from recommended books`);
        }
        if (materials.includes('projects')) {
            activities.push(`Work on hands-on project`);
        }
        if (materials.includes('exercises')) {
            activities.push(`Complete practice exercises`);
        }
        
        return activities;
    }

    generateChecklist(duration, intensity, materials) {
        const checklist = [];
        const totalItems = Math.min(duration, 20);
        
        for (let i = 1; i <= totalItems; i++) {
            checklist.push({
                id: i,
                title: this.getChecklistItemTitle(i, materials),
                completed: false
            });
        }
        
        return checklist;
    }

    getChecklistItemTitle(item, materials) {
        const titles = [
            "Complete introduction to the topic",
            "Watch foundational video content",
            "Read recommended materials",
            "Complete first practice exercise",
            "Build a simple project",
            "Join relevant community/forum",
            "Complete intermediate exercises",
            "Work on advanced project",
            "Create portfolio piece",
            "Share your learning journey"
        ];
        
        return titles[item - 1] || `Complete learning milestone ${item}`;
    }

    updatePlanPreview() {
        if (!this.learningPlan) return;
        
        document.getElementById('planTopic').textContent = this.learningPlan.topic;
        document.getElementById('planDuration').textContent = `${this.learningPlan.duration} days`;
        document.getElementById('planIntensity').textContent = this.learningPlan.intensity;
        document.getElementById('planMaterials').textContent = this.learningPlan.materials.length + ' types selected';
        
        const timelineContent = document.getElementById('timelineContent');
        timelineContent.innerHTML = '';
        
        this.learningPlan.timeline.forEach(week => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <i class="fas fa-calendar-week"></i>
                <div class="timeline-content">
                    <h4>Week ${week.week}: ${week.title}</h4>
                    <p>${week.activities.join(', ')}</p>
                </div>
            `;
            timelineContent.appendChild(timelineItem);
        });
    }

    showRegistrationModal() {
        document.getElementById('registrationModal').classList.add('active');
    }

    showLoginModal() {
        const email = prompt('Enter your email:');
        if (email) {
            this.currentUser = { email, name: email.split('@')[0] };
            this.showDashboard();
        }
    }

    closeModal() {
        document.getElementById('registrationModal').classList.remove('active');
    }

    handleRegistration(e) {
        const formData = new FormData(e.target);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        if (formData.get('password') !== formData.get('confirmPassword')) {
            alert('Passwords do not match!');
            return;
        }
        
        this.currentUser = {
            name: userData.fullName,
            email: userData.email
        };
        
        localStorage.setItem('learnwhat-user', JSON.stringify(this.currentUser));
        localStorage.setItem('learnwhat-plan', JSON.stringify(this.learningPlan));
        
        this.closeModal();
        this.showDashboard();
    }

    showDashboard() {
        document.querySelector('.main-container').style.display = 'none';
        document.getElementById('dashboard').classList.remove('hidden');
        
        document.getElementById('userName').textContent = this.currentUser.name;
        this.loadDashboardData();
    }

    loadDashboardData() {
        const savedPlan = localStorage.getItem('learnwhat-plan');
        if (savedPlan) {
            this.learningPlan = JSON.parse(savedPlan);
            this.displayLearningPlan();
            this.loadCoaches();
        }
    }

    displayLearningPlan() {
        if (!this.learningPlan) return;
        
        const completedItems = this.learningPlan.checklist.filter(item => item.completed).length;
        const totalItems = this.learningPlan.checklist.length;
        const progressPercentage = (completedItems / totalItems) * 100;
        
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;
        document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% Complete`;
        
        const checklistContainer = document.getElementById('planChecklist');
        checklistContainer.innerHTML = '';
        
        this.learningPlan.checklist.forEach(item => {
            const checklistItem = document.createElement('div');
            checklistItem.className = `checklist-item ${item.completed ? 'completed' : ''}`;
            checklistItem.innerHTML = `
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="app.toggleChecklistItem(${item.id})">
                <span class="checklist-text">${item.title}</span>
            `;
            checklistContainer.appendChild(checklistItem);
        });
    }

    toggleChecklistItem(itemId) {
        const item = this.learningPlan.checklist.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            localStorage.setItem('learnwhat-plan', JSON.stringify(this.learningPlan));
            this.displayLearningPlan();
        }
    }

    loadCoaches() {
        const coaches = [
            {
                id: 1,
                name: "Sarah Chen",
                title: "AI/ML Expert",
                rating: 4.9,
                reviews: 127,
                specialties: ["Machine Learning", "Python", "Data Science"],
                price: "$80/hour",
                avatar: "SC"
            },
            {
                id: 2,
                name: "Marcus Johnson",
                title: "Web Development Coach",
                rating: 4.8,
                reviews: 89,
                specialties: ["React", "Node.js", "Full-Stack"],
                price: "$70/hour",
                avatar: "MJ"
            },
            {
                id: 3,
                name: "Dr. Emily Rodriguez",
                title: "Business Strategy Advisor",
                rating: 4.9,
                reviews: 156,
                specialties: ["Entrepreneurship", "Marketing", "Finance"],
                price: "$120/hour",
                avatar: "ER"
            }
        ];
        
        const coachesGrid = document.getElementById('coachesGrid');
        coachesGrid.innerHTML = '';
        
        coaches.forEach(coach => {
            const coachCard = document.createElement('div');
            coachCard.className = 'coach-card';
            coachCard.innerHTML = `
                <div class="coach-header">
                    <div class="coach-avatar">${coach.avatar}</div>
                    <div class="coach-info">
                        <h4>${coach.name}</h4>
                        <p>${coach.title}</p>
                    </div>
                </div>
                <div class="coach-rating">
                    <div class="stars">★★★★★</div>
                    <span>${coach.rating} (${coach.reviews} reviews)</span>
                </div>
                <div class="coach-specialties">
                    ${coach.specialties.map(specialty => `<span class="specialty-tag">${specialty}</span>`).join('')}
                </div>
                <div class="coach-price">${coach.price}</div>
            `;
            
            coachCard.addEventListener('click', () => {
                this.selectCoach(coach);
            });
            
            coachesGrid.appendChild(coachCard);
        });
    }

    selectCoach(coach) {
        alert(`You selected ${coach.name} as your coach! In a real app, this would redirect to booking/scheduling.`);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('learnwhat-user');
        
        document.querySelector('.main-container').style.display = 'block';
        document.getElementById('dashboard').classList.add('hidden');
        
        this.currentStep = 1;
        this.updateStepVisibility();
    }

    loadUserData() {
        const savedUser = localStorage.getItem('learnwhat-user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        }
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new LearnWhatApp();
});

// Global functions for HTML onclick events
function closeModal() {
    if (app) {
        app.closeModal();
    }
}
