export type Theme = "light" | "dark" | "red" | "business";

export const setTheme = (theme: Theme, value?: boolean) => {
  document.documentElement.classList.toggle(theme, Boolean(value));
};

export const isTheme = (theme: Theme) => {
  return document.documentElement.classList.contains(theme);
};
