export const dateToString = (rawDate: Date) => {
  const date = new Date(rawDate);
  return (
    date.getUTCDate().toString() +
    " " +
    date.toLocaleString("default", {
      month: "short"
    }) +
    " " +
    date.getUTCFullYear().toString()
  );
};
