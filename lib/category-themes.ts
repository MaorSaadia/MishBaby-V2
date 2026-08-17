export const categoryThemeOptions = [
  { title: "Soft cyan", value: "cyan", className: "bg-[#c7eff8]" },
  { title: "Soft mint", value: "mint", className: "bg-[#d9f4ee]" },
  { title: "Soft blue", value: "blue", className: "bg-[#dbe9fb]" },
  { title: "Soft aqua", value: "aqua", className: "bg-[#dff4f8]" },
  { title: "Soft sage", value: "sage", className: "bg-[#d8eee5]" },
  { title: "Soft green", value: "green", className: "bg-[#e2f2e8]" },
] as const;

export type CategoryTheme = (typeof categoryThemeOptions)[number]["value"];

export function getCategoryThemeClass(theme: CategoryTheme) {
  return categoryThemeOptions.find((option) => option.value === theme)?.className ?? categoryThemeOptions[0].className;
}
