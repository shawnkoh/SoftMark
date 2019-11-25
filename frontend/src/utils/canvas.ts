export const getPage = (num: number, pdf) => {
  return new Promise((resolve, reject) => {
    pdf.getPage(num).then(page => {
      const scale = 3;
      const viewport = page.getViewport(scale);
      const canvas = document.createElement("canvas");
      const canvasContext = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page
        .render({
          canvasContext,
          viewport
        })
        .promise.then(() => {
          resolve(canvas.toDataURL("image/jpeg"));
        });
    });
  });
};
