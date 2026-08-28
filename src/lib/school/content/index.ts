import type { SchoolContent } from "../types";

import { en } from "./en";

export const schoolLocales = { en } satisfies Record<string, SchoolContent>;

export type SchoolLocale = keyof typeof schoolLocales;

export const defaultSchoolLocale: SchoolLocale = "en";

export function getSchoolContent(locale: SchoolLocale = defaultSchoolLocale): SchoolContent {
  return schoolLocales[locale] ?? schoolLocales[defaultSchoolLocale];
}
