const csrfTag = document.querySelector('meta[name="csrf-token"]');
const csrfToken = csrfTag ? csrfTag.getAttribute("content") : null;

const csrfHeader: { "x-csrf-token"?: string } = csrfToken
  ? { "x-csrf-token": csrfToken }
  : {};
export { csrfToken, csrfHeader };
