school-doc-constructor/
├── index.html                 # Один entry point, как у тебя на сайте
├── src/
│   ├── main.ts                # Точка входа: инициализирует всё
│   ├── core/
│   │   ├── router.ts          # showPage(), createPage() — навигация
│   │   ├── tabs.ts            # Логика вкладок (создание, закрытие, drag)
│   │   └── menu.ts            # Выпадающие меню
│   ├── pages/
│   │   ├── home.ts            # Домашняя страница (кнопки, списки, новости)
│   │   ├── editor.ts          # Word-подобный редактор (лента, A4, парсинг)
│   │   └── settings.ts        # Настройки (заглушка)
│   ├── components/
│   │   ├── ribbon.ts          # Лента инструментов (Главная/Вставка...)
│   │   ├── page-a4.ts         # Компонент страницы А4
│   │   └── field-parser.ts    # Парсер масок {{text:имя}}
│   ├── styles/
│   │   ├── variables.css      # CSS-переменные (как в Retro-GAMMA)
│   │   ├── layout.css         # Сетка, вкладки, меню
│   │   ├── widgets.css        # Кнопки, инпуты, аккордеоны
│   │   └── editor.css         # Стили редактора (лента, A4)
│   └── utils/
│       ├── dom.ts             # createElement, qs, qsa — утилиты
│       └── storage.ts         # Работа с localStorage / Tauri FS
├── src-tauri/                 # Rust-бэкенд (не трогаем, пока работает)
├── package.json
├── shell.nix                  # Окружение (не трогаем)
└── PROJECT_NOTES.md          # 📝 Твои заметки: «что где лежит»