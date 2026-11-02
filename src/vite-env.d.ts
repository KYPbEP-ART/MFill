/// <reference types="vite/client" />

// Сообщаем TS, что импорты вида *.html?raw возвращают строку
declare module '*.html?raw' {
  const src: string;
  export default src;
}

// На всякий случай покрываем и другие ?raw импорты
declare module '*?raw' {
  const src: string;
  export default src;
}