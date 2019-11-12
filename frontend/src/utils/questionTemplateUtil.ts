const PAGE_REGEX = /"^(?:(?:[0-9]+|[0-9+]-[0-9]+)+, )+$/;
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
export function isPageValid(
  pages: string,
  currentPage: number,
  pageCount: number
) {
  pages += ", ";
  if (!PAGE_REGEX.test(pages)) return "Syntax incorrect";
  let splited = pages.split(/, /);
  let currentIncluded = false;
  for (let i = 0; i < pages.length - 1; i++) {
    let value = splited[i];
    if (SINGLE_PAGE_REGEX.test(value)) {
      if (+value > pageCount || +value === 0) {
        return `Page ${value} is out of range`;
      } else if (+value === currentPage) {
        currentIncluded = true;
      }
    } else if (MULTI_PAGE_REGEX.test(value)) {
      const range = value.split("-").map(v => +v);
      const smaller = Math.min(range[0], range[1]);
      const larger = Math.max(range[0], range[1]);
      if (smaller === 0 || larger > pageCount) {
        return `In ${range}, out of range pages are covered`;
      } else if (smaller <= currentPage && currentPage <= larger) {
        currentIncluded = true;
      }
    }
  }
  return currentIncluded ? undefined : "Current page need to be included";
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
