import type { Editor } from '@tiptap/core';

export interface MaskError {
  nodePos: number;
  message: string;
  displayText: string;
}

const SUPPORTED_TYPES = ['text', 'number', 'date', 'select'];

export function validateMasks(editor: Editor): MaskError[] {
  const errors: MaskError[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'templateMask') {
      const { type, fieldId, displayText } = node.attrs;
      if (!SUPPORTED_TYPES.includes(type)) {
        errors.push({
          nodePos: pos,
          displayText,
          message: `Неизвестный тип маски: "${type}"`,
        });
      }
      if (!fieldId || fieldId.trim() === '') {
        errors.push({
          nodePos: pos,
          displayText,
          message: 'ИД маски не может быть пустым',
        });
      }
      // позже добавим проверку формата для number/date
    }
  });
  return errors;
}