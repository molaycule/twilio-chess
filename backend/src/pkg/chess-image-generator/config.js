export const DEFAULTCONFIG = {
  size: 500,
  light: "rgb(240, 217, 181)",
  dark: "rgb(181, 136, 99)",
  view: "b",
  pieceStyle: "cburnett",
  quality: 1
};

export function applyDefaultConfig(config) {
  return {
    ...DEFAULTCONFIG,
    ...config
  };
}
