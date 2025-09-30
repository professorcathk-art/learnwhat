// Contributor Portal JavaScript
class ContributorPortal {
    constructor() {
        this.apiBase = 'http://localhost:5001';
        this.currentTab = 'login';
        this.isLoggedIn = false;
        this.sessionId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLoginStatus();
    }

    bindEvents() {
        // Contributor button click
        document.getElementById('contributorBtn').addEventListener('click', () => {
            this.showContributorModal();
        });

        // Form submissions
        document.getElementById('contributorLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('contributorRegisterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('newResourceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddResource();
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.id === 'contributorModal') {
                this.closeContributorModal();
            }
        });
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBase}${endpoint}`, options);
            const result = await response.json();
            return { success: response.ok, data: result, status: response.status };
        } catch (error) {
            console.error('API Request Error:', error);
            return { success: false, error: error.message };
        }
    }

    showContributorModal() {
        document.getElementById('contributorModal').classList.add('active');
        this.switchTab('login');
    }

    closeContributorModal() {
        document.getElementById('contributorModal').classList.remove('active');
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="switchContributorTab('${tabName}')"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.contributor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`contributor${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

        // Load data for specific tabs
        if (tabName === 'resources' && this.isLoggedIn) {
            this.loadMyResources();
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('contributorStatus');
        statusDiv.textContent = message;
        statusDiv.className = `contributor-status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }

    async handleLogin() {
        const email = document.getElementById('contributorEmail').value;
        const password = document.getElementById('contributorPassword').value;

        this.showStatus('Logging in...', 'info');

        const response = await this.makeRequest('/api/contributor/login', 'POST', {
            email,
            password
        });

        if (response.success && response.data.success) {
            this.isLoggedIn = true;
            this.sessionId = response.data.session_id;
            this.showStatus('Login successful!', 'success');
            this.switchTab('resources');
            this.loadMyResources();
        } else {
            this.showStatus(response.data?.message || 'Login failed', 'error');
        }
    }

    async handleRegister() {
        const formData = new FormData(document.getElementById('contributorRegisterForm'));
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            expertise_areas: formData.get('expertise_areas').split(',').map(s => s.trim()).filter(s => s),
            organization: formData.get('organization'),
            bio: formData.get('bio')
        };

        this.showStatus('Registering...', 'info');

        const response = await this.makeRequest('/api/contributor/register', 'POST', data);

        if (response.success && response.data.success) {
            this.showStatus('Registration successful! Please login.', 'success');
            this.switchTab('login');
            // Pre-fill login form
            document.getElementById('contributorEmail').value = data.email;
        } else {
            this.showStatus(response.data?.message || 'Registration failed', 'error');
        }
    }

    async loadMyResources() {
        if (!this.isLoggedIn) {
            document.getElementById('myResourcesList').innerHTML = `
                <div class="empty-resources">
                    <i class="fas fa-lock"></i>
                    <h3>Please Login</h3>
                    <p>You need to login to view your resources.</p>
                </div>
            `;
            return;
        }

        document.getElementById('myResourcesList').innerHTML = `
            <div class="loading-message">
                <i class="fas fa-spinner fa-spin"></i> Loading your resources...
            </div>
        `;

        const response = await this.makeRequest('/api/resources/my');

        if (response.success && response.data.success) {
            const resources = response.data.resources || [];
            this.displayResources(resources);
        } else {
            document.getElementById('myResourcesList').innerHTML = `
                <div class="empty-resources">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Resources</h3>
                    <p>${response.data?.message || 'Failed to load resources'}</p>
                </div>
            `;
        }
    }

    displayResources(resources) {
        if (resources.length === 0) {
            document.getElementById('myResourcesList').innerHTML = `
                <div class="empty-resources">
                    <i class="fas fa-book-open"></i>
                    <h3>No Resources Yet</h3>
                    <p>Start contributing by adding your first learning resource!</p>
                </div>
            `;
            return;
        }

        const resourcesHTML = resources.map(resource => `
            <div class="resource-item">
                <div class="resource-header">
                    <h3 class="resource-title">${resource.title}</h3>
                    <span class="resource-status ${resource.status}">${resource.status}</span>
                </div>
                <div class="resource-meta">
                    <div class="resource-meta-item">
                        <span class="resource-meta-label">Type</span>
                        <span class="resource-meta-value">${resource.type}</span>
                    </div>
                    <div class="resource-meta-item">
                        <span class="resource-meta-label">Difficulty</span>
                        <span class="resource-meta-value">${resource.difficulty}</span>
                    </div>
                    <div class="resource-meta-item">
                        <span class="resource-meta-label">Duration</span>
                        <span class="resource-meta-value">${resource.duration || 'N/A'}</span>
                    </div>
                    <div class="resource-meta-item">
                        <span class="resource-meta-label">Created</span>
                        <span class="resource-meta-value">${new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${resource.description}</p>
                ${resource.hashtags && resource.hashtags.length > 0 ? `
                    <div class="resource-hashtags">
                        ${resource.hashtags.map(tag => `<span class="resource-hashtag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="resource-actions">
                    <a href="${resource.url}" target="_blank" class="btn-sm btn-secondary">
                        <i class="fas fa-external-link-alt"></i> View
                    </a>
                    <button class="btn-sm btn-secondary" onclick="contributorPortal.editResource('${resource.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-sm btn-secondary" onclick="contributorPortal.deleteResource('${resource.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('myResourcesList').innerHTML = resourcesHTML;
    }

    showAddResourceForm() {
        document.getElementById('addResourceForm').style.display = 'block';
    }

    hideAddResourceForm() {
        document.getElementById('addResourceForm').style.display = 'none';
        document.getElementById('newResourceForm').reset();
    }

    async handleAddResource() {
        if (!this.isLoggedIn) {
            this.showStatus('Please login first', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('newResourceForm'));
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            url: formData.get('url'),
            type: formData.get('type'),
            difficulty: formData.get('difficulty'),
            duration: formData.get('duration'),
            hashtags: formData.get('hashtags').split(',').map(s => s.trim()).filter(s => s),
            prerequisites: formData.get('prerequisites'),
            learning_outcomes: formData.get('learning_outcomes'),
            target_audience: formData.get('target_audience')
        };

        this.showStatus('Adding resource...', 'info');

        const response = await this.makeRequest('/api/resources', 'POST', data);

        if (response.success && response.data.success) {
            this.showStatus('Resource added successfully!', 'success');
            this.hideAddResourceForm();
            this.loadMyResources();
        } else {
            this.showStatus(response.data?.message || 'Failed to add resource', 'error');
        }
    }

    async deleteResource(resourceId) {
        if (!confirm('Are you sure you want to delete this resource?')) {
            return;
        }

        this.showStatus('Deleting resource...', 'info');

        const response = await this.makeRequest(`/api/resources/${resourceId}`, 'DELETE');

        if (response.success && response.data.success) {
            this.showStatus('Resource deleted successfully!', 'success');
            this.loadMyResources();
        } else {
            this.showStatus(response.data?.message || 'Failed to delete resource', 'error');
        }
    }

    async editResource(resourceId) {
        // For now, just show a message - you can implement edit functionality later
        this.showStatus('Edit functionality coming soon!', 'info');
    }

    async checkLoginStatus() {
        // Check if user is already logged in
        const response = await this.makeRequest('/api/contributor/profile');
        if (response.success && response.data.success) {
            this.isLoggedIn = true;
        }
    }
}

// Global functions for HTML onclick events
function switchContributorTab(tabName) {
    contributorPortal.switchTab(tabName);
}

function showAddResourceForm() {
    contributorPortal.showAddResourceForm();
}

function hideAddResourceForm() {
    contributorPortal.hideAddResourceForm();
}

function loadMyResources() {
    contributorPortal.loadMyResources();
}

function closeContributorModal() {
    contributorPortal.closeContributorModal();
}

// Initialize contributor portal when DOM is loaded
let contributorPortal;
document.addEventListener('DOMContentLoaded', function() {
    contributorPortal = new ContributorPortal();
});
