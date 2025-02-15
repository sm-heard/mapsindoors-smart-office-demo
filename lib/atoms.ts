import { atom } from "jotai";

const lightPresetAtom = atom("dawn");
const buttonDisabledAnimationAtom = atom(true);
const loginStateAtom = atom("staff");
const dateStateAtom = atom<Date | undefined>(new Date());
const dateToIdsMapAtom = atom({});
const bookingStateAtom = atom(false);
const selectedLocationAtom = atom(null);
const calendarOpenAtom = atom(false);
const locationsAtom = atom([]);
const originStateAtom = atom(null);
const originValueAtom = atom("");
const originOpenAtom = atom(false);
const destStateAtom = atom(null);
const destValueAtom = atom("");
const destOpenAtom = atom(false);
const directionsStateAtom = atom(false);
const isBlueDotDirectionAtom = atom(true);
const isBlueDotDirection2Atom = atom(false);
const directionsResultStateAtom = atom(null);
const directionsCardOpenAtom = atom(false);
const openAtom = atom(false);
const valueAtom = atom("");
const categoryValueAtom = atom("");
const isCategoryToggledAtom = atom(false);
const restroomsListAtom = atom([]);
const meetingroomsListAtom = atom([]);
const canteensListAtom = atom([]);
const nearestRestroomAtom = atom(null);
const nearestMeetingroomAtom = atom(null);
const nearestCanteenAtom = atom(null);

export {
  lightPresetAtom,
  buttonDisabledAnimationAtom,
  loginStateAtom,
  dateStateAtom,
  dateToIdsMapAtom,
  bookingStateAtom,
  selectedLocationAtom,
  calendarOpenAtom,
  locationsAtom,
  originStateAtom,
  originValueAtom,
  originOpenAtom,
  destStateAtom,
  destValueAtom,
  destOpenAtom,
  directionsStateAtom,
  isBlueDotDirectionAtom,
  isBlueDotDirection2Atom,
  directionsResultStateAtom,
  directionsCardOpenAtom,
  openAtom,
  valueAtom,
  categoryValueAtom,
  isCategoryToggledAtom,
  restroomsListAtom,
  meetingroomsListAtom,
  canteensListAtom,
  nearestRestroomAtom,
  nearestMeetingroomAtom,
  nearestCanteenAtom,
};
