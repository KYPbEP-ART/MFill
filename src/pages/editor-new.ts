import editorHTMLTemplate from '../structure/editor.html?raw';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TemplateMask } from '../extensions/templateMask';
import { createNewDocument, getDocument, updateDocument } from '../core/documentState';
import { saveTemplateToDisk, loadTemplateFromDisk } from '../core/fileOps';
import type { TemplateDocument } from '../types/document';
import { validateMasks } from '../core/validation';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '../extensions/fontSize';

let currentEditor: Editor | null = null;
export function getCurrentEditor() { return currentEditor; }

export function createEditorView(tabId: string, initialDoc?: TemplateDocument): HTMLElement {
  const container = document.createElement('div');
  container.className = 'editor-container';
  container.innerHTML = editorHTMLTemplate.replace(/{{TAB_ID}}/g, tabId);

  const pageElement = container.querySelector('.a4-page') as HTMLElement;
  if (!pageElement) return container;

  // --- Инициализация документа ---
  let doc = initialDoc || getDocument();
  if (!doc) {
    doc = createNewDocument('Новый шаблон');
  }

  // Конвертация старого формата при необходимости
  let content: any = null;
  if (doc.content) {
    content = doc.content; // уже в новом формате
  } else if (doc.blocks) {
    // миграция из старого Block[] в Tiptap JSON
    content = blocksToTiptapJSON(doc.blocks);
  }

  // --- Создание редактора ---
  const editor = new Editor({
    element: pageElement,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        bulletList: {},
        orderedList: {},
      }),
      TemplateMask,
      Placeholder.configure({
        placeholder: 'Начните печатать...',
      }),
      FontSize,
      FontFamily,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: content || '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      const newContent = editor.getJSON();
      updateDocument(newContent, doc!.fields);
    },
  });

  currentEditor = editor;

  // --- Привязка кнопок форматирования ---
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = (btn as HTMLElement).dataset.action;
      if (!action) return;
      if (action === 'bold') editor.chain().focus().toggleBold().run();
      else if (action === 'italic') editor.chain().focus().toggleItalic().run();
      else if (action === 'underline') editor.chain().focus().toggleUnderline().run();
      else if (action === 'align-left') editor.chain().focus().setTextAlign('left').run();
      else if (action === 'align-center') editor.chain().focus().setTextAlign('center').run();
      else if (action === 'align-right') editor.chain().focus().setTextAlign('right').run();
      else if (action === 'align-justify') editor.chain().focus().setTextAlign('justify').run();
    });
  });

  // --- Сохранение и загрузка (подключаем с валидацией) ---
  container.querySelector('[data-action="save-template"]')?.addEventListener('click', async () => {
    const currentDoc = getDocument();
    if (!currentDoc) return;
    const errors = validateMasks(editor);
    if (errors.length > 0) {
      alert('Ошибки в масках:\n' + errors.map(e => `• ${e.message}`).join('\n'));
      return;
    }
    await saveTemplateToDisk(currentDoc);
  });

  container.querySelector('[data-action="open-template"]')?.addEventListener('click', async () => {
    const loaded = await loadTemplateFromDisk();
    if (loaded && editor) {
      if (loaded.content) {
        editor.commands.setContent(loaded.content);
      } else if (loaded.blocks) {
        editor.commands.setContent(blocksToTiptapJSON(loaded.blocks));
      }
      updateDocument(editor.getJSON(), loaded.fields as any);
    }
  });

  // Шрифт
  container.querySelector('.font-selector')?.addEventListener('change', (e) => {
    const font = (e.target as HTMLSelectElement).value;
    editor.chain().focus().setFontFamily(font).run();
  });

  // Размер шрифта
  container.querySelector('.font-size-input')?.addEventListener('change', (e) => {
    const size = (e.target as HTMLInputElement).value;
    if (size) {
      editor.chain().focus().setFontSize(`${size}px`).run();
    }
  });

  // Регистр (пока только uppercase/lowercase/capitalize — без sentence)
  container.querySelector('.case-selector')?.addEventListener('change', (e) => {
    // TODO: реализовать регистр позже
    console.log('Выбран регистр:', (e.target as HTMLSelectElement).value);
  });

  // Нумерация
  container.querySelector('.list-type-selector')?.addEventListener('change', (e) => {
    const value = (e.target as HTMLSelectElement).value;
    if (value === 'bullet') editor.chain().focus().toggleBulletList().run();
    else if (value === 'ordered') editor.chain().focus().toggleOrderedList().run();
    else if (value === 'none') {
      // снять список, если есть
      editor.chain().focus().liftListItem('listItem').run();
    }
    // ordered-alpha позже через кастомный список
  });

  // Отступ (first-line / hanging) — в Tiptap нет встроенной команды, пока можно сделать заглушку
  container.querySelector('.indent-selector')?.addEventListener('change', (e) => {
    const value = (e.target as HTMLSelectElement).value;
    // TODO: реализовать через CSS-классы или кастомные расширения
    console.log('Выбран отступ:', value);
  });

  const modeToggle = container.querySelector('#mode-toggle') as HTMLButtonElement;
  let isEditorMode = true; // или читать из состояния

  modeToggle?.addEventListener('click', () => {
    isEditorMode = !isEditorMode;
    modeToggle.innerHTML = isEditorMode ? '🛠️ Конструктор' : '✏️ Редактор';
    // Здесь позже будет реальное переключение поведения редактора
    console.log('Режим переключён:', isEditorMode ? 'редактор' : 'конструктор');
  });

  return container;
}

// --- Вспомогательные конвертеры (пока здесь, потом вынесем) ---
function blocksToTiptapJSON(blocks: any[]): any {
  const doc: any = { type: 'doc', content: [] };
  let currentParagraph: any[] = [];

  for (const block of blocks) {
    if (block.type === 'text') {
      // текст может содержать HTML-теги форматирования, пока игнорируем,
      // позже можно написать парсер HTML -> marks
      const text = block.content.replace(/<[^>]+>/g, ''); // упрощённо
      currentParagraph.push({ type: 'text', text });
      // переносы строк создают новый параграф
      if (text.endsWith('\n')) {
        doc.content.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = [];
      }
    } else if (block.type === 'mask') {
      currentParagraph.push({
        type: 'templateMask',
        attrs: {
          type: block.maskType,
          fieldId: block.fieldId,
          displayText: block.displayText,
          format: block.optionsRaw || '',
        },
      });
    }
  }
  if (currentParagraph.length > 0) {
    doc.content.push({ type: 'paragraph', content: currentParagraph });
  }
  return doc;
}