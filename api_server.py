"""
API Server for Prioritised Learning Resources System
優先推薦學習資源系統的Web API服務器

提供RESTful API接口供前端調用
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import asyncio
import json
from datetime import datetime
from typing import Dict, List
import uuid

from learning_resources import LearningResourcesDB, ResourceType, DifficultyLevel
from contributor_management import ContributorAuth, ContributorResourceManager
from ai_integration import AIResourceRecommender, LearningPlanGenerator

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 在生產環境中應該使用更安全的密鑰

# Configure CORS to allow credentials from any origin
CORS(app, 
     origins=['*'],  # Allow all origins for development
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

# 初始化系統組件
db = LearningResourcesDB()
auth = ContributorAuth(db)
resource_manager = ContributorResourceManager(db, auth)
ai_recommender = AIResourceRecommender(db, "ce74038095d6469184af3b39e3eca7b3")  # 使用現有的API密鑰
plan_generator = LearningPlanGenerator(db, ai_recommender)

# 運行事件循環
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# ==================== 貢獻者管理API ====================

@app.route('/api/contributor/register', methods=['POST'])
def register_contributor():
    """註冊貢獻者"""
    try:
        data = request.get_json()
        
        result = auth.register_contributor(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            expertise_areas=data.get('expertise_areas', []),
            organization=data.get('organization', ''),
            bio=data.get('bio', '')
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"註冊錯誤: {str(e)}"}), 500

@app.route('/api/contributor/login', methods=['POST'])
def login_contributor():
    """貢獻者登錄"""
    try:
        data = request.get_json()
        
        result = auth.login_contributor(
            email=data['email'],
            password=data['password']
        )
        
        if result['success']:
            session['contributor_session'] = result['session_id']
            session['contributor_id'] = result['contributor']['id']
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"登錄錯誤: {str(e)}"}), 500

@app.route('/api/contributor/logout', methods=['POST'])
def logout_contributor():
    """貢獻者登錄"""
    try:
        session_id = session.get('contributor_session')
        if session_id:
            auth.logout_contributor(session_id)
            session.pop('contributor_session', None)
            session.pop('contributor_id', None)
        
        return jsonify({"success": True, "message": "登錄成功"})
    except Exception as e:
        return jsonify({"success": False, "message": f"登錄錯誤: {str(e)}"}), 500

@app.route('/api/contributor/profile', methods=['GET'])
def get_contributor_profile():
    """獲取貢獻者資料"""
    try:
        session_id = session.get('contributor_session')
        if not session_id:
            return jsonify({"success": False, "message": "未登錄"}), 401
        
        contributor = auth.verify_session(session_id)
        if not contributor:
            return jsonify({"success": False, "message": "會話已過期"}), 401
        
        return jsonify({
            "success": True,
            "contributor": {
                "id": contributor.id,
                "name": contributor.name,
                "email": contributor.email,
                "expertise_areas": contributor.expertise_areas,
                "organization": contributor.organization,
                "bio": contributor.bio,
                "is_verified": contributor.is_verified,
                "created_at": contributor.created_at,
                "last_active": contributor.last_active
            }
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"獲取資料錯誤: {str(e)}"}), 500

# ==================== 資源管理API ====================

@app.route('/api/resources', methods=['POST'])
def add_resource():
    """添加學習資源"""
    try:
        session_id = session.get('contributor_session')
        if not session_id:
            return jsonify({"success": False, "message": "未登錄"}), 401
        
        data = request.get_json()
        result = resource_manager.add_resource(session_id, data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"添加資源錯誤: {str(e)}"}), 500

@app.route('/api/resources/<resource_id>', methods=['PUT'])
def update_resource(resource_id):
    """更新學習資源"""
    try:
        session_id = session.get('contributor_session')
        if not session_id:
            return jsonify({"success": False, "message": "未登錄"}), 401
        
        data = request.get_json()
        result = resource_manager.update_resource(session_id, resource_id, data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"更新資源錯誤: {str(e)}"}), 500

@app.route('/api/resources/<resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    """刪除學習資源"""
    try:
        session_id = session.get('contributor_session')
        if not session_id:
            return jsonify({"success": False, "message": "未登錄"}), 401
        
        result = resource_manager.delete_resource(session_id, resource_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"刪除資源錯誤: {str(e)}"}), 500

@app.route('/api/resources/my', methods=['GET'])
def get_my_resources():
    """獲取我的資源列表"""
    try:
        session_id = session.get('contributor_session')
        if not session_id:
            return jsonify({"success": False, "message": "未登錄"}), 401
        
        result = resource_manager.get_my_resources(session_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"獲取資源列表錯誤: {str(e)}"}), 500

@app.route('/api/resources/search', methods=['GET'])
def search_resources():
    """搜索學習資源"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 10))
        
        if query:
            resources = db.semantic_search(query, limit)
        else:
            resources = db.get_all_resources(limit)
        
        result = []
        for resource in resources:
            result.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "url": resource.url,
                "resource_type": resource.resource_type.value,
                "difficulty": resource.difficulty.value,
                "duration": resource.duration,
                "cost": resource.cost,
                "provider": resource.provider,
                "author": resource.author,
                "rating": resource.rating,
                "hashtags": resource.hashtags,
                "learning_outcomes": resource.learning_outcomes,
                "priority_score": resource.priority_score,
                "ai_relevance_score": resource.ai_relevance_score,
                "last_updated": resource.last_updated
            })
        
        return jsonify({
            "success": True,
            "resources": result,
            "total": len(result)
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"搜索錯誤: {str(e)}"}), 500

# ==================== AI推薦API ====================

@app.route('/api/ai/recommend', methods=['POST'])
def get_ai_recommendations():
    """獲取AI推薦的學習資源"""
    try:
        data = request.get_json()
        
        # 運行異步函數
        recommendations = loop.run_until_complete(
            ai_recommender.get_ai_recommendations(
                user_description=data['description'],
                topic=data['topic'],
                level=data['level'],
                duration=data['duration'],
                intensity=data['intensity'],
                materials=data['materials']
            )
        )
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "total": len(recommendations),
            "curated_count": sum(1 for r in recommendations if r.get("isCurated", False)),
            "ai_count": sum(1 for r in recommendations if not r.get("isCurated", False))
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"AI推薦錯誤: {str(e)}"}), 500

@app.route('/api/ai/generate-plan', methods=['POST'])
def generate_learning_plan():
    """生成學習計劃"""
    try:
        data = request.get_json()
        
        # 運行異步函數
        result = loop.run_until_complete(
            plan_generator.generate_learning_plan(data)
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": f"生成學習計劃錯誤: {str(e)}"}), 500

# ==================== 數據庫管理API ====================

@app.route('/api/admin/resources', methods=['GET'])
def get_all_resources_admin():
    """管理員獲取所有資源"""
    try:
        # 這裡應該添加管理員權限檢查
        limit = int(request.args.get('limit', 100))
        resources = db.get_all_resources(limit)
        
        result = []
        for resource in resources:
            result.append({
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "url": resource.url,
                "resource_type": resource.resource_type.value,
                "difficulty": resource.difficulty.value,
                "status": resource.status.value,
                "priority_score": resource.priority_score,
                "ai_relevance_score": resource.ai_relevance_score,
                "created_by": resource.created_by,
                "last_updated": resource.last_updated
            })
        
        return jsonify({
            "success": True,
            "resources": result,
            "total": len(result)
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"獲取資源錯誤: {str(e)}"}), 500

@app.route('/api/admin/resources/<resource_id>/priority', methods=['PUT'])
def update_resource_priority(resource_id):
    """更新資源優先級"""
    try:
        # 這裡應該添加管理員權限檢查
        data = request.get_json()
        priority_score = data.get('priority_score', 1.0)
        
        success = db.update_resource_priority(resource_id, priority_score)
        
        if success:
            return jsonify({"success": True, "message": "優先級更新成功"})
        else:
            return jsonify({"success": False, "message": "優先級更新失敗"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": f"更新優先級錯誤: {str(e)}"}), 500

# ==================== 統計API ====================

@app.route('/api/stats/overview', methods=['GET'])
def get_stats_overview():
    """獲取系統統計概覽"""
    try:
        all_resources = db.get_all_resources(1000)  # 獲取更多資源用於統計
        
        stats = {
            "total_resources": len(all_resources),
            "active_resources": len([r for r in all_resources if r.status.value == "active"]),
            "pending_resources": len([r for r in all_resources if r.status.value == "pending_review"]),
            "resource_types": {},
            "difficulty_distribution": {},
            "top_providers": {},
            "recent_resources": []
        }
        
        # 統計資源類型
        for resource in all_resources:
            resource_type = resource.resource_type.value
            stats["resource_types"][resource_type] = stats["resource_types"].get(resource_type, 0) + 1
            
            # 統計難度分佈
            difficulty = resource.difficulty.value
            stats["difficulty_distribution"][difficulty] = stats["difficulty_distribution"].get(difficulty, 0) + 1
            
            # 統計提供商
            if resource.provider:
                stats["top_providers"][resource.provider] = stats["top_providers"].get(resource.provider, 0) + 1
        
        # 最近添加的資源
        recent_resources = sorted(all_resources, key=lambda x: x.last_updated, reverse=True)[:5]
        stats["recent_resources"] = [
            {
                "id": r.id,
                "title": r.title,
                "resource_type": r.resource_type.value,
                "provider": r.provider,
                "last_updated": r.last_updated
            }
            for r in recent_resources
        ]
        
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"獲取統計錯誤: {str(e)}"}), 500

# ==================== 健康檢查API ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康檢查"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

# ==================== 錯誤處理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "API端點不存在"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "服務器內部錯誤"}), 500

# ==================== 初始化示例數據 ====================

def init_sample_data():
    """初始化示例數據"""
    try:
        # 創建示例貢獻者
        contributor = {
            "id": str(uuid.uuid4()),
            "name": "AI專家",
            "email": "ai.expert@example.com",
            "expertise_areas": ["AI", "Machine Learning", "Python"],
            "organization": "AI研究院",
            "bio": "AI專家，專注於機器學習和深度學習"
        }
        
        # 添加貢獻者（如果不存在）
        existing = db.get_contributor_by_email(contributor["email"])
        if not existing:
            from contributor_management import Contributor
            contributor_obj = Contributor(
                id=contributor["id"],
                name=contributor["name"],
                email=contributor["email"],
                expertise_areas=contributor["expertise_areas"],
                organization=contributor["organization"],
                bio=contributor["bio"]
            )
            db.add_contributor(contributor_obj)
        
        # 創建示例資源
        sample_resources = [
            {
                "title": "深度學習基礎課程",
                "description": "從零開始學習深度學習，涵蓋神經網絡、CNN、RNN等核心概念",
                "url": "https://www.coursera.org/learn/neural-networks-deep-learning",
                "resource_type": "course",
                "difficulty": 2,
                "duration": "4 weeks",
                "cost": "Free",
                "provider": "Coursera",
                "author": "Andrew Ng",
                "hashtags": ["deep-learning", "neural-networks", "ai", "machine-learning"],
                "prerequisites": ["Python基礎", "線性代數"],
                "learning_outcomes": ["掌握深度學習基礎", "能夠構建神經網絡"],
                "target_audience": "有Python基礎的學習者",
                "priority_score": 2.5
            },
            {
                "title": "Python機器學習實戰",
                "description": "使用Python進行機器學習項目實戰，包括數據預處理、模型訓練和評估",
                "url": "https://www.udemy.com/course/machinelearning/",
                "resource_type": "course",
                "difficulty": 3,
                "duration": "6 weeks",
                "cost": "Paid ($99)",
                "provider": "Udemy",
                "author": "Jose Portilla",
                "hashtags": ["python", "machine-learning", "data-science", "scikit-learn"],
                "prerequisites": ["Python基礎", "統計學基礎"],
                "learning_outcomes": ["掌握機器學習算法", "能夠完成ML項目"],
                "target_audience": "有Python基礎的學習者",
                "priority_score": 2.0
            },
            {
                "title": "AI交易策略開發",
                "description": "學習如何使用AI和機器學習技術開發交易策略",
                "url": "https://www.coursera.org/learn/ai-for-trading",
                "resource_type": "course",
                "difficulty": 4,
                "duration": "8 weeks",
                "cost": "Paid ($79/month)",
                "provider": "Coursera",
                "author": "Georgia Tech",
                "hashtags": ["ai-trading", "algorithmic-trading", "finance", "machine-learning"],
                "prerequisites": ["Python進階", "金融基礎", "機器學習基礎"],
                "learning_outcomes": ["掌握AI交易策略", "能夠開發交易算法"],
                "target_audience": "有編程和金融背景的學習者",
                "priority_score": 3.0
            }
        ]
        
        # 添加示例資源
        for resource_data in sample_resources:
            from learning_resources import LearningResource, ResourceType, DifficultyLevel
            resource = LearningResource(
                id=str(uuid.uuid4()),
                title=resource_data["title"],
                description=resource_data["description"],
                url=resource_data["url"],
                resource_type=ResourceType(resource_data["resource_type"]),
                difficulty=DifficultyLevel(resource_data["difficulty"]),
                duration=resource_data["duration"],
                cost=resource_data["cost"],
                provider=resource_data["provider"],
                author=resource_data["author"],
                hashtags=resource_data["hashtags"],
                prerequisites=resource_data["prerequisites"],
                learning_outcomes=resource_data["learning_outcomes"],
                target_audience=resource_data["target_audience"],
                created_by=contributor["id"],
                priority_score=resource_data["priority_score"]
            )
            db.add_learning_resource(resource)
        
        print("✅ 示例數據初始化完成")
        
    except Exception as e:
        print(f"❌ 示例數據初始化失敗: {e}")

if __name__ == '__main__':
    # 初始化示例數據
    try:
        init_sample_data()
    except Exception as e:
        print(f"⚠️ 示例數據初始化跳過: {e}")
    
    # 啟動服務器
    print("🚀 啟動優先推薦學習資源系統API服務器...")
    print("📚 系統功能:")
    print("   - 貢獻者註冊/登錄")
    print("   - 學習資源管理")
    print("   - AI智能推薦")
    print("   - 學習計劃生成")
    print("   - 系統統計分析")
    print("\n🌐 API服務器運行在: http://localhost:5001")
    print("📖 API文檔: http://localhost:5001/api/health")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
