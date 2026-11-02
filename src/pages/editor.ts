// src/pages/editor.ts
import template from '../structure/editor.html?raw';
import { createNewDocument, updateDocument, getDocument } from '../core/documentState';
import { parseHtmlToBlocks } from '../core/parser';
import type { TemplateDocument } from '../types/document';
import { saveTemplateToDisk, loadTemplateFromDisk } from '../core/fileOps';

export function createEditorView(tabId: string, initialDoc?: TemplateDocument): HTMLElement {
  const container = document.createElement('div');
  container.className = 'editor-container';
  container.innerHTML = template.replace(/{{TAB_ID}}/g, tabId);
  
  const page = container.querySelector('.a4-page') as HTMLElement;
  if (!page) return container;

  // === Инициализация документа ===
  if (initialDoc) {
    page.innerHTML = renderBlocksToHtml(initialDoc.blocks);
    createNewDocument(initialDoc.name);
    updateDocument(initialDoc.blocks, initialDoc.fields);
  } else {
    createNewDocument('Новый шаблон');
  }

  // === Простое автосохранение (без подсветки) ===
  let saveTimer: ReturnType<typeof setTimeout>;
  page.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const { blocks, fields } = parseHtmlToBlocks(page.innerHTML);
      updateDocument(blocks, fields);
    }, 500);
  });

  // === Переключение вкладок ленты ===
  container.querySelectorAll('.ribbon-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ribbon-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelectorAll('[data-panel]').forEach(p => (p as HTMLElement).style.display = 'none');
      const tabName = (btn as HTMLElement).dataset.tab;
      container.querySelectorAll(`[data-panel="${tabName}"]`).forEach(p => {
        (p as HTMLElement).style.display = 'flex';
      });
    });
  });

  // === Форматирование текста ===
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      page.focus();
      const action = (btn as HTMLElement).dataset.action;
      if (action) document.execCommand(action, false);
    });
  });

  // === Placeholder ===
  if (!page.innerHTML.trim()) page.dataset.placeholder = 'true';
  page.addEventListener('focus', () => {
    if (page.dataset.placeholder === 'true') {
      page.innerHTML = '';
      page.dataset.placeholder = 'false';
    }
  });
  page.addEventListener('blur', () => {
    if (!page.innerHTML.trim()) {
      page.innerHTML = '';
      page.dataset.placeholder = 'true';
    }
  });

  // 💾 Сохранить
  container.querySelector('[data-action="save-template"]')?.addEventListener('click', async () => {
    const doc = getDocument();
    if (doc) await saveTemplateToDisk(doc);
  });

  // 📂 Открыть
  container.querySelector('[data-action="open-template"]')?.addEventListener('click', async () => {
    const doc = await loadTemplateFromDisk();
    if (doc && page) {
      // Рендерим блоки обратно в HTML
      page.innerHTML = renderBlocksToHtml(doc.blocks);
      updateDocument(doc.blocks, doc.fields as any);
      console.log('📄 Документ загружен:', doc.name);
    }
  });

  // ⌨️ Ctrl+S — быстрое сохранение
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const doc = getDocument();
      if (doc) saveTemplateToDisk(doc);
    }
  });

  return container;
}

function renderBlocksToHtml(blocks: any[]): string {
  const paragraphs: string[][] = [];
  let currentPara: string[] = [];

  for (const block of blocks) {
    if (block.type === 'text') {
      const hasNewline = block.content.endsWith('\n');
      const cleanContent = block.content.replace(/\n$/, '');
      
      if (cleanContent !== '' || currentPara.length > 0) {
        currentPara.push(cleanContent);
      }

      if (hasNewline) {
        paragraphs.push(currentPara);
        currentPara = [];
      }
    } else if (block.type === 'mask') {
      currentPara.push(block.displayText);
    } else if (['echo', 'switch', 'each'].includes(block.type)) {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara);
        currentPara = [];
      }
      const children = renderBlocksToHtml(block.children || []);
      paragraphs.push([`${block.displayText}\n${children}\n{{/${block.type}}}`]);
    }
  }

  if (currentPara.length > 0) {
    paragraphs.push(currentPara);
  }

  // Рендерим каждый абзац. Пустой массив = честная пустая строка (<br>)
  return paragraphs.map(para => {
    const html = para.join('');
    return html === '' ? '<div><br></div>' : `<div>${html}</div>`;
  }).join('');
}