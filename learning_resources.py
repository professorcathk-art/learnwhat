"""
Prioritised Learning Resources Database System
優先推薦學習資源系統

這個系統提供：
1. 資源策展管理
2. 智能優先級
3. 語義檢索
4. AI增強推薦
5. 降級機制
"""

import json
import sqlite3
import hashlib
import re
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class ResourceType(Enum):
    COURSE = "course"
    BOOK = "book"
    VIDEO = "video"
    ARTICLE = "article"
    PROJECT = "project"
    TUTORIAL = "tutorial"
    PODCAST = "podcast"
    TOOL = "tool"
    DOCUMENTATION = "documentation"

class DifficultyLevel(Enum):
    BEGINNER = 1
    INTERMEDIATE = 2
    ADVANCED = 3
    EXPERT = 4
    MASTER = 5

class ResourceStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING_REVIEW = "pending_review"
    ARCHIVED = "archived"

@dataclass
class LearningResource:
    """學習資源數據模型"""
    id: str
    title: str
    description: str
    url: str
    resource_type: ResourceType
    difficulty: DifficultyLevel
    duration: str  # e.g., "2 weeks", "40 hours"
    cost: str  # e.g., "Free", "Paid ($99)", "Freemium"
    language: str = "en"
    provider: str = ""  # e.g., "Coursera", "YouTube", "GitHub"
    author: str = ""
    rating: float = 0.0  # 0-5 stars
    review_count: int = 0
    hashtags: List[str] = None
    prerequisites: List[str] = None
    learning_outcomes: List[str] = None
    target_audience: str = ""
    last_updated: str = ""
    created_by: str = ""  # contributor ID
    status: ResourceStatus = ResourceStatus.ACTIVE
    priority_score: float = 1.0  # 基礎優先級分數
    ai_relevance_score: float = 0.0  # AI計算的相關性分數
    
    def __post_init__(self):
        if self.hashtags is None:
            self.hashtags = []
        if self.prerequisites is None:
            self.prerequisites = []
        if self.learning_outcomes is None:
            self.learning_outcomes = []
        if not self.last_updated:
            self.last_updated = datetime.now().isoformat()

@dataclass
class Contributor:
    """貢獻者數據模型"""
    id: str
    name: str
    email: str
    expertise_areas: List[str]
    organization: str = ""
    bio: str = ""
    is_verified: bool = False
    created_at: str = ""
    last_active: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

class LearningResourcesDB:
    """學習資源數據庫管理系統"""
    
    def __init__(self, db_path: str = "learning_resources.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """初始化數據庫表結構"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 創建貢獻者表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contributors (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                expertise_areas TEXT,  -- JSON array
                organization TEXT,
                bio TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TEXT,
                last_active TEXT
            )
        ''')
        
        # 創建學習資源表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learning_resources (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT UNIQUE NOT NULL,
                resource_type TEXT NOT NULL,
                difficulty INTEGER NOT NULL,
                duration TEXT,
                cost TEXT,
                language TEXT DEFAULT 'en',
                provider TEXT,
                author TEXT,
                rating REAL DEFAULT 0.0,
                review_count INTEGER DEFAULT 0,
                hashtags TEXT,  -- JSON array
                prerequisites TEXT,  -- JSON array
                learning_outcomes TEXT,  -- JSON array
                target_audience TEXT,
                last_updated TEXT,
                created_by TEXT,
                status TEXT DEFAULT 'active',
                priority_score REAL DEFAULT 1.0,
                ai_relevance_score REAL DEFAULT 0.0,
                FOREIGN KEY (created_by) REFERENCES contributors (id)
            )
        ''')
        
        # 創建資源評分表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS resource_ratings (
                id TEXT PRIMARY KEY,
                resource_id TEXT,
                user_id TEXT,
                rating INTEGER CHECK(rating >= 1 AND rating <= 5),
                review_text TEXT,
                created_at TEXT,
                FOREIGN KEY (resource_id) REFERENCES learning_resources (id)
            )
        ''')
        
        # 創建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_hashtags ON learning_resources(hashtags)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_type ON learning_resources(resource_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON learning_resources(difficulty)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_status ON learning_resources(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_resources_priority ON learning_resources(priority_score)')
        
        conn.commit()
        conn.close()
    
    def add_contributor(self, contributor: Contributor) -> bool:
        """添加貢獻者"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO contributors 
                (id, name, email, expertise_areas, organization, bio, is_verified, created_at, last_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                contributor.id,
                contributor.name,
                contributor.email,
                json.dumps(contributor.expertise_areas),
                contributor.organization,
                contributor.bio,
                contributor.is_verified,
                contributor.created_at,
                contributor.last_active
            ))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def get_contributor(self, contributor_id: str) -> Optional[Contributor]:
        """獲取貢獻者信息"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM contributors WHERE id = ?', (contributor_id,))
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
    
    def add_learning_resource(self, resource: LearningResource) -> bool:
        """添加學習資源"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO learning_resources 
                (id, title, description, url, resource_type, difficulty, duration, cost,
                 language, provider, author, rating, review_count, hashtags, prerequisites,
                 learning_outcomes, target_audience, last_updated, created_by, status,
                 priority_score, ai_relevance_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                resource.id,
                resource.title,
                resource.description,
                resource.url,
                resource.resource_type.value,
                resource.difficulty.value,
                resource.duration,
                resource.cost,
                resource.language,
                resource.provider,
                resource.author,
                resource.rating,
                resource.review_count,
                json.dumps(resource.hashtags),
                json.dumps(resource.prerequisites),
                json.dumps(resource.learning_outcomes),
                resource.target_audience,
                resource.last_updated,
                resource.created_by,
                resource.status.value,
                resource.priority_score,
                resource.ai_relevance_score
            ))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False
    
    def get_learning_resource(self, resource_id: str) -> Optional[LearningResource]:
        """獲取學習資源"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM learning_resources WHERE id = ?', (resource_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return LearningResource(
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
            )
        return None
    
    def search_resources_by_hashtags(self, hashtags: List[str], limit: int = 10) -> List[LearningResource]:
        """根據hashtag搜索資源"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 構建搜索查詢
        hashtag_conditions = []
        params = []
        
        for hashtag in hashtags:
            hashtag_conditions.append("hashtags LIKE ?")
            params.append(f'%"{hashtag}"%')
        
        if hashtag_conditions:
            query = f'''
                SELECT * FROM learning_resources 
                WHERE status = 'active' AND ({' OR '.join(hashtag_conditions)})
                ORDER BY priority_score DESC, ai_relevance_score DESC
                LIMIT ?
            '''
            params.append(limit)
        else:
            query = '''
                SELECT * FROM learning_resources 
                WHERE status = 'active'
                ORDER BY priority_score DESC, ai_relevance_score DESC
                LIMIT ?
            '''
            params = [limit]
        
        cursor.execute(query, params)
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
    
    def semantic_search(self, query: str, limit: int = 10) -> List[LearningResource]:
        """語義搜索（基於標題和描述的文本匹配）"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 使用LIKE進行文本搜索
        search_terms = query.lower().split()
        conditions = []
        params = []
        
        for term in search_terms:
            conditions.append("(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(hashtags) LIKE ?)")
            params.extend([f'%{term}%', f'%{term}%', f'%{term}%'])
        
        if conditions:
            query_sql = f'''
                SELECT * FROM learning_resources 
                WHERE status = 'active' AND ({' OR '.join(conditions)})
                ORDER BY priority_score DESC, ai_relevance_score DESC
                LIMIT ?
            '''
            params.append(limit)
        else:
            query_sql = '''
                SELECT * FROM learning_resources 
                WHERE status = 'active'
                ORDER BY priority_score DESC, ai_relevance_score DESC
                LIMIT ?
            '''
            params = [limit]
        
        cursor.execute(query_sql, params)
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
    
    def calculate_relevance_score(self, resource: LearningResource, user_interests: List[str]) -> float:
        """計算資源與用戶興趣的相關性分數"""
        score = 0.0
        
        # 基於hashtag匹配
        for interest in user_interests:
            interest_lower = interest.lower()
            for hashtag in resource.hashtags:
                if interest_lower in hashtag.lower() or hashtag.lower() in interest_lower:
                    score += 1.0
        
        # 基於標題和描述匹配
        text_content = f"{resource.title} {resource.description}".lower()
        for interest in user_interests:
            if interest.lower() in text_content:
                score += 0.5
        
        # 基於學習成果匹配
        for outcome in resource.learning_outcomes:
            outcome_lower = outcome.lower()
            for interest in user_interests:
                if interest.lower() in outcome_lower:
                    score += 0.3
        
        return score
    
    def get_prioritized_resources(self, user_interests: List[str], 
                                resource_types: List[ResourceType] = None,
                                difficulty_levels: List[DifficultyLevel] = None,
                                limit: int = 10) -> List[LearningResource]:
        """獲取優先推薦的學習資源"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 構建查詢條件
        conditions = ["status = 'active'"]
        params = []
        
        if resource_types:
            type_conditions = []
            for rt in resource_types:
                type_conditions.append("resource_type = ?")
                params.append(rt.value)
            conditions.append(f"({' OR '.join(type_conditions)})")
        
        if difficulty_levels:
            diff_conditions = []
            for dl in difficulty_levels:
                diff_conditions.append("difficulty = ?")
                params.append(dl.value)
            conditions.append(f"({' OR '.join(diff_conditions)})")
        
        query = f'''
            SELECT * FROM learning_resources 
            WHERE {' AND '.join(conditions)}
            ORDER BY priority_score DESC, ai_relevance_score DESC
            LIMIT ?
        '''
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        resources = []
        for row in rows:
            resource = LearningResource(
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
            )
            
            # 計算相關性分數
            relevance_score = self.calculate_relevance_score(resource, user_interests)
            resource.ai_relevance_score = relevance_score
            resources.append(resource)
        
        # 按相關性分數排序
        resources.sort(key=lambda x: (x.ai_relevance_score, x.priority_score), reverse=True)
        
        return resources[:limit]
    
    def update_resource_priority(self, resource_id: str, priority_score: float) -> bool:
        """更新資源優先級分數"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE learning_resources 
                SET priority_score = ?, last_updated = ?
                WHERE id = ?
            ''', (priority_score, datetime.now().isoformat(), resource_id))
            
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False
    
    def get_all_resources(self, limit: int = 100) -> List[LearningResource]:
        """獲取所有資源（用於管理）"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM learning_resources 
            ORDER BY last_updated DESC
            LIMIT ?
        ''', (limit,))
        
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

# 示例使用
if __name__ == "__main__":
    # 初始化數據庫
    db = LearningResourcesDB()
    
    # 創建貢獻者
    contributor = Contributor(
        id=str(uuid.uuid4()),
        name="張三",
        email="zhangsan@example.com",
        expertise_areas=["AI", "Machine Learning", "Python"],
        organization="AI研究院",
        bio="AI專家，專注於機器學習和深度學習"
    )
    
    # 添加貢獻者
    db.add_contributor(contributor)
    
    # 創建學習資源
    resource = LearningResource(
        id=str(uuid.uuid4()),
        title="深度學習基礎課程",
        description="從零開始學習深度學習，涵蓋神經網絡、CNN、RNN等核心概念",
        url="https://example.com/deep-learning-course",
        resource_type=ResourceType.COURSE,
        difficulty=DifficultyLevel.INTERMEDIATE,
        duration="8 weeks",
        cost="Free",
        provider="AI研究院",
        author="張三",
        hashtags=["deep-learning", "neural-networks", "ai", "machine-learning"],
        prerequisites=["Python基礎", "線性代數"],
        learning_outcomes=["掌握深度學習基礎", "能夠構建神經網絡"],
        target_audience="有Python基礎的學習者",
        created_by=contributor.id,
        priority_score=2.0
    )
    
    # 添加學習資源
    db.add_learning_resource(resource)
    
    # 搜索資源
    results = db.get_prioritized_resources(
        user_interests=["AI", "機器學習"],
        limit=5
    )
    
    print(f"找到 {len(results)} 個相關資源")
    for r in results:
        print(f"- {r.title} (相關性: {r.ai_relevance_score:.2f})")
