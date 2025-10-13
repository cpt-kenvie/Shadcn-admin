/**
 * 可用字体名称列表（访问 `/settings/appearance` 页面）。
 * 此数组用于生成动态字体类（例如 `font-inter`、`font-manrope`）。
 *
 * 📝 如何添加新字体（Tailwind v4+）：
 * 1. 在此处添加字体名称。
 * 2. 更新 'index.html' 中的 `<link>` 标签，以包含来自 Google Fonts（或其他来源）的新字体。
 * 3. 使用 `@theme inline` 和 `font-family` CSS 变量将新字体添加到 'index.css' 中。
 *
 * 示例：
 * fonts.ts           → 在此数组中添加 'roboto'。
 * index.html         → 添加 Roboto 的 Google Fonts 链接。
 * index.css          → 在 CSS 中添加新字体，例如：
 *   @theme inline {
 *      // ... 其他字体族
 *      --font-roboto: 'Roboto', var(--font-sans);
 *   }
 */
export const fonts = ['inter', 'manrope', 'system'] as const
