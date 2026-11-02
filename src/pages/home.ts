import template from '../structure/home.html?raw';

export function createHome(): HTMLElement {
  const home = document.createElement('div');
  home.id = 'view-home';
  home.className = 'view active home-layout';
  home.innerHTML = template; // ← шаблон подставится, стили уже загружены
  return home;
}

export function initHome(onCreateTpl: () => void) {
  document.getElementById('btn-create-tpl')?.addEventListener('click', onCreateTpl);
}