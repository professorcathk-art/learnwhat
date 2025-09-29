# 優先推薦學習資源系統

## 系統概述

這是一個完整的優先推薦學習資源系統，讓AI在生成學習計劃時優先考慮策展的高質量資源庫。

## 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 (Frontend)                          │
├─────────────────────────────────────────────────────────────┤
│  • LearnWhat 主應用                                         │
│  • 優先推薦資源整合 (prioritized_resources.js)              │
│  • 貢獻者管理界面                                           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 服務器 (Flask)                       │
├─────────────────────────────────────────────────────────────┤
│  • RESTful API 接口                                         │
│  • 貢獻者認證和會話管理                                     │
│  • 資源管理 CRUD 操作                                       │
│  • AI 推薦和學習計劃生成                                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    數據庫層 (SQLite)                        │
├─────────────────────────────────────────────────────────────┤
│  • 學習資源數據庫                                           │
│  • 貢獻者信息管理                                           │
│  • 資源評分和優先級                                         │
│  • 會話和認證數據                                           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI 服務 (Perplexity)                     │
├─────────────────────────────────────────────────────────────┤
│  • 智能資源推薦                                             │
│  • 學習計劃生成                                             │
│  • 語義搜索和匹配                                           │
└─────────────────────────────────────────────────────────────┘
```

## 核心功能

### 1. 資源策展管理
- **貢獻者註冊/登錄**: 行業專家可以註冊成為貢獻者
- **資源添加**: 手動添加高質量學習資源
- **資源審核**: 新資源需要審核後才能被推薦
- **優先級管理**: 設置資源的優先級分數

### 2. 智能優先級系統
- **Hashtag標籤**: 每個資源都有相關的hashtag標籤
- **相關性計算**: AI根據用戶興趣和hashtag匹配計算相關性
- **優先級排序**: 策展資源優先於AI推薦資源

### 3. 語義檢索
- **智能搜索**: 基於標題、描述和hashtag的語義搜索
- **興趣匹配**: 自動提取用戶興趣關鍵詞
- **資源過濾**: 根據難度、類型、時長等條件過濾

### 4. AI增強推薦
- **優先使用策展資源**: AI優先從數據庫選擇相關資源
- **智能補充**: 當策展資源不足時，AI推薦其他高質量資源
- **降級機制**: API不可用時自動降級到fallback資源

### 5. 學習計劃生成
- **個性化計劃**: 根據用戶具體需求生成學習計劃
- **資源分配**: 智能分配資源到具體學習天數
- **進度追蹤**: 支持學習進度追蹤和統計

## 文件結構

```
learnwhat/
├── learning_resources.py          # 核心數據庫系統
├── contributor_management.py      # 貢獻者管理系統
├── ai_integration.py             # AI整合系統
├── api_server.py                 # Flask API服務器
├── src/
│   ├── utils/
│   │   └── prioritized_resources.js  # 前端整合
│   └── styles/
│       └── main.css              # 樣式文件（已更新）
└── README_PRIORITIZED_RESOURCES.md  # 本文檔
```

## 安裝和配置

### 1. 安裝Python依賴

```bash
pip install flask flask-cors aiohttp sqlite3
```

### 2. 配置API密鑰

在 `api_server.py` 中更新你的AI API密鑰：

```python
ai_recommender = AIResourceRecommender(db, "your-api-key-here")
```

### 3. 啟動API服務器

```bash
python api_server.py
```

服務器將在 `http://localhost:5000` 啟動。

### 4. 整合前端

在 `index.html` 中添加優先推薦系統腳本：

```html
<script src="src/utils/prioritized_resources.js"></script>
```

## API 端點

### 貢獻者管理
- `POST /api/contributor/register` - 註冊貢獻者
- `POST /api/contributor/login` - 貢獻者登錄
- `POST /api/contributor/logout` - 貢獻者登出
- `GET /api/contributor/profile` - 獲取貢獻者資料

### 資源管理
- `POST /api/resources` - 添加學習資源
- `PUT /api/resources/<id>` - 更新學習資源
- `DELETE /api/resources/<id>` - 刪除學習資源
- `GET /api/resources/my` - 獲取我的資源列表
- `GET /api/resources/search` - 搜索學習資源

### AI推薦
- `POST /api/ai/recommend` - 獲取AI推薦資源
- `POST /api/ai/generate-plan` - 生成學習計劃

### 管理功能
- `GET /api/admin/resources` - 獲取所有資源（管理員）
- `PUT /api/admin/resources/<id>/priority` - 更新資源優先級
- `GET /api/stats/overview` - 獲取系統統計

## 使用示例

### 1. 貢獻者註冊

```javascript
const response = await fetch('/api/contributor/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: '張三',
        email: 'zhangsan@example.com',
        password: 'password123',
        expertise_areas: ['AI', 'Machine Learning'],
        organization: 'AI研究院',
        bio: 'AI專家'
    })
});
```

### 2. 添加學習資源

```javascript
const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: '深度學習基礎課程',
        description: '從零開始學習深度學習',
        url: 'https://example.com/course',
        resource_type: 'course',
        difficulty: 2,
        duration: '4 weeks',
        cost: 'Free',
        hashtags: ['deep-learning', 'ai', 'neural-networks'],
        prerequisites: ['Python基礎'],
        learning_outcomes: ['掌握深度學習基礎']
    })
});
```

### 3. 獲取AI推薦

```javascript
const response = await fetch('/api/ai/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        description: '我想學習AI交易策略',
        topic: 'AI Trading',
        level: 'intermediate',
        duration: 30,
        intensity: 'moderate',
        materials: ['Course', 'Video', 'Project']
    })
});
```

## 數據模型

### LearningResource (學習資源)
```python
{
    "id": "uuid",
    "title": "資源標題",
    "description": "資源描述",
    "url": "資源URL",
    "resource_type": "course|book|video|article|project|tutorial|podcast|tool|documentation",
    "difficulty": 1-5,
    "duration": "學習時長",
    "cost": "費用信息",
    "hashtags": ["標籤1", "標籤2"],
    "prerequisites": ["前置要求"],
    "learning_outcomes": ["學習成果"],
    "priority_score": 1.0-5.0,
    "ai_relevance_score": 0.0-10.0,
    "status": "active|inactive|pending_review|archived"
}
```

### Contributor (貢獻者)
```python
{
    "id": "uuid",
    "name": "姓名",
    "email": "郵箱",
    "expertise_areas": ["專業領域"],
    "organization": "組織",
    "bio": "個人簡介",
    "is_verified": true/false
}
```

## 工作流程

### 1. 資源策展流程
1. 貢獻者註冊並驗證身份
2. 貢獻者添加高質量學習資源
3. 資源進入審核狀態
4. 管理員審核並激活資源
5. 資源獲得優先級分數

### 2. AI推薦流程
1. 用戶輸入學習目標
2. 系統提取興趣關鍵詞
3. 從策展資源庫搜索相關資源
4. AI分析並補充推薦
5. 按優先級和相關性排序
6. 生成個性化學習計劃

### 3. 降級機制
1. 檢查API服務器健康狀態
2. 如果API不可用，使用fallback資源
3. 記錄錯誤並通知用戶
4. 自動重試連接

## 特色功能

### 1. 智能相關性計算
- 基於hashtag匹配
- 標題和描述文本分析
- 學習成果匹配
- 綜合評分排序

### 2. 資源來源標記
- 🎯 策展資源（金色星標）
- 🤖 AI推薦資源（藍色機器人標）
- 清晰的視覺區分

### 3. 統計分析
- 策展資源數量
- AI推薦資源數量
- 總資源統計
- 實時更新

### 4. 響應式設計
- 移動端適配
- 現代化UI設計
- 直觀的用戶體驗

## 部署建議

### 生產環境配置
1. 使用PostgreSQL替代SQLite
2. 配置Redis緩存
3. 設置負載均衡
4. 啟用HTTPS
5. 配置監控和日誌

### 安全考慮
1. 密碼哈希存儲
2. JWT令牌認證
3. API速率限制
4. 輸入驗證和清理
5. CORS配置

## 擴展功能

### 未來可添加的功能
1. 資源評分和評論系統
2. 學習路徑推薦
3. 社交學習功能
4. 進度分析和報告
5. 多語言支持
6. 移動應用

## 故障排除

### 常見問題
1. **API服務器無法啟動**: 檢查端口5000是否被占用
2. **數據庫錯誤**: 確保SQLite文件權限正確
3. **AI API調用失敗**: 檢查API密鑰和網絡連接
4. **前端整合問題**: 確保JavaScript文件正確加載

### 日誌和調試
- 查看控制台日誌
- 檢查API服務器日誌
- 使用瀏覽器開發者工具
- 監控網絡請求

## 貢獻指南

歡迎貢獻代碼和改進建議！請遵循以下步驟：

1. Fork 項目
2. 創建功能分支
3. 提交更改
4. 發起 Pull Request

## 許可證

本項目採用 MIT 許可證。

## 聯繫方式

如有問題或建議，請聯繫開發團隊。
