import { AppScene } from './scene.js';
import { UIManager } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const loading = document.getElementById('loading');

  let uiManager;
  const appScene = new AppScene(stage, (selectedObject) => {
    if (uiManager) {
      uiManager.handleSelectObject(selectedObject);
    }
  });

  uiManager = new UIManager(appScene);

  // Hide loading spinner smoothly once ready
  setTimeout(() => {
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.style.display = 'none', 600);
    }
  }, 500);
});
