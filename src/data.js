// Data module for YJ Island (Taichi's Portfolio)

export const PROFILE = {
  name: "Taichi (YJ)",
  title: "Software Engineer & Creative Technologist",
  tagline: "跨界軟體開發者 · 藝術創客 · 數位漫遊者",
  bio: "專注於現代跨平台軟體開發、AI 技術研究與資訊安全，同時沉浸於茶道、攝影與實體創客藝術（3D列印、雷雕與手繪）。用程式構建秩序，以藝術探索未知。",
  github: "https://github.com/taichi16",
  avatar: "https://avatars.githubusercontent.com/u/127074520?v=4"
};

export const SOCIAL_LINKS = [
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/taichi16",
    handle: "@taichi16",
    color: "#e2e8f0",
    badge: "Code Base",
    description: "開源專案程式庫與技術實踐",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`
  },
  {
    id: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com",
    handle: "Taichi",
    color: "#1877F2",
    badge: "Social",
    description: "日常生活分享、技術觀察與社群交流",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com",
    handle: "@taichi",
    color: "#E1306C",
    badge: "Visual / Life",
    description: "攝影作品、手繪畫作、3D列印成果與茶道日常",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com",
    handle: "Taichi (YJ)",
    color: "#0A66C2",
    badge: "Career / Tech",
    description: "專業職涯經歷、軟體架構研究與專業網絡",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
  }
];

// Fallback / Initial Repositories based on taichi16 GitHub profile
export const DEFAULT_PROJECTS = [
  {
    id: "unisnap",
    name: "UniSnap",
    repo_name: "UniSnap",
    url: "https://github.com/taichi16/UniSnap",
    language: "Swift",
    languageColor: "#F05138",
    description: "macOS 輕量級高畫質截圖與錄影專用工具，提供直覺的取景框、快捷鍵召喚與快捷匯出流程。",
    tags: ["macOS", "Swift", "AppKit", "Screen Recording", "Productivity"],
    stars: 0,
    forks: 0,
    featured: true,
    accent: "#38bdf8"
  },
  {
    id: "freeway-milestone-query",
    name: "國道里程樁查詢系統",
    repo_name: "freeway-milestone-query",
    url: "https://github.com/taichi16/freeway-milestone-query",
    language: "JavaScript",
    languageColor: "#F7DF1E",
    description: "精確定位台灣國道里程樁座標與路況參考，支援快速檢索交流道與公里樁位置，救護與工程必備輔助。",
    tags: ["JavaScript", "GIS", "Web Map", "Taiwan Freeway", "Open Data"],
    stars: 0,
    forks: 0,
    featured: true,
    accent: "#34d399"
  },
  {
    id: "windows-media-downloader",
    name: "Windows Media Downloader",
    repo_name: "windows-media-downloader",
    url: "https://github.com/taichi16/windows-media-downloader",
    language: "Rust",
    languageColor: "#DEA584",
    description: "基於 Rust 語言編寫的高效能多媒體下載工具，擁有極致的並行處理速度與低資源佔用特性。",
    tags: ["Rust", "CLI", "Concurrency", "High Performance", "Media"],
    stars: 0,
    forks: 0,
    featured: true,
    accent: "#f97316"
  },
  {
    id: "thb-milestone-query",
    name: "台灣省道里程樁查詢與導航",
    repo_name: "thb-milestone-query",
    url: "https://github.com/taichi16/thb-milestone-query",
    language: "JavaScript",
    languageColor: "#F7DF1E",
    description: "全台省道公路系統（台1線、台9線等）里程樁定位與導航輔助，整合公路局座標轉換演算法。",
    tags: ["JavaScript", "Navigation", "Highway", "Taiwan Roads", "GIS"],
    stars: 0,
    forks: 0,
    featured: false,
    accent: "#10b981"
  },
  {
    id: "yt-music-downloader",
    name: "YT-Music-Downloader",
    repo_name: "YT-Music-Downloader",
    url: "https://github.com/taichi16/YT-Music-Downloader",
    language: "Python",
    languageColor: "#3572A5",
    description: "自動化音樂抓取與 ID3 標籤匹配工具，支援高品質無損音頻提取與批次整理清單。",
    tags: ["Python", "Audio Processing", "FFmpeg", "Metadata", "Automation"],
    stars: 0,
    forks: 0,
    featured: false,
    accent: "#a855f7"
  },
  {
    id: "space-door",
    name: "Space Door 空間之門",
    repo_name: "space_door",
    url: "https://github.com/taichi16/space_door",
    language: "HTML / WebGL",
    languageColor: "#e34c26",
    description: "網頁端沉浸式 3D 空間傳送門視覺實驗，探索光影穿透與維度變換的互動體驗。",
    tags: ["3D Graphics", "Creative Coding", "WebGL", "Interactive"],
    stars: 0,
    forks: 0,
    featured: false,
    accent: "#6366f1"
  },
  {
    id: "moon-surveyor",
    name: "Moon Surveyor 月球探測儀",
    repo_name: "moon_surveyor",
    url: "https://github.com/taichi16/moon_surveyor",
    language: "JavaScript",
    languageColor: "#F7DF1E",
    description: "互動式月表探測與軌道模擬儀器，視覺化重現月球環繞與地貌觀察數值。",
    tags: ["Space Science", "Simulation", "Interactive", "Visualization"],
    stars: 0,
    forks: 0,
    featured: false,
    accent: "#06b6d4"
  },
  {
    id: "floating-cloud",
    name: "Floating Cloud",
    repo_name: "floating_cloud",
    url: "https://github.com/taichi16/floating_cloud",
    language: "Swift",
    languageColor: "#F05138",
    description: "Apple 生態系跨裝置雲端資料同步與輕量記錄器，優雅融入原生桌面工作流。",
    tags: ["Swift", "CloudKit", "macOS", "Productivity"],
    stars: 0,
    forks: 0,
    featured: false,
    accent: "#ec4899"
  }
];

export const INTERESTS = [
  {
    id: "tea-ceremony",
    name: "茶道 · 禪境品茗",
    category: "生活心流",
    icon: "🍵",
    color: "#10b981",
    subtitle: "沸水沖瀹，觀茶葉翻卷，在靜謐中安頓思緒",
    description: "茶道對我而言不僅是味蕾的饗宴，更是數位時代的靜心儀式。精選岩茶、高山烏龍與老白茶，掌握水溫、注水弧度與出湯秒數，以器引茶，以茶會友，讓心神在繁忙代碼之餘重歸平靜。",
    keywords: ["台灣高山茶", "武夷岩茶", "紫砂朱泥", "茶席美學", "心流沉浸"]
  },
  {
    id: "art-maker",
    name: "藝術創客 · 繪畫 / 3D列印 / 雷雕",
    category: "創客實體化",
    icon: "🎨",
    color: "#f59e0b",
    subtitle: "從手繪筆觸到立體成型，將思想具象化",
    description: "橫跨純藝術手繪與數位自造（Digital Fabrication）：運用 CAD 軟體建模後透過 3D 列印（FDM / 光固化）產出實體原形，再以精密雷射雕刻機切割原木、皮革與壓克力。親手將數位圖元化為握在掌心的實體創作。",
    keywords: ["數位自造", "3D Modeling", "Laser Cutting", "手繪速寫", "工業設計與模型"]
  },
  {
    id: "photography",
    name: "攝影 · 瞬間光影",
    category: "視覺觀察",
    icon: "📷",
    color: "#06b6d4",
    subtitle: "捕捉幾何構圖、城市節奏與大自然的光影律動",
    description: "帶著相機穿梭在街頭與山林，鍾情於高對比黑白、晨昏斜射光與極簡線條。攝影是訓練觀察力的最佳方式，也是在快節奏生活中慢下腳步、重新感知世界維度的感官練習。",
    keywords: ["街頭紀實", "幾何構圖", "晨昏長曝", "光影詩學", "色彩科學"]
  },
  {
    id: "ai-research",
    name: "AI 研究 · 智慧代理與神經網絡",
    category: "尖端技術",
    icon: "🤖",
    color: "#8b5cf6",
    subtitle: "探尋機器認知邊界，構建自主 Agent 系統",
    description: "深度探索大型語言模型（LLM）、多模態架構與自主代理人（Autonomous Agents）的落地應用。研究 Prompt Engineering、RAG 向量檢索以及將 AI 嵌入日常軟體工具中，實現人機共創的最佳實踐。",
    keywords: ["LLM", "AI Agents", "Prompt Engineering", "RAG", "深度學習架構"]
  },
  {
    id: "cybersecurity",
    name: "資訊安全 · 攻防與隱私防禦",
    category: "安全基石",
    icon: "🛡️",
    color: "#ef4444",
    subtitle: "剖析威脅架構，構築堅不可摧的隱私與系統防線",
    description: "關注現代系統脆弱性分析、加密通訊協定、身分認證（Auth）架構與安全開發生命週期（DevSecOps）。堅信「安全不是附加功能，而是系統的內在架構基石」。",
    keywords: ["應用安全", "密碼學應用", "DevSecOps", "網路威脅防護", "隱私合規"]
  }
];

// Helper to fetch live GitHub repos
export async function fetchLiveRepos(username = "taichi16") {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=15`);
    if (!res.ok) throw new Error("GitHub API rate limit or error");
    const data = await res.json();
    if (!Array.isArray(data)) return DEFAULT_PROJECTS;

    return DEFAULT_PROJECTS.map(localProj => {
      const match = data.find(r => r.name.toLowerCase() === localProj.repo_name.toLowerCase());
      if (match) {
        return {
          ...localProj,
          stars: match.stargazers_count ?? localProj.stars,
          forks: match.forks_count ?? localProj.forks,
          description: match.description || localProj.description,
          updated_at: match.updated_at
        };
      }
      return localProj;
    });
  } catch (err) {
    console.warn("Using offline fallback projects due to:", err.message);
    return DEFAULT_PROJECTS;
  }
}
