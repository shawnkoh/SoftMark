export const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getClientPointerRelativeToStage = (clientX, clientY, stage) => {
  return {
    x: clientX - stage.getContent().offsetLeft,
    y: clientY - stage.getContent().offsetTop
  };
};

export const getRelativePointPosition = (point, node) => {
  // the function will return pointer position relative to the passed node
  const transform = node.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();
  // get pointer (say mouse or touch) position
  // now we find relative point
  return transform.point(point);
};

export const getRelativePointerPosition = node => {
  return getRelativePointPosition(node.getStage().getPointerPosition(), node);
};
