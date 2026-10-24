import { PROFILE, SOCIAL_LINKS, DEFAULT_PROJECTS, INTERESTS, fetchLiveRepos } from './data.js';

export class UIManager {
  constructor(appScene) {
    this.scene = appScene;
    this.projects = DEFAULT_PROJECTS;
    this.currentFilter = 'all';

    this.cacheElements();
    this.bindEvents();
    this.loadGitHubData();
    this.renderSidebarContent();
  }

  cacheElements() {
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.sidebarClose = document.getElementById('sidebar-close');
    this.treeContent = document.getElementById('tree');
    this.searchInput = document.getElementById('search');

    this.card = document.getElementById('card');
    this.cardContent = document.getElementById('card-content');
    this.cardClose = document.getElementById('card-close');

    this.clockOutput = document.getElementById('clock');
    this.daySlider = document.getElementById('day');
    this.dayPlayBtn = document.getElementById('day-play');

    this.timeButtons = document.querySelectorAll('[data-time]');
    this.dockButtons = document.querySelectorAll('[data-dock]');
    this.sideTabs = document.querySelectorAll('.side-tabs button');

    this.helpBtn = document.getElementById('help');
    this.helpModal = document.getElementById('help-modal');
    this.helpClose = document.getElementById('help-close');
  }

  bindEvents() {
    // Dock Navigation
    this.dockButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.dataset.dock;
        this.dockButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (target === 'bird') {
          this.scene.setBirdEyeView();
        } else {
          this.scene.focusIsland(target);
        }
      });
    });

    // Sidebar Toggle
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
      });
    }
    if (this.sidebarClose) {
      this.sidebarClose.addEventListener('click', () => {
        this.sidebar.classList.remove('open');
      });
    }

    // Detail Card Close
    if (this.cardClose) {
      this.cardClose.addEventListener('click', () => {
        this.card.classList.remove('open');
      });
    }

    // Time Preset Buttons
    this.timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const time = parseInt(btn.dataset.time, 10);
        this.scene.dayNight.setTime(time);
        this.timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.daySlider) this.daySlider.value = time;
      });
    });

    // Time Slider
    if (this.daySlider) {
      this.daySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.scene.dayNight.setTime(val);
      });
    }

    // Play/Pause Day loop
    if (this.dayPlayBtn) {
      this.dayPlayBtn.addEventListener('click', () => {
        this.scene.dayNight.isPlaying = !this.scene.dayNight.isPlaying;
        this.dayPlayBtn.textContent = this.scene.dayNight.isPlaying ? '⏸' : '▶';
        this.dayPlayBtn.classList.toggle('active', this.scene.dayNight.isPlaying);
      });
    }

    // Sidebar Tabs (All, Projects, Interests, Social)
    this.sideTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.sideTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter || 'all';
        this.renderSidebarContent();
      });
    });

    // Search in sidebar
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.renderSidebarContent(this.searchInput.value.trim().toLowerCase());
      });
    }

    // Help Modal
    if (this.helpBtn && this.helpModal) {
      this.helpBtn.addEventListener('click', () => this.helpModal.classList.add('open'));
    }
    if (this.helpClose && this.helpModal) {
      this.helpClose.addEventListener('click', () => this.helpModal.classList.remove('open'));
    }

    // Clock HUD continuous tick
    setInterval(() => {
      if (this.clockOutput) {
        this.clockOutput.textContent = this.scene.dayNight.getTimeFormatted();
      }
      if (this.daySlider && this.scene.dayNight.isPlaying) {
        this.daySlider.value = Math.floor(this.scene.dayNight.timeMinutes);
      }
    }, 100);
  }

  async loadGitHubData() {
    this.projects = await fetchLiveRepos("taichi16");
    this.renderSidebarContent();
  }

  // Handle 3D item clicked
  handleSelectObject(userData) {
    if (!userData) return;

    // Check if it's a project
    const proj = this.projects.find(p => p.id === userData.id || p.repo_name === userData.id);
    if (proj) {
      this.showDetailCard({
        type: 'project',
        title: proj.name,
        badge: proj.language,
        badgeColor: proj.languageColor,
        description: proj.description,
        tags: proj.tags,
        url: proj.url,
        actionLabel: '前往 GitHub 原始碼 →',
        extra: `⭐ Stars: ${proj.stars}　🍴 Forks: ${proj.forks}`
      });
      return;
    }

    // Check if it's an interest
    const interest = INTERESTS.find(i => i.id === userData.id);
    if (interest) {
      this.showDetailCard({
        type: 'interest',
        title: `${interest.icon} ${interest.name}`,
        badge: interest.category,
        badgeColor: interest.color,
        subtitle: interest.subtitle,
        description: interest.description,
        tags: interest.keywords,
        url: null
      });
      return;
    }

    // Check if it's social
    const social = SOCIAL_LINKS.find(s => s.id === userData.id);
    if (social) {
      this.showDetailCard({
        type: 'social',
        title: social.name,
        badge: social.badge,
        badgeColor: social.color,
        subtitle: social.handle,
        description: social.description,
        url: social.url,
        actionLabel: `打開 ${social.name} →`
      });
      return;
    }

    // Island overall info
    if (userData.id === "dev") {
      this.showDetailCard({
        type: 'island',
        title: '💻 開發核心島 (Dev Island)',
        badge: 'Software Base',
        badgeColor: '#38bdf8',
        description: 'Taichi 的軟體開發根據地。匯聚 macOS 原生應用（Swift）、高效能系統工具（Rust）、地理資訊導航系統（JavaScript）與自動化影音腳本（Python）。',
        actionLabel: '在清單中檢視所有專案',
        onAction: () => {
          this.sidebar.classList.add('open');
          const tab = document.querySelector('[data-filter="projects"]');
          if (tab) tab.click();
        }
      });
    } else if (userData.id === "zen") {
      this.showDetailCard({
        type: 'island',
        title: '🍵 藝境綠洲島 (Zen & Atelier)',
        badge: 'Life & Maker',
        badgeColor: '#10b981',
        description: '連結心流與創造力的靈感之島。在茶席中沉澱心思，於工坊將數位圖紙化為 3D 列印與雷雕實物，穿梭街頭定格光影，並持續探索 AI 智慧代理與資訊安全基石。',
        actionLabel: '探索所有個人興趣',
        onAction: () => {
          this.sidebar.classList.add('open');
          const tab = document.querySelector('[data-filter="interests"]');
          if (tab) tab.click();
        }
      });
    } else if (userData.id === "beacon") {
      this.showDetailCard({
        type: 'island',
        title: '🗼 連結燈塔島 (Nexus Beacon)',
        badge: 'Social Matrix',
        badgeColor: '#fbbf24',
        description: '射向數位星空的連結信標。無論是技術交流、專案協作，或分享攝影與生活藝術，歡迎隨時透過各社群平台與我建立連結。',
        actionLabel: '查看社群連結',
        onAction: () => {
          this.sidebar.classList.add('open');
          const tab = document.querySelector('[data-filter="social"]');
          if (tab) tab.click();
        }
      });
    }
  }

  showDetailCard(data) {
    if (!this.card || !this.cardContent) return;

    let html = `
      <div class="card-badge" style="background:${data.badgeColor || '#38bdf8'}22; color:${data.badgeColor || '#38bdf8'}; border-color:${data.badgeColor || '#38bdf8'}44;">
        ${data.badge || 'INFO'}
      </div>
      <h2 class="card-title">${data.title}</h2>
      ${data.subtitle ? `<p class="card-subtitle">${data.subtitle}</p>` : ''}
      ${data.extra ? `<div class="card-extra">${data.extra}</div>` : ''}
      <div class="card-desc">${data.description}</div>
    `;

    if (data.tags && data.tags.length > 0) {
      html += `
        <div class="card-tags">
          ${data.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
      `;
    }

    if (data.url) {
      html += `
        <div class="card-actions">
          <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            ${data.actionLabel || '查看更多 →'}
          </a>
        </div>
      `;
    } else if (data.actionLabel && data.onAction) {
      html += `
        <div class="card-actions">
          <button id="card-action-btn" class="btn-primary">
            ${data.actionLabel}
          </button>
        </div>
      `;
    }

    this.cardContent.innerHTML = html;
    this.card.classList.add('open');

    const actionBtn = document.getElementById('card-action-btn');
    if (actionBtn && data.onAction) {
      actionBtn.addEventListener('click', () => {
        this.card.classList.remove('open');
        data.onAction();
      });
    }
  }

  renderSidebarContent(query = '') {
    if (!this.treeContent) return;
    let html = '';

    // Filter projects
    const filteredProjects = this.projects.filter(p => {
      if (!query) return true;
      return p.name.toLowerCase().includes(query) ||
             p.description.toLowerCase().includes(query) ||
             p.language.toLowerCase().includes(query) ||
             (p.tags && p.tags.some(t => t.toLowerCase().includes(query)));
    });

    // Filter interests
    const filteredInterests = INTERESTS.filter(i => {
      if (!query) return true;
      return i.name.toLowerCase().includes(query) ||
             i.description.toLowerCase().includes(query) ||
             (i.keywords && i.keywords.some(k => k.toLowerCase().includes(query)));
    });

    // Filter socials
    const filteredSocials = SOCIAL_LINKS.filter(s => {
      if (!query) return true;
      return s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
    });

    // 1. PROJECTS SECTION
    if (this.currentFilter === 'all' || this.currentFilter === 'projects') {
      html += `
        <div class="group-header">
          <span class="group-title">💻 GitHub 開發軟體 (${filteredProjects.length})</span>
          <a href="${PROFILE.github}" target="_blank" class="group-link">前往 GitHub ↗</a>
        </div>
        <div class="cards-grid">
          ${filteredProjects.map(proj => `
            <div class="item-card" data-focus-id="${proj.id}">
              <div class="item-header">
                <h3 class="item-title">${proj.name}</h3>
                <span class="lang-badge" style="background:${proj.languageColor}22; color:${proj.languageColor}; border-color:${proj.languageColor}55;">
                  ${proj.language}
                </span>
              </div>
              <p class="item-desc">${proj.description}</p>
              <div class="item-footer">
                <div class="item-tags">
                  ${(proj.tags || []).slice(0, 3).map(t => `<span class="mini-tag">#${t}</span>`).join('')}
                </div>
                <a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="link-btn" title="查看原始碼">
                  Code ↗
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 2. INTERESTS SECTION
    if (this.currentFilter === 'all' || this.currentFilter === 'interests') {
      html += `
        <div class="group-header" style="margin-top: 1.5rem;">
          <span class="group-title">🌿 個人興趣與創作 (${filteredInterests.length})</span>
        </div>
        <div class="cards-grid">
          ${filteredInterests.map(item => `
            <div class="item-card" data-focus-id="${item.id}">
              <div class="item-header">
                <h3 class="item-title">${item.icon} ${item.name}</h3>
                <span class="lang-badge" style="background:${item.color}22; color:${item.color}; border-color:${item.color}55;">
                  ${item.category}
                </span>
              </div>
              <p class="item-subtitle" style="font-size:0.8rem; color:${item.color}; margin-bottom:0.4rem;">
                ${item.subtitle}
              </p>
              <p class="item-desc">${item.description}</p>
              <div class="item-tags" style="margin-top:0.5rem;">
                ${item.keywords.map(k => `<span class="mini-tag">#${k}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 3. SOCIAL LINKS SECTION
    if (this.currentFilter === 'all' || this.currentFilter === 'social') {
      html += `
        <div class="group-header" style="margin-top: 1.5rem;">
          <span class="group-title">🌐 社群連結與聯絡 (${filteredSocials.length})</span>
        </div>
        <div class="social-grid">
          ${filteredSocials.map(soc => `
            <a href="${soc.url}" target="_blank" rel="noopener noreferrer" class="social-card" style="border-left-color:${soc.color};">
              <div class="soc-icon" style="color:${soc.color};">
                ${soc.icon}
              </div>
              <div class="soc-info">
                <div class="soc-name">${soc.name} <span class="soc-handle">${soc.handle}</span></div>
                <div class="soc-desc">${soc.description}</div>
              </div>
              <div class="soc-arrow">↗</div>
            </a>
          `).join('')}
        </div>
      `;
    }

    this.treeContent.innerHTML = html;

    // Attach click listeners to cards to focus in 3D
    const itemCards = this.treeContent.querySelectorAll('[data-focus-id]');
    itemCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't focus if clicked directly on an external <a> link
        if (e.target.tagName.toLowerCase() === 'a') return;
        const id = card.dataset.focusId;
        this.handleSelectObject({ id });
      });
    });
  }
}
