"""
AI Integration System
AI整合系統

整合優先推薦學習資源系統與AI生成學習計劃
"""

import json
import asyncio
import aiohttp
from typing import List, Dict, Optional, Tuple
from dataclasses import asdict
from learning_resources import (
    LearningResourcesDB, LearningResource, ResourceType, 
    DifficultyLevel, ResourceStatus
)
from contributor_management import ExtendedLearningResourcesDB

class AIResourceRecommender:
    """AI資源推薦系統"""
    
    def __init__(self, db: ExtendedLearningResourcesDB, api_key: str):
        self.db = db
        self.api_key = api_key
        self.api_url = "https://api.aimlapi.com/v1/chat/completions"
    
    async def get_ai_recommendations(self, user_description: str, 
                                   topic: str, level: str, duration: int,
                                   intensity: str, materials: List[str]) -> List[Dict]:
        """獲取AI推薦的學習資源"""
        
        # 首先從數據庫獲取相關資源
        db_resources = await self.get_database_resources(user_description, topic, level)
        
        # 構建AI提示
        prompt = self.create_ai_prompt(user_description, topic, level, duration, intensity, materials, db_resources)
        
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "perplexity/sonar-pro",
                    "messages": [
                        {
                            "role": "system",
                            "content": """你是一個專業的學習顧問。你的任務是分析用戶的學習目標，並從提供的策展資源庫中選擇最相關的學習資源。

優先級順序：
1. 首先從策展資源庫中選擇最相關的資源
2. 如果策展資源庫沒有足夠的相關資源，再建議其他高質量資源
3. 確保所有推薦的資源都是真實、可訪問的

返回格式：只返回JSON數組，不要包含markdown代碼塊。"""
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "top_p": 0.7,
                    "frequency_penalty": 1,
                    "max_tokens": 2000,
                    "top_k": 50
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                
                async with session.post(self.api_url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        # 清理JSON內容
                        json_content = self.clean_json_content(content)
                        
                        # 解析AI推薦
                        ai_recommendations = json.loads(json_content)
                        
                        # 合併數據庫資源和AI推薦
                        final_recommendations = await self.merge_recommendations(
                            db_resources, ai_recommendations, user_description
                        )
                        
                        return final_recommendations
                    else:
                        print(f"AI API錯誤: {response.status}")
                        return await self.get_fallback_recommendations(db_resources, user_description)
                        
        except Exception as e:
            print(f"AI API調用錯誤: {e}")
            return await self.get_fallback_recommendations(db_resources, user_description)
    
    async def get_database_resources(self, user_description: str, topic: str, level: str) -> List[LearningResource]:
        """從數據庫獲取相關資源"""
        # 提取用戶興趣關鍵詞
        interests = self.extract_interests(user_description, topic)
        
        # 根據難度級別映射
        difficulty_mapping = {
            "beginner": [DifficultyLevel.BEGINNER],
            "intermediate": [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE],
            "advanced": [DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED],
            "expert": [DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT]
        }
        
        difficulty_levels = difficulty_mapping.get(level.lower(), [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE])
        
        # 獲取優先推薦的資源
        resources = self.db.get_prioritized_resources(
            user_interests=interests,
            difficulty_levels=difficulty_levels,
            limit=20
        )
        
        return resources
    
    def extract_interests(self, description: str, topic: str) -> List[str]:
        """提取用戶興趣關鍵詞"""
        interests = [topic.lower()]
        
        # 從描述中提取關鍵詞
        description_lower = description.lower()
        
        # 常見技術領域關鍵詞
        tech_keywords = [
            "ai", "artificial intelligence", "machine learning", "deep learning",
            "web development", "frontend", "backend", "full stack",
            "data science", "data analysis", "python", "javascript",
            "react", "vue", "angular", "node.js",
            "trading", "finance", "investment", "blockchain",
            "mobile development", "ios", "android", "flutter",
            "cloud computing", "aws", "azure", "docker", "kubernetes",
            "cybersecurity", "ethical hacking", "penetration testing",
            "game development", "unity", "unreal engine",
            "ui/ux", "design", "figma", "sketch"
        ]
        
        for keyword in tech_keywords:
            if keyword in description_lower:
                interests.append(keyword)
        
        return list(set(interests))  # 去重
    
    def create_ai_prompt(self, user_description: str, topic: str, level: str, 
                        duration: int, intensity: str, materials: List[str], 
                        db_resources: List[LearningResource]) -> str:
        """創建AI提示"""
        
        # 構建策展資源庫信息
        curated_resources_text = ""
        if db_resources:
            curated_resources_text = "\n\n策展資源庫（優先推薦）：\n"
            for i, resource in enumerate(db_resources[:10], 1):  # 只顯示前10個
                curated_resources_text += f"{i}. {resource.title}\n"
                curated_resources_text += f"   類型: {resource.resource_type.value}\n"
                curated_resources_text += f"   難度: {resource.difficulty.value}/5\n"
                curated_resources_text += f"   標籤: {', '.join(resource.hashtags)}\n"
                curated_resources_text += f"   描述: {resource.description}\n"
                curated_resources_text += f"   URL: {resource.url}\n"
                curated_resources_text += f"   優先級: {resource.priority_score}\n\n"
        
        prompt = f"""用戶學習目標分析：

用戶描述: "{user_description}"
主題領域: {topic}
技能水平: {level}
學習時長: {duration} 天
學習強度: {intensity}
偏好材料類型: {', '.join(materials)}

{curated_resources_text}

任務：
1. 仔細分析用戶的具體學習目標
2. 優先從策展資源庫中選擇最相關的資源（4-8個）
3. 如果策展資源庫資源不足，再補充其他高質量資源
4. 確保推薦的資源符合用戶的學習目標、水平和時間安排

返回格式：
只返回JSON數組，每個資源包含：
- title: 資源標題
- type: 資源類型 (Course/Book/Video/Article/Project/Tutorial/Podcast/Tool/Documentation)
- description: 簡要描述
- duration: 預計學習時間
- difficulty: 難度等級 (1-5)
- url: 資源URL（必須是真實可訪問的）
- icon: FontAwesome圖標類名
- relevanceScore: 相關性分數 (1-10)
- learningOutcome: 學習成果
- prerequisites: 前置要求
- isCurated: 是否來自策展資源庫 (true/false)
- priorityScore: 優先級分數

確保所有URL都是真實、可訪問的，不要生成虛假的URL。"""
        
        return prompt
    
    def clean_json_content(self, content: str) -> str:
        """清理JSON內容"""
        content = content.strip()
        if content.startswith('```json'):
            content = content.replace('```json', '').replace('```', '').strip()
        elif content.startswith('```'):
            content = content.replace('```', '').strip()
        return content
    
    async def merge_recommendations(self, db_resources: List[LearningResource], 
                                  ai_recommendations: List[Dict], 
                                  user_description: str) -> List[Dict]:
        """合併數據庫資源和AI推薦"""
        final_recommendations = []
        
        # 首先添加策展資源庫中的資源
        for resource in db_resources[:6]:  # 最多6個策展資源
            final_recommendations.append({
                "title": resource.title,
                "type": resource.resource_type.value.title(),
                "description": resource.description,
                "duration": resource.duration,
                "difficulty": resource.difficulty.value,
                "url": resource.url,
                "icon": self.get_icon_for_type(resource.resource_type),
                "relevanceScore": resource.ai_relevance_score,
                "learningOutcome": resource.learning_outcomes[0] if resource.learning_outcomes else "掌握相關技能",
                "prerequisites": resource.prerequisites,
                "isCurated": True,
                "priorityScore": resource.priority_score,
                "provider": resource.provider,
                "author": resource.author
            })
        
        # 添加AI推薦的資源（過濾掉重複的）
        existing_urls = {r["url"] for r in final_recommendations}
        
        for ai_rec in ai_recommendations:
            if ai_rec.get("url") not in existing_urls and len(final_recommendations) < 8:
                # 驗證URL
                if self.is_valid_url(ai_rec.get("url", "")):
                    final_recommendations.append({
                        "title": ai_rec.get("title", ""),
                        "type": ai_rec.get("type", "Course"),
                        "description": ai_rec.get("description", ""),
                        "duration": ai_rec.get("duration", "1 week"),
                        "difficulty": ai_rec.get("difficulty", 2),
                        "url": ai_rec.get("url", ""),
                        "icon": ai_rec.get("icon", "fas fa-book"),
                        "relevanceScore": ai_rec.get("relevanceScore", 5),
                        "learningOutcome": ai_rec.get("learningOutcome", "掌握相關技能"),
                        "prerequisites": ai_rec.get("prerequisites", []),
                        "isCurated": False,
                        "priorityScore": 1.0,
                        "provider": "AI推薦",
                        "author": "AI系統"
                    })
        
        # 按相關性分數排序
        final_recommendations.sort(key=lambda x: (x["isCurated"], x["relevanceScore"]), reverse=True)
        
        return final_recommendations[:8]  # 最多8個資源
    
    async def get_fallback_recommendations(self, db_resources: List[LearningResource], 
                                         user_description: str) -> List[Dict]:
        """獲取降級推薦（當AI API不可用時）"""
        recommendations = []
        
        # 使用數據庫資源
        for resource in db_resources[:8]:
            recommendations.append({
                "title": resource.title,
                "type": resource.resource_type.value.title(),
                "description": resource.description,
                "duration": resource.duration,
                "difficulty": resource.difficulty.value,
                "url": resource.url,
                "icon": self.get_icon_for_type(resource.resource_type),
                "relevanceScore": resource.ai_relevance_score,
                "learningOutcome": resource.learning_outcomes[0] if resource.learning_outcomes else "掌握相關技能",
                "prerequisites": resource.prerequisites,
                "isCurated": True,
                "priorityScore": resource.priority_score,
                "provider": resource.provider,
                "author": resource.author
            })
        
        return recommendations
    
    def get_icon_for_type(self, resource_type: ResourceType) -> str:
        """根據資源類型獲取圖標"""
        icon_mapping = {
            ResourceType.COURSE: "fas fa-graduation-cap",
            ResourceType.BOOK: "fas fa-book",
            ResourceType.VIDEO: "fas fa-play-circle",
            ResourceType.ARTICLE: "fas fa-newspaper",
            ResourceType.PROJECT: "fas fa-project-diagram",
            ResourceType.TUTORIAL: "fas fa-chalkboard-teacher",
            ResourceType.PODCAST: "fas fa-podcast",
            ResourceType.TOOL: "fas fa-tools",
            ResourceType.DOCUMENTATION: "fas fa-file-alt"
        }
        return icon_mapping.get(resource_type, "fas fa-book")
    
    def is_valid_url(self, url: str) -> bool:
        """驗證URL是否有效"""
        if not url or not isinstance(url, str):
            return False
        
        # 檢查URL格式
        if not (url.startswith('http://') or url.startswith('https://')):
            return False
        
        # 檢查是否為虛假URL
        fake_patterns = [
            'example.com', 'placeholder', 'fake', 'test.com', 'demo.com',
            'sample.com', 'localhost', '127.0.0.1', '#', 'javascript:',
            'mailto:', 'tel:', 'data:', 'file:', 'ftp:'
        ]
        
        url_lower = url.lower()
        for pattern in fake_patterns:
            if pattern in url_lower:
                return False
        
        return len(url) > 10

class LearningPlanGenerator:
    """學習計劃生成器"""
    
    def __init__(self, db: ExtendedLearningResourcesDB, ai_recommender: AIResourceRecommender):
        self.db = db
        self.ai_recommender = ai_recommender
    
    async def generate_learning_plan(self, user_data: Dict) -> Dict:
        """生成學習計劃"""
        try:
            # 獲取AI推薦的資源
            recommendations = await self.ai_recommender.get_ai_recommendations(
                user_description=user_data["description"],
                topic=user_data["topic"],
                level=user_data["level"],
                duration=user_data["duration"],
                intensity=user_data["intensity"],
                materials=user_data["materials"]
            )
            
            # 生成每日學習計劃
            daily_plan = self.create_daily_plan(recommendations, user_data)
            
            return {
                "success": True,
                "materials": recommendations,
                "daily_plan": daily_plan,
                "total_days": user_data["duration"],
                "curated_count": sum(1 for r in recommendations if r.get("isCurated", False)),
                "ai_count": sum(1 for r in recommendations if not r.get("isCurated", False))
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "materials": [],
                "daily_plan": []
            }
    
    def create_daily_plan(self, materials: List[Dict], user_data: Dict) -> List[Dict]:
        """創建每日學習計劃"""
        daily_plan = []
        total_days = user_data["duration"]
        intensity = user_data["intensity"]
        
        # 計算每個資源的學習天數
        material_days = self.calculate_material_days(materials, total_days, intensity)
        
        current_day = 1
        
        # 分配資源到具體天數
        for material, days in material_days:
            for day in range(days):
                if current_day <= total_days:
                    daily_plan.append({
                        "day": current_day,
                        "title": material["title"],
                        "type": material["type"],
                        "description": material["description"],
                        "duration": material["duration"],
                        "difficulty": material["difficulty"],
                        "url": material["url"],
                        "icon": material["icon"],
                        "isCurated": material.get("isCurated", False),
                        "learningOutcome": material["learningOutcome"],
                        "prerequisites": material["prerequisites"]
                    })
                    current_day += 1
        
        # 填充剩餘天數
        while current_day <= total_days:
            activity = self.generate_learning_activity(current_day, total_days, user_data)
            daily_plan.append(activity)
            current_day += 1
        
        return daily_plan
    
    def calculate_material_days(self, materials: List[Dict], total_days: int, intensity: str) -> List[Tuple[Dict, int]]:
        """計算每個資源的學習天數"""
        if not materials:
            return []
        
        # 根據強度調整學習時間
        intensity_multiplier = {
            "light": 0.7,
            "moderate": 1.0,
            "intensive": 1.3
        }.get(intensity, 1.0)
        
        # 估算每個資源的學習天數
        material_days = []
        for material in materials:
            duration_text = material.get("duration", "1 week")
            estimated_days = self.parse_duration_to_days(duration_text)
            
            # 根據強度調整
            adjusted_days = max(1, int(estimated_days * intensity_multiplier))
            
            # 確保不超過總天數的1/3
            max_days = max(1, total_days // 3)
            final_days = min(adjusted_days, max_days)
            
            material_days.append((material, final_days))
        
        return material_days
    
    def parse_duration_to_days(self, duration: str) -> int:
        """解析持續時間為天數"""
        duration_lower = duration.lower()
        
        if "week" in duration_lower:
            weeks = int(''.join(filter(str.isdigit, duration_lower)) or 1)
            return weeks * 7
        elif "day" in duration_lower:
            return int(''.join(filter(str.isdigit, duration_lower)) or 1)
        elif "hour" in duration_lower:
            hours = int(''.join(filter(str.isdigit, duration_lower)) or 1)
            return max(1, hours // 2)  # 假設每天學習2小時
        else:
            return 3  # 默認3天
    
    def generate_learning_activity(self, current_day: int, total_days: int, user_data: Dict) -> Dict:
        """生成學習活動"""
        topic = user_data["topic"]
        description = user_data["description"]
        progress_percent = (current_day / total_days) * 100
        
        if current_day % 7 == 0:
            return {
                "day": current_day,
                "title": f"第{current_day//7}週里程碑: {topic}項目",
                "type": "Project",
                "description": f"創建一個實際項目來應用你學到的{topic}知識。這個項目應該與你的學習目標相關：\"{description}\"。",
                "duration": "2-3小時",
                "difficulty": 3,
                "url": "https://github.com/trending",
                "icon": "fas fa-project-diagram",
                "isCurated": False,
                "learningOutcome": "將理論知識應用到實際項目中",
                "prerequisites": []
            }
        elif current_day % 5 == 0:
            return {
                "day": current_day,
                "title": f"練習時間: {topic}實戰練習",
                "type": "Practice",
                "description": f"進行{topic}相關的實戰練習，專注於與你的學習目標相關的技能：\"{description}\"。",
                "duration": "1-2小時",
                "difficulty": 2,
                "url": "https://www.kaggle.com/learn",
                "icon": "fas fa-dumbbell",
                "isCurated": False,
                "learningOutcome": "通過練習鞏固所學知識",
                "prerequisites": []
            }
        elif current_day % 3 == 0:
            return {
                "day": current_day,
                "title": f"研究時間: {topic}最新趨勢",
                "type": "Research",
                "description": f"研究{topic}領域的最新發展和趨勢，特別關注與你的學習目標相關的內容：\"{description}\"。",
                "duration": "1小時",
                "difficulty": 2,
                "url": "https://medium.com/",
                "icon": "fas fa-search",
                "isCurated": False,
                "learningOutcome": "了解領域最新動態",
                "prerequisites": []
            }
        elif progress_percent > 80:
            return {
                "day": current_day,
                "title": f"進階學習: {topic}高級概念",
                "type": "Advanced Study",
                "description": f"深入學習{topic}的高級概念和技術，專注於幫助你實現學習目標的內容：\"{description}\"。",
                "duration": "1.5小時",
                "difficulty": 4,
                "url": "https://paperswithcode.com/",
                "icon": "fas fa-rocket",
                "isCurated": False,
                "learningOutcome": "掌握高級概念和技術",
                "prerequisites": []
            }
        elif progress_percent > 60:
            return {
                "day": current_day,
                "title": f"中級練習: {topic}進階練習",
                "type": "Practice",
                "description": f"進行{topic}的中級練習，專注於更複雜的問題，這些問題有助於實現你的學習目標：\"{description}\"。",
                "duration": "1.5小時",
                "difficulty": 3,
                "url": "https://leetcode.com/",
                "icon": "fas fa-cogs",
                "isCurated": False,
                "learningOutcome": "提升中級技能水平",
                "prerequisites": []
            }
        else:
            return {
                "day": current_day,
                "title": f"基礎建設: {topic}基礎知識",
                "type": "Study",
                "description": f"加強{topic}基礎知識，複習關鍵概念，這些概念將幫助你實現學習目標：\"{description}\"。",
                "duration": "1小時",
                "difficulty": 2,
                "url": "https://www.khanacademy.org/",
                "icon": "fas fa-book",
                "isCurated": False,
                "learningOutcome": "鞏固基礎知識",
                "prerequisites": []
            }

# 示例使用
async def main():
    # 初始化系統
    db = ExtendedLearningResourcesDB()
    ai_recommender = AIResourceRecommender(db, "your-api-key")
    generator = LearningPlanGenerator(db, ai_recommender)
    
    # 用戶數據
    user_data = {
        "description": "我想學習AI交易策略，包括機器學習在金融市場中的應用",
        "topic": "AI Trading",
        "level": "intermediate",
        "duration": 30,
        "intensity": "moderate",
        "materials": ["Course", "Video", "Project"]
    }
    
    # 生成學習計劃
    result = await generator.generate_learning_plan(user_data)
    
    if result["success"]:
        print(f"成功生成學習計劃！")
        print(f"策展資源: {result['curated_count']} 個")
        print(f"AI推薦資源: {result['ai_count']} 個")
        print(f"總學習天數: {result['total_days']} 天")
        
        print("\n推薦資源:")
        for i, material in enumerate(result["materials"], 1):
            curated_mark = "🎯" if material.get("isCurated") else "🤖"
            print(f"{i}. {curated_mark} {material['title']} ({material['type']})")
    else:
        print(f"生成學習計劃失敗: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main())
