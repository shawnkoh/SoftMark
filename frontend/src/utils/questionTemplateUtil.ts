const PAGE_REGEX = /^(?:(?:[0-9]+|[0-9+]-[0-9]+)+\s*,\s*)+$/;
const SINGLE_PAGE_REGEX = /^[0-9]+$/;
const MULTI_PAGE_REGEX = /^[0-9]+-[0-9]+$/;

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
  let splited = pages.split(/\s*,\s*/);
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
