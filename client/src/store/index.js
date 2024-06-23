import { atom, map } from "nanostores";

export const $gameConfigStep = atom(0);
export const $isLoading = atom(false);
export const $gameConfigData = map({
  setup: "",
  medium: "",
  contact: ""
});
