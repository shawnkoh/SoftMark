import QuestionTemplate from "../entities/QuestionTemplate";
import { QuestionTemplateTreeData } from "../types/questionTemplates";
const PAGE_REGEX = /^(?:(?:[0-9]+|[0-9+]-[0-9]+)+\s*,\s*)+$/;
const SINGLE_PAGE_REGEX = /^[0-9]+$/;
const MULTI_PAGE_REGEX = /^[0-9]+-[0-9]+$/;

/**
 * Convert pages covered from string to number set
 * @param pages pages convered (e.g. '1,3-5')
 */
export function generatePages(pages: string) {
  let pageSet = new Set<number>();
  pages.split(/\s*,\s*/).forEach(value => {
    if (SINGLE_PAGE_REGEX.test(value)) {
      pageSet.add(+value);
    } else if (MULTI_PAGE_REGEX.test(value)) {
      const range = value.split("-").map(v => +v);
      const smaller = Math.min(range[0], range[1]);
      const larger = Math.max(range[0], range[1]);
      for (let v = smaller; v <= larger; v++) {
        pageSet.add(v);
      }
    }
  });
  return pageSet;
}

/**
 * Check if the pages convered are valid string
 * @param pages pages convered (e.g. '1,3-5')
 * @param pageCount number of pages
 */
export function isPageValid(pages: string, pageCount: number) {
  pages += ",";
  if (!PAGE_REGEX.test(pages)) return false;
  let splited = pages.split(/\s*,\s*/);
  for (let i = 0; i < pages.length - 1; i++) {
    let value = splited[i];
    if (SINGLE_PAGE_REGEX.test(value)) {
      if (+value > pageCount || +value === 0) {
        return false;
      }
    } else if (MULTI_PAGE_REGEX.test(value)) {
      const range = value.split("-").map(v => +v);
      const smaller = Math.min(range[0], range[1]);
      const larger = Math.max(range[0], range[1]);
      if (smaller === 0 || larger > pageCount) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Clean up the pages to shortest form
 * @param pages pages convered (e.g. '1,3-5')
 */
export function cleanPage(pages: string) {
  const arr = Array.from(generatePages(pages)).sort();
  let cleanedPage = "";
  let currentMin = arr[0];
  let isRange = false;
  for (let i = 1; i < arr.length; i++) {
    if ((arr[i] = arr[i - 1] + 1)) {
      isRange = true;
    } else {
      if (isRange) {
        isRange = false;
        cleanedPage += currentMin + "-" + arr[i];
      } else {
        cleanedPage += +currentMin;
      }
      currentMin = arr[i];
      cleanedPage += ",";
    }
  }
  return cleanedPage.slice(0, -1);
}

/**
 * Recursively traverse trees to _.pick only the relevant fields
 * @param root note that the roots should be active
 */
export function cleanTrees(
  roots: QuestionTemplate[]
): QuestionTemplateTreeData[] {
  return roots
    .filter(t => !t.discardedAt)
    .map(root => {
      return {
        id: root.id,
        name: root.name,
        score: root.score,
        displayPage: root.displayPage,
        childQuestionTemplates: root.childQuestionTemplates
          ? cleanTrees(root.childQuestionTemplates)
          : []
      };
    });
}
