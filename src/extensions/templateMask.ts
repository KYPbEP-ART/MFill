// src/extensions/templateMask.ts
import { Node, InputRule } from '@tiptap/core';

const MASK_REGEX = /\{\{(\w+):([\wа-яА-ЯёЁ\-]+)(?::([^}]+))?\}\}$/;

export const TemplateMask = Node.create({
  name: 'templateMask',
  group: 'inline',
  inline: true,
  atom: false,           // в шаблоне можно редактировать как текст

  addAttributes() {
    return {
      type: { default: 'text' },
      fieldId: { default: '' },
      format: { default: '' },
      displayText: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-template-mask]' }];
  },

  renderHTML({ node }) {
    const { type, fieldId, format, displayText } = node.attrs;
    return [
      'span',
      {
        'data-template-mask': 'true',
        'data-type': type,
        'data-id': fieldId,
        'data-format': format,
        class: 'template-mask',
      },
      displayText || `{{${type}:${fieldId}${format ? ':' + format : ''}}}`,
    ];
  },

  addInputRules() {
    return [
      new InputRule({
        find: MASK_REGEX,
        handler: ({ state, range, match }) => {
          const [full, type, fieldId, format] = match;
          const displayText = full;
          const { tr } = state;
          tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ type, fieldId, format: format || '', displayText })
          );
        },
      }),
    ];
  },
});