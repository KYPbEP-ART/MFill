// src/pages/settings.ts
import template from '../structure/settings.html?raw';

// 1️⃣ Создаёт DOM-элемент вкладки
export function createSettings(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'view-settings';
  container.className = 'view settings-layout';
  container.innerHTML = template;
  return container;
}

// 2️⃣ Вешает обработчики (вызывается ПОСЛЕ вставки в DOM)
export function initSettings() {
  const saveBtn = document.getElementById('settings-save');
  const themeSelect = document.getElementById('settings-theme') as HTMLSelectElement;
  const autosaveCheck = document.getElementById('settings-autosave') as HTMLInputElement;

  saveBtn?.addEventListener('click', () => {
    console.log('✅ Настройки сохранены:', {
      theme: themeSelect.value,
      autosave: autosaveCheck.checked
    });
    alert('Настройки сохранены!');
  });

  console.log('⚙️ Settings initialized');
}