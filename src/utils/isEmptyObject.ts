export const isEmptyObject = (obj: any) =>
  obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
