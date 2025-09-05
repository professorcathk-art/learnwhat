// LearnWhat - Main JavaScript functionality

// Smooth scrolling for navigation links
function scrollToCategories() {
    document.getElementById('categories').scrollIntoView({
        behavior: 'smooth'
    });
}

// Category exploration functionality
function exploreCategory(category) {
    // Create a modal or redirect to category page
    showCategoryModal(category);
}

// Show category modal with detailed information
function showCategoryModal(category) {
    const categoryData = {
        'technology': {
            title: 'Technology',
            description: 'Master the latest technologies and build the future',
            topics: [
                { name: 'Web Development', path: 'technology/web-development', description: 'Frontend, Backend, Full-Stack development' },
                { name: 'Data Science & AI/ML', path: 'technology/data-science-ai', description: 'Machine Learning, Data Analysis, AI' },
                { name: 'Mobile Development', path: 'technology/mobile-development', description: 'iOS, Android, React Native, Flutter' },
                { name: 'DevOps & Cloud', path: 'technology/devops-cloud', description: 'AWS, Docker, Kubernetes, CI/CD' },
                { name: 'Cybersecurity', path: 'technology/cybersecurity', description: 'Security, Ethical Hacking, Network Security' }
            ]
        },
        'business': {
            title: 'Business',
            description: 'Build successful businesses and advance your career',
            topics: [
                { name: 'Entrepreneurship', path: 'business/entrepreneurship', description: 'Startup, Business Planning, Innovation' },
                { name: 'Marketing & Sales', path: 'business/marketing-sales', description: 'Digital Marketing, Sales Strategy, Growth' },
                { name: 'Finance & Investment', path: 'business/finance-investment', description: 'Financial Analysis, Investment, Trading' },
                { name: 'Management & Leadership', path: 'business/management-leadership', description: 'Team Management, Leadership Skills' },
                { name: 'Product Management', path: 'business/product-management', description: 'Product Strategy, Roadmapping, Analytics' }
            ]
        },
        'academic': {
            title: 'Academic',
            description: 'Deepen your understanding of core academic subjects',
            topics: [
                { name: 'Computer Science', path: 'academic/computer-science', description: 'Algorithms, Data Structures, Theory' },
                { name: 'Mathematics', path: 'academic/mathematics', description: 'Calculus, Linear Algebra, Statistics' },
                { name: 'Physics', path: 'academic/physics', description: 'Classical, Quantum, Modern Physics' },
                { name: 'Economics', path: 'academic/economics', description: 'Microeconomics, Macroeconomics, Finance' },
                { name: 'Psychology', path: 'academic/psychology', description: 'Cognitive, Behavioral, Social Psychology' }
            ]
        },
        'creative': {
            title: 'Creative',
            description: 'Unleash your creativity and artistic potential',
            topics: [
                { name: 'Design', path: 'creative/design', description: 'UI/UX, Graphic Design, Web Design' },
                { name: 'Writing & Content', path: 'creative/writing-content', description: 'Copywriting, Content Strategy, Blogging' },
                { name: 'Photography & Video', path: 'creative/photography-video', description: 'Photography, Videography, Editing' },
                { name: 'Music & Audio', path: 'creative/music-audio', description: 'Music Production, Audio Engineering' }
            ]
        },
        'languages': {
            title: 'Languages',
            description: 'Master programming and human languages',
            topics: [
                { name: 'Programming Languages', path: 'languages/programming-languages', description: 'Python, JavaScript, Java, C++, Go' },
                { name: 'Human Languages', path: 'languages/human-languages', description: 'English, Chinese, Spanish, French, German' }
            ]
        },
        'personal-development': {
            title: 'Personal Development',
            description: 'Grow personally and professionally',
            topics: [
                { name: 'Productivity & Time Management', path: 'personal-development/productivity', description: 'GTD, Time Blocking, Efficiency' },
                { name: 'Health & Wellness', path: 'personal-development/health-wellness', description: 'Fitness, Nutrition, Mental Health' },
                { name: 'Communication Skills', path: 'personal-development/communication', description: 'Public Speaking, Writing, Negotiation' },
                { name: 'Critical Thinking', path: 'personal-development/critical-thinking', description: 'Logic, Problem Solving, Decision Making' }
            ]
        }
    };

    const data = categoryData[category];
    if (!data) return;

    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${data.title}</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-description">${data.description}</p>
                    <div class="topics-list">
                        ${data.topics.map(topic => `
                            <div class="topic-item" onclick="navigateToTopic('${topic.path}')">
                                <h4>${topic.name}</h4>
                                <p>${topic.description}</p>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Navigate to specific topic
function navigateToTopic(topicPath) {
    // For now, just show an alert. In a real app, this would navigate to the topic page
    alert(`Navigating to: ${topicPath}\n\nThis would open the learning materials for this topic.`);
    closeModal();
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get target section
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Progress tracking (localStorage)
function initProgressTracking() {
    // Load progress from localStorage
    const progress = JSON.parse(localStorage.getItem('learnwhat-progress') || '{}');
    
    // Update progress display
    updateProgressDisplay(progress);
}

function updateProgressDisplay(progress) {
    const streakElement = document.querySelector('.progress-grid .progress-card:nth-child(1) .progress-number');
    const completedElement = document.querySelector('.progress-grid .progress-card:nth-child(2) .progress-number');
    const timeElement = document.querySelector('.progress-grid .progress-card:nth-child(3) .progress-number');
    
    if (streakElement) streakElement.textContent = progress.streak || 0;
    if (completedElement) completedElement.textContent = progress.completed || 0;
    if (timeElement) timeElement.textContent = `${progress.time || 0}h`;
}

// Search functionality
function initSearch() {
    // Add search input to header
    const nav = document.querySelector('.nav');
    const searchHTML = `
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search topics..." class="search-input">
            <i class="fas fa-search search-icon"></i>
        </div>
    `;
    
    nav.insertAdjacentHTML('beforeend', searchHTML);
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const topics = Array.from(card.querySelectorAll('.topic-tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(query) || 
                       description.includes(query) || 
                       topics.some(topic => topic.includes(query));
        
        card.style.display = matches ? 'block' : 'none';
    });
}

// Add CSS for modal and search
function addModalStyles() {
    const modalCSS = `
        <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h2 {
            color: var(--primary-color);
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: #f3f4f6;
            color: #374151;
        }
        
        .modal-body {
            padding: 1rem 2rem 2rem;
        }
        
        .modal-description {
            color: #6b7280;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        
        .topics-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .topic-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .topic-item:hover {
            border-color: var(--primary-color);
            background: #f8fafc;
            transform: translateX(4px);
        }
        
        .topic-item h4 {
            color: var(--text-primary);
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .topic-item p {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .topic-item i {
            color: var(--primary-color);
            transition: transform 0.3s ease;
        }
        
        .topic-item:hover i {
            transform: translateX(4px);
        }
        
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-input {
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9rem;
            width: 200px;
            transition: all 0.3s ease;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .search-icon {
            position: absolute;
            left: 0.75rem;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .search-input {
                width: 150px;
            }
            
            .modal-overlay {
                padding: 1rem;
            }
            
            .modal-content {
                max-height: 90vh;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalCSS);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initProgressTracking();
    initSearch();
    addModalStyles();
    
    // Add some sample progress data
    const sampleProgress = {
        streak: 7,
        completed: 12,
        time: 45
    };
    
    // Uncomment the line below to see sample progress
    // localStorage.setItem('learnwhat-progress', JSON.stringify(sampleProgress));
    // updateProgressDisplay(sampleProgress);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});
