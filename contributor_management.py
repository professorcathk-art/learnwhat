"""
Contributor Management System
貢獻者管理系統

提供貢獻者註冊、登錄、資源管理等功能
"""

import json
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from dataclasses import dataclass
import uuid
from learning_resources import LearningResourcesDB, Contributor, LearningResource, ResourceType, DifficultyLevel, ResourceStatus

@dataclass
class ContributorSession:
    """貢獻者會話"""
    session_id: str
    contributor_id: str
    expires_at: datetime
    created_at: datetime

class ContributorAuth:
    """貢獻者認證系統"""
    
    def __init__(self, db: LearningResourcesDB):
        self.db = db
        self.sessions: Dict[str, ContributorSession] = {}
        self.session_duration = timedelta(hours=24)
    
    def hash_password(self, password: str) -> str:
        """密碼哈希"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def generate_session_id(self) -> str:
        """生成會話ID"""
        return secrets.token_urlsafe(32)
    
    def register_contributor(self, name: str, email: str, password: str, 
                           expertise_areas: List[str], organization: str = "", 
                           bio: str = "") -> Dict:
        """註冊貢獻者"""
        try:
            # 檢查郵箱是否已存在
            existing = self.db.get_contributor_by_email(email)
            if existing:
                return {"success": False, "message": "郵箱已被註冊"}
            
            # 創建新貢獻者
            contributor = Contributor(
                id=str(uuid.uuid4()),
                name=name,
                email=email,
                expertise_areas=expertise_areas,
                organization=organization,
                bio=bio,
                is_verified=False,
                created_at=datetime.now().isoformat(),
                last_active=datetime.now().isoformat()
            )
            
            # 添加貢獻者到數據庫
            if self.db.add_contributor(contributor):
                # 這裡應該發送驗證郵件
                return {
                    "success": True, 
                    "message": "註冊成功，請檢查郵箱進行驗證",
                    "contributor_id": contributor.id
                }
            else:
                return {"success": False, "message": "註冊失敗"}
                
        except Exception as e:
            return {"success": False, "message": f"註冊錯誤: {str(e)}"}
    
    def login_contributor(self, email: str, password: str) -> Dict:
        """貢獻者登錄"""
        try:
            # 獲取貢獻者信息
            contributor = self.db.get_contributor_by_email(email)
            if not contributor:
                return {"success": False, "message": "用戶不存在"}
            
            # 驗證密碼（這裡簡化處理，實際應該存儲哈希密碼）
            # 在實際應用中，應該存儲密碼哈希並進行驗證
            
            # 創建會話
            session_id = self.generate_session_id()
            session = ContributorSession(
                session_id=session_id,
                contributor_id=contributor.id,
                expires_at=datetime.now() + self.session_duration,
                created_at=datetime.now()
            )
            
            self.sessions[session_id] = session
            
            # 更新最後活躍時間
            self.db.update_contributor_last_active(contributor.id)
            
            return {
                "success": True,
                "message": "登錄成功",
                "session_id": session_id,
                "contributor": {
                    "id": contributor.id,
                    "name": contributor.name,
                    "email": contributor.email,
                    "expertise_areas": contributor.expertise_areas,
                    "organization": contributor.organization,
                    "is_verified": contributor.is_verified
                }
            }
            
        except Exception as e:
            return {"success": False, "message": f"登錄錯誤: {str(e)}"}
    
    def verify_session(self, session_id: str) -> Optional[Contributor]:
        """驗證會話"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        if datetime.now() > session.expires_at:
            del self.sessions[session_id]
            return None
        
        return self.db.get_contributor(session.contributor_id)
    
    def logout_contributor(self, session_id: str) -> bool:
        """登出貢獻者"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

class ContributorResourceManager:
    """貢獻者資源管理器"""
    
    def __init__(self, db: LearningResourcesDB, auth: ContributorAuth):
        self.db = db
        self.auth = auth
    
    def add_resource(self, session_id: str, resource_data: Dict) -> Dict:
        """添加學習資源"""
        contributor = self.auth.verify_session(session_id)
        if not contributor:
            return {"success": False, "message": "未授權訪問"}
        
        try:
            # 創建學習資源
            resource = LearningResource(
                id=str(uuid.uuid4()),
                title=resource_data["title"],
                description=resource_data["description"],
                url=resource_data["url"],
                resource_type=ResourceType(resource_data["resource_type"]),
                difficulty=DifficultyLevel(resource_data["difficulty"]),
                duration=resource_data.get("duration", ""),
                cost=resource_data.get("cost", "Free"),
                language=resource_data.get("language", "en"),
                provider=resource_data.get("provider", ""),
                author=resource_data.get("author", contributor.name),
                hashtags=resource_data.get("hashtags", []),
                prerequisites=resource_data.get("prerequisites", []),
                learning_outcomes=resource_data.get("learning_outcomes", []),
                target_audience=resource_data.get("target_audience", ""),
                created_by=contributor.id,
                status=ResourceStatus.PENDING_REVIEW,  # 新資源需要審核
                priority_score=resource_data.get("priority_score", 1.0)
            )
            
            if self.db.add_learning_resource(resource):
                return {
                    "success": True,
                    "message": "資源添加成功，等待審核",
                    "resource_id": resource.id
                }
            else:
                return {"success": False, "message": "資源添加失敗"}
                
        except Exception as e:
            return {"success": False, "message": f"添加資源錯誤: {str(e)}"}
    
    def update_resource(self, session_id: str, resource_id: str, resource_data: Dict) -> Dict:
        """更新學習資源"""
        contributor = self.auth.verify_session(session_id)
        if not contributor:
            return {"success": False, "message": "未授權訪問"}
        
        # 檢查資源是否屬於該貢獻者
        resource = self.db.get_learning_resource(resource_id)
        if not resource or resource.created_by != contributor.id:
            return {"success": False, "message": "無權限修改此資源"}
        
        try:
            # 更新資源信息
            updated_resource = LearningResource(
                id=resource.id,
                title=resource_data.get("title", resource.title),
                description=resource_data.get("description", resource.description),
                url=resource_data.get("url", resource.url),
                resource_type=ResourceType(resource_data.get("resource_type", resource.resource_type.value)),
                difficulty=DifficultyLevel(resource_data.get("difficulty", resource.difficulty.value)),
                duration=resource_data.get("duration", resource.duration),
                cost=resource_data.get("cost", resource.cost),
                language=resource_data.get("language", resource.language),
                provider=resource_data.get("provider", resource.provider),
                author=resource_data.get("author", resource.author),
                rating=resource.rating,
                review_count=resource.review_count,
                hashtags=resource_data.get("hashtags", resource.hashtags),
                prerequisites=resource_data.get("prerequisites", resource.prerequisites),
                learning_outcomes=resource_data.get("learning_outcomes", resource.learning_outcomes),
                target_audience=resource_data.get("target_audience", resource.target_audience),
                last_updated=datetime.now().isoformat(),
                created_by=resource.created_by,
                status=ResourceStatus.PENDING_REVIEW,  # 更新後需要重新審核
                priority_score=resource_data.get("priority_score", resource.priority_score),
                ai_relevance_score=resource.ai_relevance_score
            )
            
            if self.db.update_learning_resource(updated_resource):
                return {
                    "success": True,
                    "message": "資源更新成功，等待審核"
                }
            else:
                return {"success": False, "message": "資源更新失敗"}
                
        except Exception as e:
            return {"success": False, "message": f"更新資源錯誤: {str(e)}"}
    
    def get_my_resources(self, session_id: str) -> Dict:
        """獲取我的資源列表"""
        contributor = self.auth.verify_session(session_id)
        if not contributor:
            return {"success": False, "message": "未授權訪問"}
        
        try:
            resources = self.db.get_resources_by_contributor(contributor.id)
            return {
                "success": True,
                "resources": [
                    {
                        "id": r.id,
                        "title": r.title,
                        "description": r.description,
                        "url": r.url,
                        "resource_type": r.resource_type.value,
                        "difficulty": r.difficulty.value,
                        "status": r.status.value,
                        "priority_score": r.priority_score,
                        "last_updated": r.last_updated
                    }
                    for r in resources
                ]
            }
        except Exception as e:
            return {"success": False, "message": f"獲取資源列表錯誤: {str(e)}"}
    
    def delete_resource(self, session_id: str, resource_id: str) -> Dict:
        """刪除學習資源"""
        contributor = self.auth.verify_session(session_id)
        if not contributor:
            return {"success": False, "message": "未授權訪問"}
        
        # 檢查資源是否屬於該貢獻者
        resource = self.db.get_learning_resource(resource_id)
        if not resource or resource.created_by != contributor.id:
            return {"success": False, "message": "無權限刪除此資源"}
        
        try:
            if self.db.delete_learning_resource(resource_id):
                return {"success": True, "message": "資源刪除成功"}
            else:
                return {"success": False, "message": "資源刪除失敗"}
        except Exception as e:
            return {"success": False, "message": f"刪除資源錯誤: {str(e)}"}

# 擴展數據庫類以支持新功能
class ExtendedLearningResourcesDB(LearningResourcesDB):
    """擴展的學習資源數據庫"""
    
    def get_contributor_by_email(self, email: str) -> Optional[Contributor]:
        """根據郵箱獲取貢獻者"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM contributors WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return Contributor(
                id=row[0],
                name=row[1],
                email=row[2],
                expertise_areas=json.loads(row[3]) if row[3] else [],
                organization=row[4] or "",
                bio=row[5] or "",
                is_verified=bool(row[6]),
                created_at=row[7],
                last_active=row[8]
            )
        return None
    
    def update_contributor_last_active(self, contributor_id: str) -> bool:
        """更新貢獻者最後活躍時間"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE contributors 
                SET last_active = ?
                WHERE id = ?
            ''', (datetime.now().isoformat(), contributor_id))
            
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False
    
    def get_resources_by_contributor(self, contributor_id: str) -> List[LearningResource]:
        """獲取貢獻者的所有資源"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM learning_resources 
            WHERE created_by = ?
            ORDER BY last_updated DESC
        ''', (contributor_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        resources = []
        for row in rows:
            resources.append(LearningResource(
                id=row[0],
                title=row[1],
                description=row[2],
                url=row[3],
                resource_type=ResourceType(row[4]),
                difficulty=DifficultyLevel(row[5]),
                duration=row[6],
                cost=row[7],
                language=row[8],
                provider=row[9],
                author=row[10],
                rating=row[11],
                review_count=row[12],
                hashtags=json.loads(row[13]) if row[13] else [],
                prerequisites=json.loads(row[14]) if row[14] else [],
                learning_outcomes=json.loads(row[15]) if row[15] else [],
                target_audience=row[16],
                last_updated=row[17],
                created_by=row[18],
                status=ResourceStatus(row[19]),
                priority_score=row[20],
                ai_relevance_score=row[21]
            ))
        
        return resources
    
    def update_learning_resource(self, resource: LearningResource) -> bool:
        """更新學習資源"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE learning_resources 
                SET title = ?, description = ?, url = ?, resource_type = ?, 
                    difficulty = ?, duration = ?, cost = ?, language = ?, 
                    provider = ?, author = ?, hashtags = ?, prerequisites = ?, 
                    learning_outcomes = ?, target_audience = ?, last_updated = ?, 
                    status = ?, priority_score = ?, ai_relevance_score = ?
                WHERE id = ?
            ''', (
                resource.title, resource.description, resource.url, resource.resource_type.value,
                resource.difficulty.value, resource.duration, resource.cost, resource.language,
                resource.provider, resource.author, json.dumps(resource.hashtags),
                json.dumps(resource.prerequisites), json.dumps(resource.learning_outcomes),
                resource.target_audience, resource.last_updated, resource.status.value,
                resource.priority_score, resource.ai_relevance_score, resource.id
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False
    
    def delete_learning_resource(self, resource_id: str) -> bool:
        """刪除學習資源"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM learning_resources WHERE id = ?', (resource_id,))
            
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False

# 示例使用
if __name__ == "__main__":
    # 初始化系統
    db = ExtendedLearningResourcesDB()
    auth = ContributorAuth(db)
    manager = ContributorResourceManager(db, auth)
    
    # 註冊貢獻者
    result = auth.register_contributor(
        name="李四",
        email="lisi@example.com",
        password="password123",
        expertise_areas=["Web Development", "JavaScript", "React"],
        organization="前端開發公司",
        bio="資深前端開發工程師"
    )
    
    print("註冊結果:", result)
    
    # 登錄
    login_result = auth.login_contributor("lisi@example.com", "password123")
    print("登錄結果:", login_result)
    
    if login_result["success"]:
        session_id = login_result["session_id"]
        
        # 添加資源
        resource_data = {
            "title": "React 進階開發課程",
            "description": "深入學習React高級特性，包括Hooks、Context、性能優化等",
            "url": "https://example.com/react-advanced",
            "resource_type": "course",
            "difficulty": 3,
            "duration": "6 weeks",
            "cost": "Paid ($199)",
            "provider": "前端開發公司",
            "hashtags": ["react", "javascript", "frontend", "hooks"],
            "prerequisites": ["JavaScript基礎", "React基礎"],
            "learning_outcomes": ["掌握React高級特性", "能夠優化React應用性能"],
            "target_audience": "有React基礎的開發者",
            "priority_score": 2.5
        }
        
        add_result = manager.add_resource(session_id, resource_data)
        print("添加資源結果:", add_result)
        
        # 獲取我的資源
        my_resources = manager.get_my_resources(session_id)
        print("我的資源:", my_resources)
