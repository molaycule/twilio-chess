import { atom, map } from "nanostores";

export const $gameConfigStep = atom(0);
export const $isLoading = atom(false);
export const $successTitle = atom("");
export const $successDescription = atom("");
export const $gameConfigData = map({
  setup: "",
  medium: "",
  contact: ""
});
