# 🏝️ YJ Island (Taichi's 3D Interactive Portfolio)

> 基於 Three.js 與現代 Web 技術打造的沉浸式 3D 浮島作品集網站。靈感源自政策島概念，將軟體專案、實體創客與生活美學立體化。

---

## 🌟 核心特色

1. **三大主題浮島世界**：
   - 💻 **開發核心島 (Dev Island)**：整合 GitHub 即時專案（`UniSnap`、`國道里程樁查詢`、`windows-media-downloader`、`thb-milestone-query`、`YT-Music-Downloader` 等）。
   - 🍵 **藝境綠洲島 (Zen & Atelier)**：涵蓋個人五大熱忱（**茶道品茗**、**藝術創客：繪畫/3D列印/雷射雕刻**、**攝影瞬間**、**AI智慧代理研究**、**資訊安全防線**）。
   - 🗼 **連結燈塔島 (Nexus Beacon)**：聚焦社交與專業連結（**Facebook**、**Instagram**、**LinkedIn**、**GitHub**）。
2. **動態晝夜光影系統 (Day & Night Cycle)**：
   - 支援 4 種預設時段快速切換（清晨 06:00、白天 12:00、黃昏 18:00、夜晚 21:00）。
   - 內建循環播放器與時段滑桿，天色、霧氣、水面反光與島上發光體隨時間流動變換。
3. **毛玻璃現代 HUD 介面**：
   - 底部快速切換 Dock 導覽列（全景、開發島、藝境島、燈塔島、鳥瞰視角）。
   - 點選 3D 地標或側邊欄項目，鏡頭自動平滑平移縮放（Smooth Camera Lerp），並展開詳細資訊卡片。
4. **即時 GitHub API 串接**：
   - 自動同步 `@taichi16` 的 Repo 描述與語言標籤，且具備離線快取防護。

---

## 🚀 本地開發與預覽

專案目前已在本地啟動預覽伺服器：
```bash
# 開發模式
npm run dev

# 專案打包
npm run build

# 本地預覽打包成果
npm run preview
```
開啟瀏覽器進入：**`http://localhost:3000`**

---

## 🚢 一鍵發布至 GitHub Pages

專案內已包含 `.github/workflows/deploy.yml` 自動發布腳本：
1. 在 GitHub 上建立一個新的公開儲存庫（例如 `yj_island`）。
2. 在本機資料夾中執行以下指令上傳：
   ```bash
   git init
   git add .
   git commit -m "feat: complete YJ Island 3D portfolio"
   git branch -M main
   git remote add origin https://github.com/taichi16/yj_island.git
   git push -u origin main
   ```
3. 到 GitHub 專案的 **Settings -> Pages**，將 **Build and deployment -> Source** 改為 **GitHub Actions**。
4. 幾分鐘後即可透過專屬網址造訪您的網站：
   👉 **`https://taichi16.github.io/yj_island/`**
