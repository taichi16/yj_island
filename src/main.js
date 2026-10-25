import { AppScene } from './scene.js';
import { UIManager } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const loading = document.getElementById('loading');

  function dismissLoading() {
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 600);
    }
  }

  try {
    let uiManager;
    const appScene = new AppScene(stage, (selectedObject) => {
      if (uiManager) {
        uiManager.handleSelectObject(selectedObject);
      }
    });

    uiManager = new UIManager(appScene);

    // Smoothly hide loading spinner once everything is ready
    setTimeout(dismissLoading, 400);
  } catch (err) {
    console.error('Failed to initialize 3D scene:', err);
    if (loading) {
      const p = loading.querySelector('p');
      if (p) {
        p.textContent = '載入過程遇到限制，請嘗試重新整理或以支援 WebGL 的瀏覽器開啟。';
        p.style.color = '#db6a41';
      }
      setTimeout(dismissLoading, 2500);
    }
  }
});
