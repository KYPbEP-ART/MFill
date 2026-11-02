import { Mark, mergeAttributes } from '@tiptap/core';

export interface FontSizeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[style*="font-size"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize: (size: string) => ({ commands }) => {
        return commands.setMark(this.name, { size });
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});