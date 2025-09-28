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

        // Portal navigation
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', () => {
                this.switchPortalSection(item.dataset.section);
            });
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
        console.log('🤖 Calling AI API to generate materials...');
        console.log('📝 Prompt:', prompt);
        
        try {
            const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ce74038095d6469184af3b39e3eca7b3'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert learning advisor. Generate personalized learning materials based on user preferences. Return ONLY a valid JSON array of 4-6 learning materials with the following structure: [{"title": "Resource Name", "type": "Course/Book/Video/etc", "description": "Brief description", "duration": "Time estimate", "difficulty": 1-5, "url": "https://example.com", "icon": "fas fa-icon-class"}]. Do not wrap the response in markdown code blocks or add any additional text - return only the JSON array.'
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
                console.error('❌ API request failed:', response.status, response.statusText);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ AI API Response received:', data);
            const content = data.choices[0].message.content;
            console.log('📄 AI Generated Content:', content);
            
            // Clean the content to extract JSON (remove markdown code blocks if present)
            let jsonContent = content.trim();
            if (jsonContent.startsWith('```json')) {
                jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonContent.startsWith('```')) {
                jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            console.log('🧹 Cleaned JSON Content:', jsonContent);
            
            // Parse the JSON response
            const materials = JSON.parse(jsonContent);
            console.log('🎯 Parsed AI Materials:', materials);
            
            // Add AI generated flag and ensure proper structure
            return materials.map(material => ({
                ...material,
                aiGenerated: true,
                levels: ['all'], // AI materials are generally suitable for all levels
                category: this.mapTypeToCategory(material.type)
            }));
            
        } catch (error) {
            console.error('❌ Error calling AI API:', error);
            console.log('🔄 Falling back to static materials...');
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
- Mobile apps or tools

For each recommendation, include:
- Title and type
- Brief description
- Estimated duration
- Difficulty level (1-5)
- Cost information (Free, Paid (~$X), or Free (Audit))
- Relevant URL if available

Make sure the recommendations are:
1. Appropriate for their skill level
2. Match their learning purpose
3. Fit their time commitment
4. Include the material types they prefer
5. Are from reputable sources
6. Include both free and paid options when relevant

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
                // FREE MATERIALS
                {
                    title: "3Blue1Brown - Neural Networks Series",
                    type: "YouTube Series",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Beautifully animated explanations of neural networks, backpropagation, and deep learning concepts. Perfect for visual learners.",
                    duration: "2 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"
                },
                {
                    title: "Machine Learning Course by Andrew Ng (Coursera)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free (Audit)",
                    description: "Stanford's comprehensive introduction to machine learning covering supervised and unsupervised learning, neural networks, and practical applications.",
                    duration: "11 weeks",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.coursera.org/learn/machine-learning"
                },
                {
                    title: "fast.ai - Practical Deep Learning for Coders",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Complete free course focusing on practical deep learning applications. Top-down approach starting with real projects.",
                    duration: "8 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-brain",
                    url: "https://course.fast.ai/"
                },
                {
                    title: "Python for Data Science Handbook",
                    type: "Free Book",
                    category: "books",
                    cost: "Free",
                    description: "Essential guide to Python libraries for data science including NumPy, Pandas, Matplotlib, and Scikit-learn. Available as free Jupyter notebooks.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://jakevdp.github.io/PythonDataScienceHandbook/"
                },
                {
                    title: "Kaggle Learn Micro-Courses",
                    type: "Interactive Tutorials",
                    category: "exercises",
                    cost: "Free",
                    description: "Free micro-courses covering machine learning, data visualization, feature engineering, and deep learning with hands-on exercises.",
                    duration: "1-2 weeks each",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-trophy",
                    url: "https://www.kaggle.com/learn"
                },
                {
                    title: "Google AI Education - ML Crash Course",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Google's comprehensive machine learning crash course with practical exercises and real-world examples.",
                    duration: "3-4 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://developers.google.com/machine-learning/crash-course"
                },
                {
                    title: "MIT 6.034 Artificial Intelligence",
                    type: "YouTube Course",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Complete MIT course on artificial intelligence with Patrick Winston. Covers search, knowledge representation, and machine learning.",
                    duration: "4-5 weeks",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi"
                },
                {
                    title: "Two Minute Papers",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Latest AI research papers explained in simple terms. Great for staying updated with cutting-edge developments.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/TwoMinutePapers"
                },
                {
                    title: "The Elements of Statistical Learning",
                    type: "Free Book",
                    category: "books",
                    cost: "Free",
                    description: "Comprehensive textbook on statistical learning methods. Available as free PDF from Stanford. Essential for understanding ML theory.",
                    duration: "6-8 weeks",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://web.stanford.edu/~hastie/ElemStatLearn/"
                },
                {
                    title: "PyTorch Official Tutorials",
                    type: "Video Tutorials",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Official PyTorch tutorials covering deep learning fundamentals, computer vision, and natural language processing.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/PyTorchDeveloper"
                },
                
                // PAID MATERIALS
                {
                    title: "Deep Learning Specialization (Coursera)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($49/month)",
                    description: "Comprehensive deep learning specialization by Andrew Ng covering neural networks, CNNs, RNNs, and sequence models.",
                    duration: "5 months",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-brain",
                    url: "https://www.coursera.org/specializations/deep-learning"
                },
                {
                    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$50)",
                    description: "Best-selling practical guide to machine learning with real-world projects. Available on Amazon and bookstores.",
                    duration: "4-6 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Hands-Machine-Learning-Scikit-Learn-TensorFlow/dp/1492032646"
                },
                {
                    title: "Pattern Recognition and Machine Learning",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$80)",
                    description: "Christopher Bishop's comprehensive textbook on pattern recognition and machine learning. Essential for understanding ML theory.",
                    duration: "8-10 weeks",
                    difficulty: 5,
                    levels: ["advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Pattern-Recognition-Learning-Information-Statistics/dp/0387310738"
                },
                {
                    title: "Deep Learning (Goodfellow, Bengio, Courville)",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$70)",
                    description: "The definitive textbook on deep learning. Covers mathematical foundations and modern techniques.",
                    duration: "10-12 weeks",
                    difficulty: 5,
                    levels: ["advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Deep-Learning-Ian-Goodfellow/dp/0262035618"
                },
                {
                    title: "CS231n: Convolutional Neural Networks (Stanford)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free (with paid certificate)",
                    description: "Stanford's computer vision course covering CNNs, object detection, and image classification. Free lectures, paid certificate.",
                    duration: "3-4 weeks",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-graduation-cap",
                    url: "http://cs231n.stanford.edu/"
                },
                {
                    title: "Machine Learning Yearning by Andrew Ng",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$30)",
                    description: "Practical guide to machine learning project management and best practices. Available as ebook and print.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Machine-Learning-Yearning-Andrew-Ng/dp/1732261758"
                }
            ],
            'web development': [
                // FREE MATERIALS
                {
                    title: "freeCodeCamp - Full Stack Web Development",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Complete free curriculum covering HTML, CSS, JavaScript, React, Node.js, and databases. Includes hands-on projects and certifications.",
                    duration: "6-12 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-code",
                    url: "https://www.freecodecamp.org/"
                },
                {
                    title: "The Odin Project",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Open-source curriculum for learning full-stack web development. Covers Ruby on Rails, JavaScript, and modern frameworks.",
                    duration: "6-12 months",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.theodinproject.com/"
                },
                {
                    title: "Eloquent JavaScript",
                    type: "Free Book",
                    category: "books",
                    cost: "Free",
                    description: "Modern introduction to JavaScript programming with practical examples and exercises. Available free online.",
                    duration: "3-4 weeks",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://eloquentjavascript.net/"
                },
                {
                    title: "Traversy Media Web Dev Tutorials",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "High-quality web development tutorials covering HTML, CSS, JavaScript, React, Node.js, and modern frameworks.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/TraversyMedia"
                },
                {
                    title: "React Documentation & Tutorials",
                    type: "Official Documentation",
                    category: "articles",
                    cost: "Free",
                    description: "Official React documentation with interactive tutorials, guides, and comprehensive API reference.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-react",
                    url: "https://react.dev/"
                },
                {
                    title: "MDN Web Docs",
                    type: "Documentation",
                    category: "articles",
                    cost: "Free",
                    description: "Comprehensive documentation for HTML, CSS, and JavaScript. The definitive resource for web developers.",
                    duration: "Ongoing reference",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://developer.mozilla.org/"
                },
                {
                    title: "JavaScript.info",
                    type: "Online Tutorial",
                    category: "articles",
                    cost: "Free",
                    description: "Modern JavaScript tutorial covering ES6+, DOM manipulation, async programming, and advanced concepts.",
                    duration: "4-6 weeks",
                    difficulty: 3,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-code",
                    url: "https://javascript.info/"
                },
                {
                    title: "CSS-Tricks",
                    type: "Articles & Tutorials",
                    category: "articles",
                    cost: "Free",
                    description: "Extensive collection of CSS tutorials, techniques, and modern web development practices.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-paint-brush",
                    url: "https://css-tricks.com/"
                },
                {
                    title: "Web.dev by Google",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Google's web development course covering modern practices, performance, accessibility, and PWA development.",
                    duration: "4-6 weeks",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-graduation-cap",
                    url: "https://web.dev/learn/"
                },
                
                // PAID MATERIALS
                {
                    title: "The Complete Web Developer Course (Udemy)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid (~$20-50)",
                    description: "Comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and full-stack development with projects.",
                    duration: "6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-code",
                    url: "https://www.udemy.com/course/the-complete-web-developer-course-2/"
                },
                {
                    title: "You Don't Know JS (Book Series)",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$30-50)",
                    description: "Deep dive into JavaScript fundamentals. Available as individual books or complete series on Amazon.",
                    duration: "6-8 weeks",
                    difficulty: 4,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://github.com/getify/You-Dont-Know-JS"
                },
                {
                    title: "JavaScript: The Good Parts",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$25)",
                    description: "Classic book by Douglas Crockford on JavaScript best practices and the good parts of the language.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742"
                },
                {
                    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$40)",
                    description: "Essential book on writing clean, maintainable code. Available in bookstores and online.",
                    duration: "3-4 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882"
                }
            ],
            'investment': [
                // FREE MATERIALS
                {
                    title: "Investopedia Academy (Free Courses)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Free investment courses covering stocks, bonds, options, and portfolio management basics.",
                    duration: "2-4 weeks each",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-chart-line",
                    url: "https://academy.investopedia.com/"
                },
                {
                    title: "The Plain Bagel Finance",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Educational finance content covering investing, economics, and personal finance topics in simple terms.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/ThePlainBagel"
                },
                {
                    title: "Ben Felix - Common Sense Investing",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Evidence-based investing content covering index funds, portfolio theory, and market analysis.",
                    duration: "Ongoing",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/BenFelixCSI"
                },
                {
                    title: "Paper Trading Simulator (Investopedia)",
                    type: "Practice Tool",
                    category: "exercises",
                    cost: "Free",
                    description: "Practice investing with virtual money using real market data and conditions. No risk, real learning.",
                    duration: "Ongoing",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-chart-bar",
                    url: "https://www.investopedia.com/simulator/"
                },
                {
                    title: "SEC.gov Investor Education",
                    type: "Government Resources",
                    category: "articles",
                    cost: "Free",
                    description: "Official SEC resources for investor education, including guides on stocks, bonds, and avoiding fraud.",
                    duration: "1-2 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-shield-alt",
                    url: "https://www.sec.gov/investor"
                },
                {
                    title: "FINRA Investor Education",
                    type: "Educational Resources",
                    category: "articles",
                    cost: "Free",
                    description: "Comprehensive investor education resources covering all aspects of investing and financial planning.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.finra.org/investors"
                },
                {
                    title: "Bogleheads Wiki",
                    type: "Community Wiki",
                    category: "articles",
                    cost: "Free",
                    description: "Community-driven wiki covering index fund investing, portfolio theory, and Boglehead philosophy.",
                    duration: "Ongoing reference",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.bogleheads.org/wiki/Main_Page"
                },
                
                // PAID MATERIALS
                {
                    title: "The Intelligent Investor",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Classic guide to value investing by Benjamin Graham, the father of value investing. Available in bookstores.",
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
                    cost: "Paid (~$15-20)",
                    description: "Comprehensive guide to investing covering different strategies and market theories. Available on Amazon.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Random-Walk-Down-Wall-Street/dp/0393358380"
                },
                {
                    title: "The Little Book of Common Sense Investing",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$12-15)",
                    description: "John Bogle's guide to index fund investing. Simple, effective approach to building wealth.",
                    duration: "1-2 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Little-Book-Common-Sense-Investing/dp/1119404509"
                },
                {
                    title: "Investopedia Academy (Premium)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($199/year)",
                    description: "Premium investment courses with certificates, advanced strategies, and professional tools.",
                    duration: "4-8 weeks per course",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-chart-line",
                    url: "https://academy.investopedia.com/"
                },
                {
                    title: "Morningstar Investment Research",
                    type: "Research Platform",
                    category: "articles",
                    cost: "Paid ($29.95/month)",
                    description: "Professional investment research platform with stock analysis, fund ratings, and portfolio tools.",
                    duration: "Ongoing",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-chart-pie",
                    url: "https://www.morningstar.com/"
                }
            ],
            'spiritual growth': [
                // FREE MATERIALS
                {
                    title: "Insight Timer - Meditation App",
                    type: "Mobile App",
                    category: "exercises",
                    cost: "Free",
                    description: "Free meditation app with thousands of guided meditations, music, and courses. Largest free meditation library.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-mobile-alt",
                    url: "https://insighttimer.com/"
                },
                {
                    title: "Tara Brach Podcast",
                    type: "Podcast",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Weekly talks on meditation, spiritual awakening, and compassionate awareness. Available on all podcast platforms.",
                    duration: "Weekly",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-podcast",
                    url: "https://www.tarabrach.com/talks/"
                },
                {
                    title: "Mindfulness-Based Stress Reduction (Free Resources)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Free MBSR resources and guided practices from the Center for Mindfulness at UMass Medical School.",
                    duration: "8 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-leaf",
                    url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/"
                },
                {
                    title: "The Mindful Movement - YouTube",
                    type: "YouTube Channel",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Free guided meditations, yoga, and mindfulness practices for all levels.",
                    duration: "Ongoing",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fab fa-youtube",
                    url: "https://www.youtube.com/c/TheMindfulMovement"
                },
                {
                    title: "Buddhist Geeks Podcast",
                    type: "Podcast",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Explores the intersection of Buddhism, meditation, and modern life. Available on all podcast platforms.",
                    duration: "Weekly",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-podcast",
                    url: "https://www.buddhistgeeks.com/"
                },
                {
                    title: "Dharma Seed - Free Dharma Talks",
                    type: "Audio Library",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Extensive library of free dharma talks from meditation teachers worldwide.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-volume-up",
                    url: "https://dharmaseed.org/"
                },
                
                // PAID MATERIALS
                {
                    title: "The Power of Now",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Eckhart Tolle's spiritual guide to living in the present moment and finding inner peace. Available in bookstores.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Power-Now-Guide-Spiritual-Enlightenment/dp/1577314808"
                },
                {
                    title: "Headspace Meditation App",
                    type: "Mobile App",
                    category: "exercises",
                    cost: "Paid ($12.99/month)",
                    description: "Premium guided meditation app with structured courses, sleep stories, and mindfulness exercises.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.headspace.com/"
                },
                {
                    title: "Calm Premium",
                    type: "Mobile App",
                    category: "exercises",
                    cost: "Paid ($14.99/month)",
                    description: "Premium meditation and sleep app with guided meditations, sleep stories, and masterclasses.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.calm.com/"
                },
                {
                    title: "Mindfulness-Based Stress Reduction (MBSR) Course",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($200-400)",
                    description: "Official 8-week MBSR course with certified instructors. Available online and in-person worldwide.",
                    duration: "8 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-leaf",
                    url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/"
                },
                {
                    title: "The Untethered Soul",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Michael Singer's guide to spiritual awakening and inner freedom. Available on Amazon and bookstores.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Untethered-Soul-Journey-Beyond-Yourself/dp/1572245379"
                }
            ],
            'language learning': [
                // FREE MATERIALS
                {
                    title: "Duolingo",
                    type: "Language App",
                    category: "exercises",
                    cost: "Free",
                    description: "Gamified language learning platform with bite-sized lessons and progress tracking. Covers 40+ languages.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.duolingo.com/"
                },
                {
                    title: "Anki Flashcards",
                    type: "Spaced Repetition",
                    category: "exercises",
                    cost: "Free",
                    description: "Digital flashcards with spaced repetition algorithm for efficient vocabulary learning. Available on all platforms.",
                    duration: "Daily",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-brain",
                    url: "https://apps.ankiweb.net/"
                },
                {
                    title: "HelloTalk",
                    type: "Language Exchange",
                    category: "study-groups",
                    cost: "Free",
                    description: "Connect with native speakers for language exchange and conversation practice. Text, voice, and video chat.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-users",
                    url: "https://www.hellotalk.com/"
                },
                {
                    title: "BBC Languages",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Free language courses from BBC covering French, Spanish, German, Italian, and more with audio and video.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.bbc.co.uk/languages/"
                },
                {
                    title: "Memrise",
                    type: "Language App",
                    category: "exercises",
                    cost: "Free",
                    description: "Vocabulary learning app with native speaker videos and spaced repetition. Covers 20+ languages.",
                    duration: "Daily",
                    difficulty: 1,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.memrise.com/"
                },
                {
                    title: "Language Learning with Netflix",
                    type: "Browser Extension",
                    category: "exercises",
                    cost: "Free",
                    description: "Browser extension that adds dual subtitles and vocabulary learning to Netflix shows.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-tv",
                    url: "https://languagelearningwithnetflix.com/"
                },
                {
                    title: "Tandem Language Exchange",
                    type: "Language Exchange",
                    category: "study-groups",
                    cost: "Free",
                    description: "Language exchange app connecting learners with native speakers for conversation practice.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-users",
                    url: "https://www.tandem.net/"
                },
                
                // PAID MATERIALS
                {
                    title: "FluentU",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($20-30/month)",
                    description: "Learn languages through real-world videos with interactive subtitles and quizzes. Premium content library.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-video",
                    url: "https://www.fluentu.com/"
                },
                {
                    title: "Rosetta Stone",
                    type: "Language App",
                    category: "online-courses",
                    cost: "Paid ($11.99/month)",
                    description: "Comprehensive language learning program with speech recognition and immersive methodology.",
                    duration: "3-12 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.rosettastone.com/"
                },
                {
                    title: "Babbel",
                    type: "Language App",
                    category: "online-courses",
                    cost: "Paid ($13.95/month)",
                    description: "Structured language courses with conversation practice and grammar lessons. 14 languages available.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-mobile-alt",
                    url: "https://www.babbel.com/"
                },
                {
                    title: "Pimsleur Audio Courses",
                    type: "Audio Course",
                    category: "online-courses",
                    cost: "Paid ($14.95/month)",
                    description: "Audio-based language learning method focusing on conversation and pronunciation. Available for 50+ languages.",
                    duration: "1-5 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-volume-up",
                    url: "https://www.pimsleur.com/"
                },
                {
                    title: "italki - Online Language Tutors",
                    type: "1-on-1 Tutoring",
                    category: "coaching",
                    cost: "Paid ($10-50/hour)",
                    description: "Connect with native speaker tutors for personalized language lessons via video chat.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-user-tie",
                    url: "https://www.italki.com/"
                }
            ],
            'career development': [
                // FREE MATERIALS
                {
                    title: "LinkedIn Learning (Free Trial)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free (1 month trial)",
                    description: "Professional development courses covering business skills, technology, and creative topics. 1-month free trial available.",
                    duration: "1-4 weeks per course",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fab fa-linkedin",
                    url: "https://www.linkedin.com/learning/"
                },
                {
                    title: "Harvard Business Review (Free Articles)",
                    type: "Articles",
                    category: "articles",
                    cost: "Free",
                    description: "Leading business publication with free articles on management, strategy, and leadership. Premium content available.",
                    duration: "Weekly",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-newspaper",
                    url: "https://hbr.org/"
                },
                {
                    title: "Coursera Business Courses (Audit Mode)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free (Audit)",
                    description: "Free business courses from top universities including Wharton, Stanford, and Yale. Audit mode available.",
                    duration: "4-8 weeks per course",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.coursera.org/browse/business"
                },
                {
                    title: "TED Talks - Business & Leadership",
                    type: "Video Talks",
                    category: "youtube-tutorials",
                    cost: "Free",
                    description: "Inspiring talks on leadership, entrepreneurship, and business innovation from industry leaders.",
                    duration: "Ongoing",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fab fa-youtube",
                    url: "https://www.ted.com/topics/business"
                },
                {
                    title: "SCORE Business Mentoring",
                    type: "1-on-1 Coaching",
                    category: "coaching",
                    cost: "Free",
                    description: "Free business mentoring from experienced entrepreneurs and business professionals. Sponsored by SBA.",
                    duration: "3-6 months",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-user-tie",
                    url: "https://www.score.org/"
                },
                {
                    title: "Khan Academy - Economics & Finance",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Free courses on economics, finance, and entrepreneurship fundamentals.",
                    duration: "2-4 weeks per course",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.khanacademy.org/economics-finance-domain"
                },
                {
                    title: "Google Digital Garage",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Free",
                    description: "Free digital marketing and business skills courses from Google. Includes certificates.",
                    duration: "1-3 weeks per course",
                    difficulty: 2,
                    levels: ["beginner", "intermediate"],
                    icon: "fas fa-graduation-cap",
                    url: "https://learndigital.withgoogle.com/digitalgarage"
                },
                
                // PAID MATERIALS
                {
                    title: "The Lean Startup",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Eric Ries's guide to building successful startups through validated learning and rapid iteration. Available in bookstores.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898"
                },
                {
                    title: "Good to Great",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Jim Collins' research on what makes companies transition from good to great. Essential business reading.",
                    duration: "2-3 weeks",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Good-Great-Jim-Collins/dp/0066620996"
                },
                {
                    title: "The 7 Habits of Highly Effective People",
                    type: "Book",
                    category: "books",
                    cost: "Paid (~$15-20)",
                    description: "Stephen Covey's classic on personal and professional effectiveness. Available on Amazon and bookstores.",
                    duration: "2-3 weeks",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fas fa-book",
                    url: "https://www.amazon.com/Habits-Highly-Effective-People-Powerful/dp/1982137274"
                },
                {
                    title: "LinkedIn Learning (Premium)",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($29.99/month)",
                    description: "Premium professional development courses with certificates and personalized recommendations.",
                    duration: "1-4 weeks per course",
                    difficulty: 2,
                    levels: ["beginner", "intermediate", "advanced"],
                    icon: "fab fa-linkedin",
                    url: "https://www.linkedin.com/learning/"
                },
                {
                    title: "MasterClass - Business & Leadership",
                    type: "Online Course",
                    category: "online-courses",
                    cost: "Paid ($15/month)",
                    description: "Learn from business leaders like Howard Schultz, Anna Wintour, and Bob Iger. High-quality video lessons.",
                    duration: "2-4 hours per class",
                    difficulty: 2,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-graduation-cap",
                    url: "https://www.masterclass.com/"
                },
                {
                    title: "Harvard Business Review (Premium)",
                    type: "Articles",
                    category: "articles",
                    cost: "Paid ($10/month)",
                    description: "Premium access to HBR's complete archive, case studies, and exclusive content.",
                    duration: "Ongoing",
                    difficulty: 3,
                    levels: ["intermediate", "advanced"],
                    icon: "fas fa-newspaper",
                    url: "https://hbr.org/"
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
        
        console.log('🚀 Starting learning plan generation...');
        
        try {
            // Get AI-generated materials
            console.log('📚 Fetching AI-generated materials...');
            const aiMaterials = await this.getAIGeneratedMaterials();
            console.log(`📊 AI Materials count: ${aiMaterials.length}`);
            
            // Get fallback materials
            console.log('📖 Fetching fallback materials...');
            const fallbackMaterials = this.getRecommendedMaterials();
            console.log(`📊 Fallback Materials count: ${fallbackMaterials.length}`);
            
            // Combine and create daily plan
            const allMaterials = [...aiMaterials, ...fallbackMaterials];
            console.log(`📊 Total Materials count: ${allMaterials.length}`);
            const dailyPlan = this.createDailyPlan(allMaterials);
            console.log(`📅 Daily Plan created with ${dailyPlan.length} items`);
            
            // Display the table
            this.displayLearningTable(dailyPlan);
            console.log('✅ Learning plan table displayed successfully');
            
        } catch (error) {
            console.error('❌ Error generating learning plan:', error);
            console.log('🔄 Falling back to static materials only...');
            // Fallback to static materials
            const fallbackMaterials = this.getRecommendedMaterials();
            const dailyPlan = this.createDailyPlan(fallbackMaterials);
            this.displayLearningTable(dailyPlan);
            console.log('✅ Fallback learning plan displayed');
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
                    ${material.cost ? `<div class="cost-info">${material.cost}</div>` : ''}
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
            
            // Update progress bar
            this.updateProgressBar();
            
            // Update timeline
            this.displayTimeline();
            
            // Save to localStorage
            localStorage.setItem('learnwhat-daily-plan', JSON.stringify(this.dailyPlan));
        }
    }

    updateProgressBar() {
        if (!this.dailyPlan) return;
        
        const completedItems = this.dailyPlan.filter(item => item.completed).length;
        const totalItems = this.dailyPlan.length;
        const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        
        // Update progress bar in dashboard
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
        }
    }

    displayTimeline() {
        if (!this.dailyPlan) return;
        
        const timelineContainer = document.getElementById('timelineContainer');
        if (!timelineContainer) return;
        
        // Group materials by day and get unique days
        const daysMap = new Map();
        this.dailyPlan.forEach(material => {
            if (!daysMap.has(material.day)) {
                daysMap.set(material.day, []);
            }
            daysMap.get(material.day).push(material);
        });
        
        const uniqueDays = Array.from(daysMap.keys()).sort((a, b) => a - b);
        const maxDays = Math.min(uniqueDays.length, 20); // Show max 20 days for readability
        const selectedDays = uniqueDays.slice(0, maxDays);
        
        // Find current day (first incomplete day)
        const currentDay = this.dailyPlan.find(item => !item.completed)?.day || selectedDays[selectedDays.length - 1];
        
        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        
        selectedDays.forEach(day => {
            const dayMaterials = daysMap.get(day);
            const isCompleted = dayMaterials.every(material => material.completed);
            const isCurrent = day === currentDay && !isCompleted;
            
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
            
            // Get the first material for this day as representative
            const representativeMaterial = dayMaterials[0];
            
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-day">Day ${day}</div>
                    <div class="timeline-title">${representativeMaterial.title}</div>
                    <div class="timeline-type">${representativeMaterial.type}</div>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        });
        
        timelineContainer.innerHTML = '';
        timelineContainer.appendChild(timeline);
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
        
        // Save plan to user's plan collection
        this.savePlanToUserCollection();
        
        this.closeModal();
        this.showDashboard();
    }

    showDashboard() {
        document.querySelector('.main-container').style.display = 'none';
        document.getElementById('userPortal').classList.remove('hidden');
        
        document.getElementById('userName').textContent = this.currentUser.name;
        this.loadUserPortalData();
    }

    loadDashboardData() {
        const savedPlan = localStorage.getItem('learnwhat-plan');
        if (savedPlan) {
            this.learningPlan = JSON.parse(savedPlan);
            this.displayLearningPlan();
            // this.loadCoaches(); // Hidden for MVP stage
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
            // Update progress bar
            this.updateProgressBar();
            
            // Display timeline
            this.displayTimeline();
            
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
        document.getElementById('userPortal').classList.add('hidden');
        
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

    // User Portal Methods
    loadUserPortalData() {
        this.loadDashboardData();
        this.updateDashboardStats();
        this.loadUserPlans();
        this.loadRecentActivity();
    }

    switchPortalSection(sectionName) {
        // Update sidebar active state
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update main content
        document.querySelectorAll('.portal-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}Section`).classList.add('active');

        // Load section-specific data
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboardStats();
                this.loadRecentActivity();
                break;
            case 'plans':
                this.loadUserPlans();
                break;
            case 'progress':
                this.loadProgressOverview();
                break;
        }
    }

    updateDashboardStats() {
        const plans = this.getUserPlans();
        const totalPlans = plans.length;
        const completedItems = this.getTotalCompletedItems();
        const studyStreak = this.calculateStudyStreak();

        document.getElementById('totalPlans').textContent = totalPlans;
        document.getElementById('completedItems').textContent = completedItems;
        document.getElementById('studyStreak').textContent = studyStreak;
    }

    getUserPlans() {
        const savedPlans = localStorage.getItem('learnwhat-user-plans');
        return savedPlans ? JSON.parse(savedPlans) : [];
    }

    getTotalCompletedItems() {
        const plans = this.getUserPlans();
        let totalCompleted = 0;
        
        plans.forEach(plan => {
            if (plan.dailyPlan) {
                totalCompleted += plan.dailyPlan.filter(item => item.completed).length;
            }
        });
        
        return totalCompleted;
    }

    calculateStudyStreak() {
        // Simple streak calculation based on recent activity
        const activities = this.getRecentActivities();
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            if (activities.some(activity => activity.date === dateStr)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    loadUserPlans() {
        const plans = this.getUserPlans();
        const plansList = document.getElementById('plansList');
        
        if (plans.length === 0) {
            plansList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>No Learning Plans Yet</h3>
                    <p>Create your first learning plan to get started on your journey!</p>
                    <button class="btn-primary" onclick="app.switchPortalSection('create')">
                        Create New Plan
                    </button>
                </div>
            `;
            return;
        }

        plansList.innerHTML = plans.map((plan, index) => {
            const progress = this.calculatePlanProgress(plan);
            const status = progress === 100 ? 'completed' : 'active';
            
            return `
                <div class="plan-card" onclick="app.viewPlan(${index})">
                    <div class="plan-card-header">
                        <h3 class="plan-title">${plan.topic}</h3>
                        <span class="plan-status ${status}">${status === 'completed' ? 'Completed' : 'Active'}</span>
                    </div>
                    <div class="plan-meta">
                        <span><i class="fas fa-calendar"></i> ${plan.duration} days</span>
                        <span><i class="fas fa-signal"></i> ${plan.intensity}</span>
                    </div>
                    <div class="plan-progress">
                        <div class="plan-progress-bar">
                            <div class="plan-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="plan-progress-text">${progress}% Complete</div>
                    </div>
                    <div class="plan-actions">
                        <button class="btn-primary" onclick="event.stopPropagation(); app.continuePlan(${index})">
                            ${status === 'completed' ? 'Review' : 'Continue'}
                        </button>
                        <button class="btn-secondary" onclick="event.stopPropagation(); app.deletePlan(${index})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculatePlanProgress(plan) {
        if (!plan.dailyPlan || plan.dailyPlan.length === 0) return 0;
        
        const completed = plan.dailyPlan.filter(item => item.completed).length;
        const total = plan.dailyPlan.length;
        
        return Math.round((completed / total) * 100);
    }

    loadRecentActivity() {
        const activities = this.getRecentActivities();
        const activityList = document.getElementById('recentActivityList');
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <p>No recent activity. Start learning to see your progress here!</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    getRecentActivities() {
        const savedActivities = localStorage.getItem('learnwhat-recent-activities');
        return savedActivities ? JSON.parse(savedActivities) : [];
    }

    addRecentActivity(title, description, icon = 'fas fa-check-circle') {
        const activities = this.getRecentActivities();
        const newActivity = {
            title,
            description,
            icon,
            date: new Date().toDateString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        activities.unshift(newActivity);
        activities.splice(10); // Keep only last 10 activities
        
        localStorage.setItem('learnwhat-recent-activities', JSON.stringify(activities));
    }

    loadProgressOverview() {
        const currentPlan = this.learningPlan;
        const currentPlanSection = document.getElementById('currentPlanSection');
        
        if (!currentPlan) {
            currentPlanSection.innerHTML = `
                <div class="empty-state">
                    <h3>No Active Plan</h3>
                    <p>Create a learning plan to start tracking your progress!</p>
                    <button class="btn-primary" onclick="app.switchPortalSection('create')">
                        Create New Plan
                    </button>
                </div>
            `;
            return;
        }

        const progress = this.calculatePlanProgress(currentPlan);
        
        currentPlanSection.innerHTML = `
            <div class="current-plan-details">
                <h3>Current Plan: ${currentPlan.topic}</h3>
                <div class="plan-progress">
                    <div class="plan-progress-bar">
                        <div class="plan-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="plan-progress-text">${progress}% Complete</div>
                </div>
                <div class="plan-timeline">
                    ${this.generateTimelineHTML(currentPlan)}
                </div>
            </div>
        `;
    }

    generateTimelineHTML(plan) {
        if (!plan.dailyPlan) return '<p>No timeline available</p>';
        
        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        
        // Show first 10 days for overview
        const daysToShow = plan.dailyPlan.slice(0, 10);
        
        return daysToShow.map((material, index) => `
            <div class="timeline-item ${material.completed ? 'completed' : ''}">
                <div class="timeline-content">
                    <div class="timeline-day">Day ${material.day}</div>
                    <div class="timeline-title">${material.title}</div>
                    <div class="timeline-type">${material.type}</div>
                </div>
            </div>
        `).join('');
    }

    // Plan management methods
    startNewPlan() {
        // Reset to step 1 and show main container
        document.getElementById('userPortal').classList.add('hidden');
        document.querySelector('.main-container').style.display = 'block';
        this.currentStep = 1;
        this.updateStepVisibility();
    }

    startCustomPlan() {
        // For now, same as AI plan - can be extended later
        this.startNewPlan();
    }

    viewPlan(planIndex) {
        const plans = this.getUserPlans();
        const plan = plans[planIndex];
        
        if (plan) {
            this.learningPlan = plan;
            this.dailyPlan = plan.dailyPlan;
            this.switchPortalSection('progress');
        }
    }

    continuePlan(planIndex) {
        this.viewPlan(planIndex);
        this.switchPortalSection('dashboard');
    }

    deletePlan(planIndex) {
        if (confirm('Are you sure you want to delete this learning plan?')) {
            const plans = this.getUserPlans();
            plans.splice(planIndex, 1);
            localStorage.setItem('learnwhat-user-plans', JSON.stringify(plans));
            this.loadUserPlans();
            this.updateDashboardStats();
        }
    }

    savePlanToUserCollection() {
        if (!this.learningPlan) return;
        
        const plans = this.getUserPlans();
        const planToSave = {
            ...this.learningPlan,
            dailyPlan: this.dailyPlan,
            createdAt: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        plans.push(planToSave);
        localStorage.setItem('learnwhat-user-plans', JSON.stringify(plans));
        
        // Add to recent activity
        this.addRecentActivity(
            `Created new plan: ${this.learningPlan.topic}`,
            `${this.learningPlan.duration} days, ${this.learningPlan.intensity} intensity`,
            'fas fa-plus-circle'
        );
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
