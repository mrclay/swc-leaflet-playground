export const niceColors = [
  "#ff4136",
  "#3d9970",
  "#39cccc",
  "#85144b",
  "#2ecc40",
  "#b10dc9",
  "#ff851b",
  "#0074d9",
  "#aaaaaa",
  "#001f3f",
];

let colorCounter = 0;

export function niceColor(): string {
  return niceColors[colorCounter++ % niceColors.length];
}

export function changeColor(old: string): string {
  const next = niceColor();
  return old === next ? niceColor() : next;
}

export function randomDarkColor(): string {
  const one = () =>
    Math.floor(Math.random() * 155)
      .toString(16)
      .padStart(2, "0");
  return "#" + [0, 1, 3].map(one).join("");
}
