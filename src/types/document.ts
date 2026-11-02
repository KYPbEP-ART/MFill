// src/types/document.ts
export type MaskType = 'text' | 'number' | 'date' | 'select' | 'switch' | 'each' | 'echo';

export interface BaseBlock {
  id: string;
  type: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  styles?: { bold?: boolean; italic?: boolean; fontSize?: number };
}

export interface MaskBlock extends BaseBlock {
  type: 'mask';
  maskType: MaskType;
  fieldId: string;
  displayText: string; // например "{{text:ФИО}}"
}

export interface ContainerBlock extends BaseBlock {
  type: 'echo' | 'switch' | 'each';
  fieldId: string;
  displayText: string; // например "{{echo:имя}}"
  children: Block[];   // ← вложенные блоки (решают проблему многострочных масок)
}

export type Block = TextBlock | MaskBlock | ContainerBlock;

export interface TemplateDocument {
  id: string;
  name: string;
  version: string;
  blocks?: Block[];           // устаревшее, оставляем для старых файлов
  content?: any;              // новое: ProseMirror JSON
  fields: Record<string, { type: string; label: string; options?: string[] }>;
  createdAt: string;
  updatedAt: string;
}