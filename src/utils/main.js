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

        document.getElementById('regeneratePlan').addEventListener('click', () => {
            this.generateLearningPlanTable();
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

    async generateLearningMaterials() {
        const materialsGrid = document.getElementById('materialsGrid');
        materialsGrid.innerHTML = '<div class="loading-materials"><i class="fas fa-spinner fa-spin"></i> Generating personalized learning materials with AI...</div>';
        
        try {
            // First, get fallback materials
            const fallbackMaterials = this.getRecommendedMaterials();
            
            // Try to get AI-generated materials
            const aiMaterials = await this.getAIGeneratedMaterials();
            
            // Combine AI materials with fallback materials
            const allMaterials = [...aiMaterials, ...fallbackMaterials].slice(0, 8);
            
            materialsGrid.innerHTML = '';
            
            allMaterials.forEach(material => {
                const materialCard = document.createElement('div');
                materialCard.className = 'material-card';
                materialCard.innerHTML = `
                    <div class="material-header">
                        <div class="material-icon">
                            <i class="${material.icon}"></i>
                        </div>
                        <div class="material-info">
                            <h4>${material.title}</h4>
                            <div class="material-type">${material.type} ${material.aiGenerated ? '<span class="ai-badge">AI Recommended</span>' : ''}</div>
                        </div>
                    </div>
                    <div class="material-description">
                        ${material.description}
                    </div>
                    <div class="material-meta">
                        <span class="material-duration">${material.duration}</span>
                        <div class="material-difficulty">
                            ${this.generateDifficultyDots(material.difficulty)}
                        </div>
                    </div>
                    <a href="${material.url}" target="_blank" class="material-link">
                        Access Resource <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
                materialsGrid.appendChild(materialCard);
            });
        } catch (error) {
            console.error('Error generating AI materials:', error);
            // Fallback to static materials
            const fallbackMaterials = this.getRecommendedMaterials();
            materialsGrid.innerHTML = '';
            
            fallbackMaterials.forEach(material => {
                const materialCard = document.createElement('div');
                materialCard.className = 'material-card';
                materialCard.innerHTML = `
                    <div class="material-header">
                        <div class="material-icon">
                            <i class="${material.icon}"></i>
                        </div>
                        <div class="material-info">
                            <h4>${material.title}</h4>
                            <div class="material-type">${material.type}</div>
                        </div>
                    </div>
                    <div class="material-description">
                        ${material.description}
                    </div>
                    <div class="material-meta">
                        <span class="material-duration">${material.duration}</span>
                        <div class="material-difficulty">
                            ${this.generateDifficultyDots(material.difficulty)}
                        </div>
                    </div>
                    <a href="${material.url}" target="_blank" class="material-link">
                        Access Resource <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
                materialsGrid.appendChild(materialCard);
            });
        }
    }

    generateDifficultyDots(difficulty) {
        const dots = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= difficulty;
            dots.push(`<span class="difficulty-dot ${isActive ? 'active' : ''}"></span>`);
        }
        return dots.join('');
    }

    async getAIGeneratedMaterials() {
        const prompt = this.createMaterialsPrompt();
        
        try {
            const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ce74038095d6469184af3b39e3eca7b3'
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert learning advisor. Generate personalized learning materials based on user preferences. Return a JSON array of 4-6 learning materials with the following structure: [{"title": "Resource Name", "type": "Course/Book/Video/etc", "description": "Brief description", "duration": "Time estimate", "difficulty": 1-5, "url": "https://example.com", "icon": "fas fa-icon-class"}]'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Parse the JSON response
            const materials = JSON.parse(content);
            
            // Add AI generated flag and ensure proper structure
            return materials.map(material => ({
                ...material,
                aiGenerated: true,
                levels: ['all'], // AI materials are generally suitable for all levels
                category: this.mapTypeToCategory(material.type)
            }));
            
        } catch (error) {
            console.error('Error calling AI API:', error);
            return [];
        }
    }

    createMaterialsPrompt() {
        const { topic, level, purpose, duration, intensity, materials } = this.learningPlan;
        
        return `Generate personalized learning materials for someone who wants to learn "${topic}" at a "${level}" level. 

User Details:
- Topic: ${topic}
- Level: ${level}
- Purpose: ${purpose}
- Duration: ${duration} days
- Intensity: ${intensity}
- Preferred Material Types: ${materials.join(', ')}

Please recommend 4-6 high-quality learning resources that match their preferences. Include a mix of:
- Online courses or tutorials
- Books or articles
- Hands-on projects or exercises
- Video content or interactive resources

Make sure the recommendations are:
1. Appropriate for their skill level
2. Match their learning purpose
3. Fit their time commitment
4. Include the material types they prefer
5. Are from reputable sources

Return only the JSON array, no additional text.`;
    }

    mapTypeToCategory(type) {
        const typeMapping = {
            'Course': 'online-courses',
            'Book': 'books',
            'Video': 'youtube-tutorials',
            'Article': 'articles',
            'Project': 'projects',
            'Exercise': 'exercises',
            'Tutorial': 'youtube-tutorials',
            'Guide': 'articles',
            'Resource': 'articles'
        };
        
        return typeMapping[type] || 'articles';
    }

    getRecommendedMaterials() {
        const topic = this.learningPlan.topic.toLowerCase();
        const level = this.learningPlan.level;
        const purpose = this.learningPlan.purpose;
        const materials = this.learningPlan.materials;
        
        // Get base materials for the topic
        let baseMaterials = this.getMaterialsByTopic(topic);
        
        // Filter by level
        baseMaterials = baseMaterials.filter(material => 
            material.levels.includes(level) || material.levels.includes('all')
        );
        
        // Filter by selected material types
        baseMaterials = baseMaterials.filter(material => 
            materials.includes(material.category)
        );
        
        // Sort by relevance and return top 6-8 materials
        return baseMaterials.slice(0, 8);
    }

    getMaterialsByTopic(topic) {
        const materialsDatabase = {
            'ai': [
                {
                    title: "Machine Learning Course by Andrew Ng",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Comprehensive introduction to machine learning covering supervised and unsupervised learning, neural networks, and practical applications.",
                    duration: "11 weeks",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.coursera.org/learn/machine-learning"
                },
                {
                    title: "Deep Learning Specialization",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Advanced course covering deep learning, neural networks, and their applications in computer vision and NLP.",
                    duration: "5 months",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-brain",
                    url: "https://www.coursera.org/specializations/deep-learning"
                },
                {
                    title: "Python for Data Science Handbook",
                    type: "Book",
                    category: "books",
                    description: "Essential guide to Python libraries for data science including NumPy, Pandas, Matplotlib, and Scikit-learn.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://jakevdp.github.io/PythonDataScienceHandbook/"
                },
                {
                    title: "Hands-On Machine Learning",
                    type: "Book",
                    category: "books",
                    description: "Practical guide to machine learning with TensorFlow and Scikit-learn, featuring real-world projects.",
                    duration: "4-6 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/"
                },
                {
                    title: "3Blue1Brown Neural Networks",
                    type: "YouTube Series",
                    category: "youtube-tutorials",
                    description: "Beautifully animated explanations of neural networks, backpropagation, and deep learning concepts.",
                    duration: "2 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"
                },
                {
                    title: "Kaggle Learn Micro-Courses",
                    type: "Interactive Tutorials",
                    category: "exercises",
                    description: "Free micro-courses covering machine learning, data visualization, and feature engineering.",
                    duration: "1-2 weeks each",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-trophy",
                    url: "https://www.kaggle.com/learn"
                }
            ],
            'web development': [
                {
                    title: "The Complete Web Developer Course",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and full-stack development.",
                    duration: "6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-code",
                    url: "https://www.udemy.com/course/the-complete-web-developer-course-2/"
                },
                {
                    title: "Eloquent JavaScript",
                    type: "Book",
                    category: "books",
                    description: "Modern introduction to JavaScript programming with practical examples and exercises.",
                    duration: "3-4 weeks",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://eloquentjavascript.net/"
                },
                {
                    title: "React Documentation",
                    type: "Official Documentation",
                    category: "articles",
                    description: "Official React documentation with tutorials, guides, and API reference.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-react",
                    url: "https://react.dev/"
                },
                {
                    title: "Traversy Media Web Dev Tutorials",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    description: "High-quality web development tutorials covering modern technologies and best practices.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/TraversyMedia"
                },
                {
                    title: "Build a Portfolio Website",
                    type: "Project",
                    category: "projects",
                    description: "Hands-on project to build a responsive portfolio website using HTML, CSS, and JavaScript.",
                    duration: "1-2 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-laptop-code",
                    url: "#"
                }
            ],
            'investment': [
                {
                    title: "The Intelligent Investor",
                    type: "Book",
                    category: "books",
                    description: "Classic guide to value investing by Benjamin Graham, the father of value investing.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Intelligent-Investor-Definitive-Investing-Essentials/dp/0060555661"
                },
                {
                    title: "A Random Walk Down Wall Street",
                    type: "Book",
                    category: "books",
                    description: "Comprehensive guide to investing covering different strategies and market theories.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Random-Walk-Down-Wall-Street/dp/0393358380"
                },
                {
                    title: "Investopedia Academy",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Professional investment courses covering stocks, bonds, options, and portfolio management.",
                    duration: "4-8 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-chart-line",
                    url: "https://academy.investopedia.com/"
                },
                {
                    title: "The Plain Bagel Finance",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    description: "Educational finance content covering investing, economics, and personal finance topics.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/ThePlainBagel"
                },
                {
                    title: "Paper Trading Simulator",
                    type: "Practice Tool",
                    category: "exercises",
                    description: "Practice investing with virtual money using real market data and conditions.",
                    duration: "Ongoing",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-chart-bar",
                    url: "https://www.investopedia.com/simulator/"
                }
            ],
            'spiritual growth': [
                {
                    title: "The Power of Now",
                    type: "Book",
                    category: "books",
                    description: "Spiritual guide to living in the present moment and finding inner peace.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Power-Now-Guide-Spiritual-Enlightenment/dp/1577314808"
                },
                {
                    title: "Mindfulness-Based Stress Reduction",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Evidence-based program for reducing stress and improving well-being through mindfulness.",
                    duration: "8 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-leaf",
                    url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/"
                },
                {
                    title: "Headspace Meditation App",
                    type: "Mobile App",
                    category: "exercises",
                    description: "Guided meditation and mindfulness exercises for daily practice.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.headspace.com/"
                },
                {
                    title: "Tara Brach Podcast",
                    type: "Podcast",
                    category: "youtube-tutorials",
                    description: "Weekly talks on meditation, spiritual awakening, and compassionate awareness.",
                    duration: "Weekly",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-podcast",
                    url: "https://www.tarabrach.com/talks/"
                }
            ],
            'language learning': [
                {
                    title: "Duolingo",
                    type: "Language App",
                    category: "exercises",
                    description: "Gamified language learning platform with bite-sized lessons and progress tracking.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.duolingo.com/"
                },
                {
                    title: "FluentU",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Learn languages through real-world videos with interactive subtitles and quizzes.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-video",
                    url: "https://www.fluentu.com/"
                },
                {
                    title: "HelloTalk",
                    type: "Language Exchange",
                    category: "study-groups",
                    description: "Connect with native speakers for language exchange and conversation practice.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-users",
                    url: "https://www.hellotalk.com/"
                },
                {
                    title: "Anki Flashcards",
                    type: "Spaced Repetition",
                    category: "exercises",
                    description: "Digital flashcards with spaced repetition algorithm for efficient vocabulary learning.",
                    duration: "Daily",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-brain",
                    url: "https://apps.ankiweb.net/"
                }
            ],
            'career development': [
                {
                    title: "LinkedIn Learning",
                    type: "Online Course",
                    category: "online-courses",
                    description: "Professional development courses covering business skills, technology, and creative topics.",
                    duration: "1-4 weeks per course",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fab fa-linkedin",
                    url: "https://www.linkedin.com/learning/"
                },
                {
                    title: "The Lean Startup",
                    type: "Book",
                    category: "books",
                    description: "Guide to building successful startups through validated learning and rapid iteration.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898"
                },
                {
                    title: "Harvard Business Review",
                    type: "Articles",
                    category: "articles",
                    description: "Leading business publication with insights on management, strategy, and leadership.",
                    duration: "Weekly",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-newspaper",
                    url: "https://hbr.org/"
                },
                {
                    title: "Mentorship Program",
                    type: "1-on-1 Coaching",
                    category: "coaching",
                    description: "Connect with industry professionals for career guidance and skill development.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-user-tie",
                    url: "#"
                }
            ]
        };
        
        // Find matching materials based on topic keywords
        for (const [key, materials] of Object.entries(materialsDatabase)) {
            if (topic.includes(key) || key.includes(topic)) {
                return materials;
            }
        }
        
        // Default materials if no specific match
        return [
            {
                title: "General Learning Resources",
                type: "Mixed Content",
                category: "all",
                description: "Curated collection of high-quality learning resources for your chosen topic.",
                duration: "Varies",
                difficulty: 2,
                levels: ["all"],
                icon: "fas fa-graduation-cap",
                url: "#"
            }
        ];
    }

    updatePlanPreview() {
        if (!this.learningPlan) return;
        
        document.getElementById('planTopic').textContent = this.learningPlan.topic;
        document.getElementById('planDuration').textContent = `${this.learningPlan.duration} days`;
        document.getElementById('planIntensity').textContent = this.learningPlan.intensity;
        document.getElementById('planMaterials').textContent = this.learningPlan.materials.length + ' types selected';
        
        // Generate and display learning plan table
        this.generateLearningPlanTable();
    }

    async generateLearningPlanTable() {
        const tableBody = document.getElementById('learningTableBody');
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Generating your personalized learning plan...</td></tr>';
        
        try {
            // Get AI-generated materials
            const aiMaterials = await this.getAIGeneratedMaterials();
            
            // Get fallback materials
            const fallbackMaterials = this.getRecommendedMaterials();
            
            // Combine and create daily plan
            const allMaterials = [...aiMaterials, ...fallbackMaterials];
            const dailyPlan = this.createDailyPlan(allMaterials);
            
            // Display the table
            this.displayLearningTable(dailyPlan);
            
        } catch (error) {
            console.error('Error generating learning plan:', error);
            // Fallback to static materials
            const fallbackMaterials = this.getRecommendedMaterials();
            const dailyPlan = this.createDailyPlan(fallbackMaterials);
            this.displayLearningTable(dailyPlan);
        }
    }

    createDailyPlan(materials) {
        const duration = this.learningPlan.duration;
        const intensity = this.learningPlan.intensity;
        const dailyPlan = [];
        
        // Calculate materials per day based on intensity
        let materialsPerDay;
        switch (intensity) {
            case 'light':
                materialsPerDay = 1;
                break;
            case 'moderate':
                materialsPerDay = 2;
                break;
            case 'intensive':
                materialsPerDay = 3;
                break;
            default:
                materialsPerDay = 2;
        }
        
        // Distribute materials across days
        let materialIndex = 0;
        for (let day = 1; day <= duration; day++) {
            const dayMaterials = [];
            
            for (let i = 0; i < materialsPerDay && materialIndex < materials.length; i++) {
                const material = materials[materialIndex];
                dayMaterials.push({
                    ...material,
                    day: day,
                    completed: false
                });
                materialIndex++;
            }
            
            // If no materials for this day, add a rest day or review day
            if (dayMaterials.length === 0) {
                dayMaterials.push({
                    title: day % 7 === 0 ? "Weekly Review & Practice" : "Rest Day - Review Previous Materials",
                    type: "Review",
                    description: "Take time to review and practice what you've learned",
                    duration: "30-60 min",
                    difficulty: 1,
                    url: "#",
                    icon: "fas fa-book-open",
                    day: day,
                    completed: false,
                    isRestDay: true
                });
            }
            
            dailyPlan.push(...dayMaterials);
        }
        
        return dailyPlan;
    }

    displayLearningTable(dailyPlan) {
        const tableBody = document.getElementById('learningTableBody');
        tableBody.innerHTML = '';
        
        dailyPlan.forEach((material, index) => {
            const row = document.createElement('tr');
            row.className = material.completed ? 'completed-row' : '';
            
            // Create material cell content based on whether it's a rest day
            let materialCellContent;
            if (material.isRestDay) {
                // Rest day - no link
                materialCellContent = `
                    <div class="material-title">${material.title}</div>
                    ${material.description ? `<div class="material-description">${material.description}</div>` : ''}
                `;
            } else {
                // Regular material - with link
                materialCellContent = `
                    <a href="${material.url}" target="_blank" class="material-link">
                        ${material.title}
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    ${material.description ? `<div class="material-description">${material.description}</div>` : ''}
                    <div class="material-preview">
                        <button class="preview-btn" onclick="app.showMaterialPreview(${index})">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                    </div>
                `;
            }
            
            row.innerHTML = `
                <td class="day-cell">Day ${material.day}</td>
                <td class="material-cell">
                    ${materialCellContent}
                </td>
                <td class="type-cell">
                    <span class="type-badge ${material.isRestDay ? 'rest-day-badge' : ''}">${material.type}</span>
                </td>
                <td class="duration-cell">${material.duration}</td>
                <td class="status-cell">
                    <input type="checkbox" class="status-checkbox" ${material.completed ? 'checked' : ''} 
                           onchange="app.toggleMaterialStatus(${index})">
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Store the daily plan for status tracking
        this.dailyPlan = dailyPlan;
    }

    toggleMaterialStatus(index) {
        if (this.dailyPlan && this.dailyPlan[index]) {
            this.dailyPlan[index].completed = !this.dailyPlan[index].completed;
            
            // Update the row appearance
            const rows = document.querySelectorAll('#learningTableBody tr');
            if (rows[index]) {
                if (this.dailyPlan[index].completed) {
                    rows[index].classList.add('completed-row');
                } else {
                    rows[index].classList.remove('completed-row');
                }
            }
            
            // Save to localStorage
            localStorage.setItem('learnwhat-daily-plan', JSON.stringify(this.dailyPlan));
        }
    }

    showMaterialPreview(index) {
        if (!this.dailyPlan || !this.dailyPlan[index]) return;
        
        const material = this.dailyPlan[index];
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content preview-modal">
                <div class="modal-header">
                    <h2>Material Preview</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        <div class="preview-header">
                            <h3>${material.title}</h3>
                            <div class="preview-meta">
                                <span class="type-badge">${material.type}</span>
                                <span class="duration-badge">${material.duration}</span>
                            </div>
                        </div>
                        <div class="preview-description">
                            <h4>Description</h4>
                            <p>${material.description || 'No description available.'}</p>
                        </div>
                        <div class="preview-details">
                            <h4>Learning Details</h4>
                            <ul>
                                <li><strong>Day:</strong> Day ${material.day}</li>
                                <li><strong>Type:</strong> ${material.type}</li>
                                <li><strong>Duration:</strong> ${material.duration}</li>
                                <li><strong>Difficulty:</strong> ${this.generateDifficultyStars(material.difficulty || 3)}</li>
                            </ul>
                        </div>
                        <div class="preview-actions">
                            <a href="${material.url}" target="_blank" class="btn-primary">
                                <i class="fas fa-external-link-alt"></i> Access Material
                            </a>
                            <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    generateDifficultyStars(difficulty) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= difficulty;
            stars.push(`<span class="difficulty-star ${isActive ? 'active' : ''}">★</span>`);
        }
        return stars.join('');
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
        
        // Load daily plan from localStorage if available
        const savedDailyPlan = localStorage.getItem('learnwhat-daily-plan');
        if (savedDailyPlan) {
            this.dailyPlan = JSON.parse(savedDailyPlan);
        }
        
        if (this.dailyPlan) {
            // Calculate progress from daily plan
            const completedItems = this.dailyPlan.filter(item => item.completed).length;
            const totalItems = this.dailyPlan.length;
            const progressPercentage = (completedItems / totalItems) * 100;
            
            document.getElementById('progressFill').style.width = `${progressPercentage}%`;
            document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% Complete`;
            
            // Display daily plan in dashboard
            this.displayDashboardTable();
        } else {
            // Fallback to old checklist system
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
    }

    displayDashboardTable() {
        const checklistContainer = document.getElementById('planChecklist');
        checklistContainer.innerHTML = '';
        
        // Create a simplified table for dashboard
        const table = document.createElement('table');
        table.className = 'dashboard-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Material</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${this.dailyPlan.map((material, index) => `
                    <tr class="${material.completed ? 'completed-row' : ''}">
                        <td>Day ${material.day}</td>
                        <td>
                            ${material.isRestDay ? 
                                `<div class="material-title">${material.title}</div>` :
                                `<a href="${material.url}" target="_blank" class="material-link">
                                    ${material.title}
                                </a>`
                            }
                        </td>
                        <td>
                            <input type="checkbox" class="status-checkbox" ${material.completed ? 'checked' : ''} 
                                   onchange="app.toggleMaterialStatus(${index})">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        checklistContainer.appendChild(table);
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
