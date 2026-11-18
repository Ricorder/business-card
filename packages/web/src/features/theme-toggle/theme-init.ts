export const THEME_STORAGE_KEY = 'card-theme'

/**
 * Тема выбирается до гидратации: иначе тёмная страница мигает белой на каждом
 * заходе. Инлайновый скрипт — единственный способ для статического экспорта,
 * серверного рантайма здесь нет.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (error) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`
