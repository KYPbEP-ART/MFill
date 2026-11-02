import { invoke } from '@tauri-apps/api/core';
import { save as saveDialog, open as openDialog } from '@tauri-apps/plugin-dialog';
import type { TemplateDocument } from '../types/document';

/** Сохранить шаблон на диск через диалог */
export async function saveTemplateToDisk(doc: TemplateDocument): Promise<string | null> {
  const path = await saveDialog({
    title: 'Сохранить шаблон',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    defaultPath: `${doc.name.replace(/[^a-zа-я0-9]/gi, '_')}.json`
  });
  
  if (!path) return null;
  
  try {
    await invoke('save_template', { data: doc, path });
    console.log('✅ Шаблон сохранён:', path);
    return path;
  } catch (e) {
    console.error('❌ Ошибка сохранения:', e);
    alert(`Не удалось сохранить: ${e}`);
    return null;
  }
}

/** Загрузить шаблон с диска через диалог */
export async function loadTemplateFromDisk(): Promise<TemplateDocument | null> {
  const path = await openDialog({
    filters: [{ name: 'JSON', extensions: ['json'] }],
    multiple: false
  });
  
  if (!path) return null;
  
  try {
    const doc = await invoke<TemplateDocument>('load_template', { path });
    console.log('✅ Шаблон загружен:', path);
    return doc;
  } catch (e) {
    console.error('❌ Ошибка загрузки:', e);
    alert(`Не удалось загрузить: ${e}`);
    return null;
  }
}