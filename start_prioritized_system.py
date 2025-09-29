#!/usr/bin/env python3
"""
優先推薦學習資源系統快速啟動腳本
Quick Start Script for Prioritized Learning Resources System
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_python_version():
    """檢查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 需要Python 3.7或更高版本")
        sys.exit(1)
    print(f"✅ Python版本: {sys.version}")

def install_dependencies():
    """安裝依賴包"""
    print("📦 安裝Python依賴包...")
    
    dependencies = [
        "flask",
        "flask-cors", 
        "aiohttp",
        "requests"
    ]
    
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✅ 已安裝: {dep}")
        except subprocess.CalledProcessError:
            print(f"❌ 安裝失敗: {dep}")
            return False
    
    return True

def check_files():
    """檢查必要文件是否存在"""
    print("📁 檢查系統文件...")
    
    required_files = [
        "learning_resources.py",
        "contributor_management.py", 
        "ai_integration.py",
        "api_server.py",
        "src/utils/prioritized_resources.js"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
        else:
            print(f"✅ 找到: {file}")
    
    if missing_files:
        print("❌ 缺少以下文件:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    return True

def start_api_server():
    """啟動API服務器"""
    print("🚀 啟動API服務器...")
    
    try:
        # 啟動Flask服務器
        process = subprocess.Popen([
            sys.executable, "api_server.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # 等待服務器啟動
        time.sleep(3)
        
        # 檢查服務器是否正常運行
        import requests
        try:
            response = requests.get("http://localhost:5000/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ API服務器啟動成功!")
                print("🌐 API服務器地址: http://localhost:5000")
                return process
            else:
                print("❌ API服務器啟動失敗")
                return None
        except requests.exceptions.RequestException:
            print("❌ 無法連接到API服務器")
            return None
            
    except Exception as e:
        print(f"❌ 啟動API服務器時發生錯誤: {e}")
        return None

def open_browser():
    """打開瀏覽器"""
    print("🌐 打開瀏覽器...")
    
    urls = [
        "http://localhost:5000/api/health",
        "http://localhost:5000/api/stats/overview"
    ]
    
    for url in urls:
        try:
            webbrowser.open(url)
            print(f"✅ 已打開: {url}")
        except Exception as e:
            print(f"❌ 無法打開瀏覽器: {e}")

def show_usage_instructions():
    """顯示使用說明"""
    print("\n" + "="*60)
    print("🎉 優先推薦學習資源系統啟動成功!")
    print("="*60)
    print("\n📚 系統功能:")
    print("   • 貢獻者註冊和登錄")
    print("   • 學習資源管理")
    print("   • AI智能推薦")
    print("   • 學習計劃生成")
    print("   • 優先級排序")
    
    print("\n🌐 API端點:")
    print("   • 健康檢查: http://localhost:5000/api/health")
    print("   • 系統統計: http://localhost:5000/api/stats/overview")
    print("   • 貢獻者註冊: POST http://localhost:5000/api/contributor/register")
    print("   • AI推薦: POST http://localhost:5000/api/ai/recommend")
    
    print("\n🔧 前端整合:")
    print("   1. 在index.html中添加:")
    print("      <script src='src/utils/prioritized_resources.js'></script>")
    print("   2. 系統會自動檢測API服務器並整合")
    print("   3. 如果API不可用，會自動降級到fallback模式")
    
    print("\n📖 文檔:")
    print("   • 詳細文檔: README_PRIORITIZED_RESOURCES.md")
    print("   • API文檔: http://localhost:5000/api/health")
    
    print("\n⚠️  注意事項:")
    print("   • 確保端口5000未被占用")
    print("   • 在生產環境中請使用PostgreSQL")
    print("   • 配置正確的AI API密鑰")
    
    print("\n🛑 停止服務器:")
    print("   按 Ctrl+C 停止API服務器")
    
    print("\n" + "="*60)

def main():
    """主函數"""
    print("🚀 優先推薦學習資源系統啟動器")
    print("="*50)
    
    # 檢查Python版本
    check_python_version()
    
    # 檢查文件
    if not check_files():
        print("❌ 系統文件檢查失敗")
        sys.exit(1)
    
    # 安裝依賴
    if not install_dependencies():
        print("❌ 依賴安裝失敗")
        sys.exit(1)
    
    # 啟動API服務器
    process = start_api_server()
    if not process:
        print("❌ 無法啟動API服務器")
        sys.exit(1)
    
    # 顯示使用說明
    show_usage_instructions()
    
    # 打開瀏覽器
    open_browser()
    
    try:
        # 保持服務器運行
        print("\n⏳ 服務器運行中... (按 Ctrl+C 停止)")
        process.wait()
    except KeyboardInterrupt:
        print("\n🛑 正在停止服務器...")
        process.terminate()
        process.wait()
        print("✅ 服務器已停止")

if __name__ == "__main__":
    main()
