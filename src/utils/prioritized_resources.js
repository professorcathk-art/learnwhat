/**
 * Prioritized Learning Resources Integration
 * 優先推薦學習資源系統整合
 * 
 * 整合優先推薦學習資源系統與現有的學習計劃生成功能
 */

class PrioritizedResourcesManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api'; // 在生產環境中應該使用實際的API URL
        this.isApiAvailable = false;
        this.fallbackMode = true;
    }

    /**
     * 檢查API服務器是否可用
     */
    async checkApiHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.isApiAvailable = true;
                this.fallbackMode = false;
                console.log('✅ 優先推薦學習資源API服務器可用');
                return true;
            }
        } catch (error) {
            console.log('⚠️ 優先推薦學習資源API服務器不可用，使用降級模式');
            this.isApiAvailable = false;
            this.fallbackMode = true;
        }
        return false;
    }

    /**
     * 獲取AI推薦的學習資源（優先使用策展資源庫）
     */
    async getAIGeneratedMaterials() {
        console.log('🤖 使用優先推薦學習資源系統...');
        
        // 檢查API是否可用
        if (!this.isApiAvailable) {
            await this.checkApiHealth();
        }

        if (this.fallbackMode) {
            console.log('📚 使用降級模式：返回現有fallback材料');
            return this.getFallbackMaterials();
        }

        try {
            // 構建請求數據
            const requestData = {
                description: this.learningPlan.description,
                topic: this.learningPlan.topic,
                level: this.learningPlan.level,
                duration: this.learningPlan.duration,
                intensity: this.learningPlan.intensity,
                materials: this.learningPlan.materials
            };

            console.log('📤 發送AI推薦請求:', requestData);

            const response = await fetch(`${this.apiBaseUrl}/ai/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 AI推薦響應:', data);

            if (data.success) {
                const recommendations = data.recommendations;
                console.log(`🎯 獲取到 ${recommendations.length} 個推薦資源`);
                console.log(`📊 策展資源: ${data.curated_count} 個`);
                console.log(`🤖 AI推薦資源: ${data.ai_count} 個`);

                // 轉換為現有格式
                return recommendations.map(rec => ({
                    title: rec.title,
                    type: rec.type,
                    description: rec.description,
                    duration: rec.duration,
                    difficulty: rec.difficulty,
                    url: rec.url,
                    icon: rec.icon,
                    relevanceScore: rec.relevanceScore,
                    learningOutcome: rec.learningOutcome,
                    prerequisites: rec.prerequisites || [],
                    levels: ['all'],
                    category: this.mapTypeToCategory(rec.type),
                    aiGenerated: true,
                    isCurated: rec.isCurated || false,
                    priorityScore: rec.priorityScore || 1.0,
                    provider: rec.provider || 'Unknown',
                    author: rec.author || 'Unknown'
                }));
            } else {
                throw new Error(data.message || 'AI推薦失敗');
            }

        } catch (error) {
            console.error('❌ 優先推薦系統錯誤:', error);
            console.log('🔄 降級到fallback材料');
            return this.getFallbackMaterials();
        }
    }

    /**
     * 生成學習計劃（使用優先推薦系統）
     */
    async generateLearningPlanWithPrioritizedResources() {
        console.log('🚀 使用優先推薦系統生成學習計劃...');
        
        if (!this.isApiAvailable) {
            await this.checkApiHealth();
        }

        if (this.fallbackMode) {
            console.log('📚 使用降級模式：調用現有生成方法');
            return this.generateLearningPlanTable();
        }

        try {
            // 構建請求數據
            const requestData = {
                description: this.learningPlan.description,
                topic: this.learningPlan.topic,
                level: this.learningPlan.level,
                duration: this.learningPlan.duration,
                intensity: this.learningPlan.intensity,
                materials: this.learningPlan.materials
            };

            console.log('📤 發送學習計劃生成請求:', requestData);

            const response = await fetch(`${this.apiBaseUrl}/ai/generate-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 學習計劃生成響應:', data);

            if (data.success) {
                // 更新學習計劃數據
                this.learningPlan.materials = data.materials;
                this.dailyPlan = data.daily_plan;

                console.log(`✅ 學習計劃生成成功！`);
                console.log(`📊 策展資源: ${data.curated_count} 個`);
                console.log(`🤖 AI推薦資源: ${data.ai_count} 個`);
                console.log(`📅 總學習天數: ${data.total_days} 天`);

                // 顯示學習計劃表格
                this.displayLearningTable(this.dailyPlan);

                // 顯示優先推薦統計
                this.displayPrioritizedStats(data);

                return true;
            } else {
                throw new Error(data.error || '學習計劃生成失敗');
            }

        } catch (error) {
            console.error('❌ 優先推薦學習計劃生成錯誤:', error);
            console.log('🔄 降級到現有生成方法');
            return this.generateLearningPlanTable();
        }
    }

    /**
     * 顯示優先推薦統計信息
     */
    displayPrioritizedStats(data) {
        const statsContainer = document.getElementById('prioritizedStats');
        if (!statsContainer) {
            // 創建統計容器
            const newStatsContainer = document.createElement('div');
            newStatsContainer.id = 'prioritizedStats';
            newStatsContainer.className = 'prioritized-stats';
            newStatsContainer.innerHTML = `
                <div class="stats-header">
                    <h3><i class="fas fa-star"></i> 優先推薦統計</h3>
                </div>
                <div class="stats-content">
                    <div class="stat-item">
                        <span class="stat-label">策展資源:</span>
                        <span class="stat-value curated">${data.curated_count} 個</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">AI推薦:</span>
                        <span class="stat-value ai">${data.ai_count} 個</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">總資源:</span>
                        <span class="stat-value total">${data.curated_count + data.ai_count} 個</span>
                    </div>
                </div>
            `;
            
            // 插入到學習計劃表格之前
            const learningTable = document.getElementById('learningTable');
            if (learningTable && learningTable.parentNode) {
                learningTable.parentNode.insertBefore(newStatsContainer, learningTable);
            }
        } else {
            // 更新現有統計
            const curatedCount = statsContainer.querySelector('.curated');
            const aiCount = statsContainer.querySelector('.ai');
            const totalCount = statsContainer.querySelector('.total');
            
            if (curatedCount) curatedCount.textContent = `${data.curated_count} 個`;
            if (aiCount) aiCount.textContent = `${data.ai_count} 個`;
            if (totalCount) totalCount.textContent = `${data.curated_count + data.ai_count} 個`;
        }
    }

    /**
     * 在學習表格中顯示資源來源標記
     */
    displayLearningTable(dailyPlan) {
        const tableBody = document.getElementById('learningTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        dailyPlan.forEach(day => {
            const row = document.createElement('tr');
            
            // 添加資源來源標記
            const sourceIcon = day.isCurated ? 
                '<i class="fas fa-star curated-resource" title="策展資源"></i>' : 
                '<i class="fas fa-robot ai-resource" title="AI推薦"></i>';
            
            row.innerHTML = `
                <td class="day-cell">${day.day}</td>
                <td class="material-cell">
                    ${sourceIcon}
                    <strong>${day.title}</strong>
                    <br><small>${day.description}</small>
                </td>
                <td class="type-cell">${day.type}</td>
                <td class="duration-cell">${day.duration}</td>
                <td class="difficulty-cell">${this.generateDifficultyDots(day.difficulty)}</td>
                <td class="action-cell">
                    <a href="${day.url}" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fas fa-external-link-alt"></i> 開始學習
                    </a>
                    <label class="checkbox-container">
                        <input type="checkbox" onchange="app.toggleMaterialStatus(${day.day})">
                        <span class="checkmark"></span>
                    </label>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // 更新進度條
        this.updateProgressBar();
    }

    /**
     * 映射資源類型到類別
     */
    mapTypeToCategory(type) {
        const typeMapping = {
            'Course': 'online-courses',
            'Book': 'books',
            'Video': 'videos',
            'Article': 'articles',
            'Project': 'projects',
            'Tutorial': 'tutorials',
            'Podcast': 'podcasts',
            'Tool': 'tools',
            'Documentation': 'documentation'
        };
        return typeMapping[type] || 'other';
    }

    /**
     * 獲取fallback材料（當API不可用時）
     */
    getFallbackMaterials() {
        // 返回現有的fallback材料
        return [
            {
                title: "Machine Learning Course - Stanford University",
                type: "Course",
                description: "Comprehensive machine learning course by Andrew Ng covering supervised learning, unsupervised learning, and best practices.",
                duration: "11 weeks",
                difficulty: 3,
                url: "https://www.coursera.org/learn/machine-learning",
                icon: "fas fa-graduation-cap",
                relevanceScore: 8,
                learningOutcome: "Master machine learning fundamentals and algorithms",
                prerequisites: ["Linear algebra", "Statistics basics"],
                levels: ['all'],
                category: 'online-courses',
                aiGenerated: false,
                isCurated: false,
                priorityScore: 1.0,
                provider: 'Coursera',
                author: 'Andrew Ng'
            },
            {
                title: "Python for Data Science - IBM",
                type: "Course",
                description: "Learn Python programming for data science, including pandas, numpy, and data visualization.",
                duration: "5 weeks",
                difficulty: 2,
                url: "https://www.coursera.org/learn/python-for-applied-data-science-ai",
                icon: "fas fa-code",
                relevanceScore: 7,
                learningOutcome: "Proficient in Python for data analysis",
                prerequisites: ["Basic programming knowledge"],
                levels: ['all'],
                category: 'online-courses',
                aiGenerated: false,
                isCurated: false,
                priorityScore: 1.0,
                provider: 'Coursera',
                author: 'IBM'
            }
        ];
    }

    /**
     * 生成難度點
     */
    generateDifficultyDots(difficulty) {
        const dots = [];
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= difficulty;
            dots.push(`<span class="difficulty-dot ${isActive ? 'active' : ''}"></span>`);
        }
        return dots.join('');
    }

    /**
     * 更新進度條
     */
    updateProgressBar() {
        const checkboxes = document.querySelectorAll('#learningTableBody input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('#learningTableBody input[type="checkbox"]:checked');
        const progress = checkboxes.length > 0 ? (checkedBoxes.length / checkboxes.length) * 100 : 0;
        
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${checkedBoxes.length}/${checkboxes.length} 完成`;
        }
    }
}

// 擴展現有的LearnWhatApp類
if (typeof LearnWhatApp !== 'undefined') {
    // 創建優先推薦資源管理器實例
    const prioritizedManager = new PrioritizedResourcesManager();
    
    // 重寫getAIGeneratedMaterials方法
    LearnWhatApp.prototype.getAIGeneratedMaterials = async function() {
        return await prioritizedManager.getAIGeneratedMaterials.call(this);
    };
    
    // 重寫generateLearningPlanTable方法
    LearnWhatApp.prototype.generateLearningPlanTable = async function() {
        return await prioritizedManager.generateLearningPlanWithPrioritizedResources.call(this);
    };
    
    // 重寫displayLearningTable方法
    LearnWhatApp.prototype.displayLearningTable = function(dailyPlan) {
        return prioritizedManager.displayLearningTable.call(this, dailyPlan);
    };
    
    console.log('✅ 優先推薦學習資源系統已整合到LearnWhatApp');
} else {
    console.log('⚠️ LearnWhatApp未找到，優先推薦系統將在應用初始化後整合');
}

// 導出管理器供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrioritizedResourcesManager;
}
