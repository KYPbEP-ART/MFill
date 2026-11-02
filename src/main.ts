// ===== Imports =====
// import { createEditorView } from './pages/editor';
import { createEditorView } from './pages/editor-new.ts';
import { createHome, initHome } from './pages/home';
import { createSettings, initSettings } from './pages/settings';
// ===== CSS Imports =====
import './styles.css';           // Базовый файл
import './styles/variables.css'; // Переменные
import './styles/layout.css';    // Каркас
import './styles/widgets.css';   // Кнопки, списки, дропдауны
import './styles/editor.css';    // Стили редактора
import './styles/settings.css';  // стиль настроек

// ===== Глобальные элементы =====
const tabsContainer = document.getElementById('tabs-container')!;
const workspace = document.getElementById('workspace')!;

// ===== Состояние =====
let tplCounter = 0;

// ===== Меню =====
function initMenu() {
  const triggers = document.querySelectorAll('.menu-trigger');
  const dropdowns = document.querySelectorAll('.dropdown');
  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = (e.target as HTMLElement).closest('.menu-item');
      const dropdown = parent?.querySelector('.dropdown');
      dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
      dropdown?.classList.toggle('show');
    });
  });
  document.addEventListener('click', () => dropdowns.forEach(d => d.classList.remove('show')));
}

// ===== Вкладки: переключение =====
function activateTab(tab: HTMLElement) {
  tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const tabId = tab.dataset.tabId;
  workspace.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add('active');
}

// ===== Вкладки: Drag & Drop (без изменений) =====
function setupDraggableTab(tab: HTMLElement) {
  if (tab.classList.contains('tab-home')) { tab.setAttribute('draggable', 'false'); return; }
  tab.setAttribute('draggable', 'true');
  tab.addEventListener('dragstart', (e) => {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', tab.dataset.tabId || 'tab');
    tab.classList.add('dragging');
    setTimeout(() => (tab.style.opacity = '0.4'), 0);
  });
  tab.addEventListener('dragend', () => { tab.classList.remove('dragging'); tab.style.opacity = '1'; });
}
function getDragAfterElement(container: HTMLElement, x: number): HTMLElement | null {
  const tabs = [...container.querySelectorAll('.tab:not(.dragging)')] as HTMLElement[];
  return tabs.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }).element;
}
tabsContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  const dragging = tabsContainer.querySelector('.tab.dragging');
  if (!dragging) return;
  const after = getDragAfterElement(tabsContainer, e.clientX);
  if (after) tabsContainer.insertBefore(dragging, after);
  else tabsContainer.appendChild(dragging);
});

// ===== Вкладки: создание =====
function createTabElement(id: string, title: string, content: HTMLElement | string, isEditor = false) {
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.tabId = id;
  tab.innerHTML = `<span class="tab-title">${title}</span><button class="tab-close">✕</button>`;
  setupDraggableTab(tab);
  tab.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('tab-close')) return;
    activateTab(tab);
  });
  tab.querySelector('.tab-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasActive = tab.classList.contains('active');
    tab.remove();
    document.getElementById(`view-${id}`)?.remove();
    if (wasActive) {
      const home = tabsContainer.querySelector('.tab-home') as HTMLElement;
      if (home) activateTab(home);
    }
  });
  tabsContainer.appendChild(tab);
  
  const view = document.createElement('div');
  view.id = `view-${id}`;
  view.className = 'view';
  if (isEditor && content instanceof HTMLElement) {
    view.appendChild(content);
  } else if (content instanceof HTMLElement) {
    view.appendChild(content);
  } else {
    view.innerHTML = content as string;
  }
  workspace.appendChild(view);
  activateTab(tab);
}

// ===== Создание вкладки-шаблона =====
function createNewTplTab(title: string) {
  const id = `tpl-${Date.now()}`;
  createTabElement(id, title, createEditorView(id), true);
}

// ===== Точка входа =====
document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализируем глобальные компоненты
  initMenu();
  
  // 2. Создаём и показываем Дом
  const home = createHome();
  workspace.appendChild(home);
  initHome(
    () => { tplCounter++; createNewTplTab(`Шаблон без имени ${tplCounter}`); },
  );
  
  // 4. Инициализируем "Дом" как активную вкладку в панели
  const homeTab = document.createElement('div');
  homeTab.className = 'tab tab-home active';
  homeTab.dataset.tabId = 'home';
  homeTab.innerHTML = `<span class="tab-title">🏠 Дом</span><button class="tab-close" disabled>✕</button>`;
  tabsContainer.appendChild(homeTab);
  setupDraggableTab(homeTab);
  homeTab.addEventListener('click', () => activateTab(homeTab));
  
  console.log('✅ App bootstrapped. Modular architecture active.');
});

document.getElementById('menu-open-settings')?.addEventListener('click', () => {
    openSettingsTab();
    // Закрыть меню после клика
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
});


function openSettingsTab() {
  const id = 'settings';
  
  // Если вкладка уже открыта → просто переключаемся
  const existingTab = document.querySelector(`.tab[data-tab-id="${id}"]`);
  if (existingTab) {
    activateTab(existingTab as HTMLElement);
    return;
  }

  // Создаём контент и вкладку
  const content = createSettings();
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.tabId = id;
  tab.innerHTML = `<span class="tab-title">⚙️ Настройки</span><button class="tab-close">✕</button>`;
  
  // Вешаем стандартные обработчики (клик, закрытие)
  tab.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('tab-close')) return;
    activateTab(tab);
  });
  tab.querySelector('.tab-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    tab.remove();
    document.getElementById(`view-${id}`)?.remove();
  });

  tabsContainer.appendChild(tab);
  
  const view = document.createElement('div');
  view.id = `view-${id}`;
  view.className = 'view';
  view.appendChild(content);
  workspace.appendChild(view);

  activateTab(tab);
  initSettings(); // 👈 Включаем интерактив ПОСЛЕ вставки в DOM
}