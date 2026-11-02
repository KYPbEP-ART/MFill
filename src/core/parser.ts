import type { Block, MaskType } from '../types/document';

const INLINE_MASK = /{{(\w+):([\wа-яА-ЯёЁ\-]+)(?::([^}]+))?}}/g;
// const CONTAINER_START = /{{(echo|switch|each):([\wа-яА-ЯёЁ\-]+)(?::([^}]+))?}}/;
// const CONTAINER_END = /{{\/(echo|switch|each)}}/;

export function parseHtmlToBlocks(html: string): { blocks: Block[]; fields: Record<string, any> } {
  const blocks: Block[] = [];
  const fields: Record<string, any> = {};

  // 1. Нормализация и очистка
  let normalized = html
    .replace(/<div><br><\/div>/gi, '\n') // Пустой div с br (частый случай в Chrome)
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<p><br><\/p>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?!\/?(?:b|strong|i|em|u)\b)[^>]+>/gi, '') // Оставляем только теги форматирования
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // 🔑 Максимум 1 пустая строка (2 переноса)
    .trim(); // 🔑 УБИРАЕМ мусорные переносы в самом начале и в самом конце документа!

  if (!normalized) return { blocks, fields };

  const lines = normalized.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '') {
      // 🔑 Это честная пустая строка между абзацами
      blocks.push({ id: crypto.randomUUID(), type: 'text', content: '\n' });
      continue;
    }

    const { blocks: lineBlocks, fields: lineFields } = parseTextToBlocks(line);
    
    // Добавляем \n в конец, если это не последняя строка в документе
    if (i < lines.length - 1 && lineBlocks.length > 0) {
      const lastBlock = lineBlocks[lineBlocks.length - 1];
      if (lastBlock.type === 'text') {
        lastBlock.content += '\n';
      } else {
        // Если строка заканчивается маской, добавляем текстовый блок с переносом
        lineBlocks.push({ id: crypto.randomUUID(), type: 'text', content: '\n' });
      }
    }
    
    blocks.push(...lineBlocks);
    Object.assign(fields, lineFields);
  }

  return { blocks, fields };
}

function parseTextToBlocks(text: string): { blocks: Block[]; fields: Record<string, any> } {
  const blocks: Block[] = [];
  const fields: Record<string, any> = {};
  let lastIndex = 0;
  const regex = new RegExp(INLINE_MASK.source, 'g');
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [full, type, name, optionsRaw] = match;
    const startIdx = match.index;
    
    // 🔑 Текст до маски — НЕ делаем trim(), сохраняем пробелы
    if (startIdx > lastIndex) {
      const preceding = text.slice(lastIndex, startIdx);
      // Проверяем trim() только для того, чтобы не добавлять пустые блоки
      if (preceding.trim()) {
        blocks.push({ id: crypto.randomUUID(), type: 'text', content: preceding });
      }
    }
    
    blocks.push({ 
      id: crypto.randomUUID(), 
      type: 'mask', 
      maskType: type as MaskType, 
      fieldId: name, 
      displayText: full 
    });
    fields[name] = { type, label: name, options: optionsRaw?.split('|') };
    lastIndex = startIdx + full.length;
  }

  // 🔑 Текст после последней маски — тоже НЕ делаем trim()
  const remaining = text.slice(lastIndex);
  if (remaining.trim()) {
    blocks.push({ id: crypto.randomUUID(), type: 'text', content: remaining });
  }

  return { blocks, fields };
}