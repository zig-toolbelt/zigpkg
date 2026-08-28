import { getContext, setContext } from "svelte";

import type { SchoolContent } from "./types";

const KEY = Symbol("school-content");

export function setSchoolContext(content: SchoolContent): void {
  setContext(KEY, content);
}

export function useSchool(): SchoolContent {
  const content = getContext<SchoolContent | undefined>(KEY);
  if (!content) throw new Error("School content is not provided");
  return content;
}
