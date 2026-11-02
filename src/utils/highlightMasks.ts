// src/utils/highlightMasks.ts
const MASK_REGEX = /{{[\wа-яА-ЯёЁ\-]+:[\wа-яА-ЯёЁ\-]+(?::[^}]+)?}}/g;

export function applyMaskHighlight(editor: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  // 1. Запоминаем позицию курсора (в символах от начала редактора)
  const preRange = range.cloneRange();
  preRange.selectNodeContents(editor);
  preRange.setEnd(range.startContainer, range.startOffset);
  const caretOffset = preRange.toString().length;

  // 2. Удаляем старые подсветки, не ломая текст
  const oldSpans = editor.querySelectorAll('.tpl-mask');
  oldSpans.forEach(span => {
    const parent = span.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(span.textContent!), span);
      parent.normalize(); // Склеиваем соседние текстовые узлы
    }
  });

  // 3. Ищем маски в текстовых узлах и оборачиваем их
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  const textNodes: Text[] = [];
  while ((node = walker.nextNode())) textNodes.push(node as Text);

  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    const matches = [...text.matchAll(MASK_REGEX)];
    if (matches.length === 0) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      const [full] = match;
      const startIdx = match.index!;
      const endIdx = startIdx + full.length;

      // Текст до маски
      if (startIdx > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, startIdx)));
      }

      // Сама маска
      const span = document.createElement('span');
      span.className = 'tpl-mask';
      span.textContent = full;
      fragment.appendChild(span);

      lastIndex = endIdx;
    }

    // Текст после последней маски
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode!.replaceChild(fragment, textNode);
  }

  // 4. Восстанавливаем курсор
  const newRange = document.createRange();
  let currentOffset = 0;
  const newWalker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let found = false;

  while ((node = newWalker.nextNode())) {
    const nodeText = node.textContent || '';
    if (currentOffset + nodeText.length >= caretOffset) {
      newRange.setStart(node, caretOffset - currentOffset);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      found = true;
      break;
    }
    currentOffset += nodeText.length;
  }

  // Fallback: если не нашли → ставим курсор в конец
  if (!found) {
    newRange.selectNodeContents(editor);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}