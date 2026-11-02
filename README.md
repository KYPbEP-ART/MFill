# 📄 School Doc Constructor — Статус проекта

## 🛠 Стек
- **OS:** NixOS (unstable)
- **App:** Tauri v2 + Rust + TypeScript + Vite
- **UI:** Vanilla TS + CSS (без фреймворков)
- **Package manager:** pnpm

## ⚙️ Окружение (КРИТИЧНО)
- Проект запускается **только через `nix-shell`** (или `direnv allow`)
- Файл `shell.nix` в корне настраивает `PKG_CONFIG_PATH` для GTK/WebKit
- Глобальные `.dev` пакеты убраны из `configuration.nix` — всё в `shell.nix`

## 📁 Структура
- `index.html` — в корне (entry point для Vite)
- `src/main.ts` — точка входа JS, импортирует `styles.css`
- `src-tauri/` — Rust бэкенд, `capabilities/default.json` для прав

## ✅ Что уже работает
- [x] `pnpm tauri dev` запускает нативное окно
- [x] Хот-релоад Vite (CSS/TS)
- [x] Базовое меню с выпадающими списками (через класс `.show`)
- [x] Tauri plugins: `fs`, `dialog`, `shell` подключены в Rust и JS

## 🚧 Что делаем сейчас
- [ ] Реальный импорт `.json` шаблонов через `@tauri-apps/plugin-dialog`
- [ ] Сохранение `recentFiles` в `appDataDir`
- [ ] Вкладка редактора с парсингом `{{id:Label}}`

## 🆘 Если что-то сломалось
1. Проверь, что в `nix-shell`
2. `rm -rf src-tauri/target && pnpm tauri dev`
3. Ошибка `pkg-config ... not found`, проверь `shell.nix`

«Привет! Я Макар, разрабатываю Tauri v2 приложение на NixOS. Вот контекст: [вставляешь содержимое PROJECT_STATUS.md]. Помоги мне с [твоя задача]».