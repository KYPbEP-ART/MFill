// src/core/documentState.ts
import type { TemplateDocument } from '../types/document';

let currentDoc: TemplateDocument | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let draftCounter = 0;

export function createNewDocument(name: string = 'Без имени', content: any = null, fields: Record<string, any> = {}): TemplateDocument {
  currentDoc = {
    id: crypto.randomUUID(),
    name,
    version: '1.0',
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  draftCounter++;
  scheduleAutoSave(`.File(${draftCounter}).json`);
  return currentDoc;
}

export function getDocument(): TemplateDocument | null {
  return currentDoc;
}

// Обновлённая сигнатура: принимает Tiptap JSON
export function updateDocument(content: any, fields: Record<string, { type: string; label: string; options?: string[] }> = {}) {
  if (!currentDoc) return;
  currentDoc.content = content;
  currentDoc.fields = fields;
  currentDoc.updatedAt = new Date().toISOString();
  scheduleAutoSave();
}

function scheduleAutoSave(fileName?: string) {
  if (!currentDoc) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      console.log('💾 Autosave →', fileName || 'current_draft.json');
      console.log('📄 JSON:', JSON.stringify(currentDoc, null, 2));
    } catch (e) {
      console.error('❌ Autosave failed:', e);
    }
  }, 1500);
}