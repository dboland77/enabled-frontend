export function merge(target: any, ...sources: any) {
  for (let source of sources) {
    mergeValue(target, source);
  }

  return target;

  function innerMerge(target: any, source: any) {
    for (let [key, value] of Object.entries(source)) {
      target[key] = mergeValue(target[key], value);
    }
  }

  function mergeValue(targetValue: any, value: any) {
    if (Array.isArray(value)) {
      if (!Array.isArray(targetValue)) {
        return [...value];
      } else {
        for (let i = 0, l = value.length; i < l; i++) {
          targetValue[i] = mergeValue(targetValue[i], value[i]);
        }
        return targetValue;
      }
    } else if (typeof value === 'object') {
      if (targetValue && typeof targetValue === 'object') {
        innerMerge(targetValue, value);
        return targetValue;
      } else {
        return value ? { ...value } : value;
      }
    } else {
      return value ?? targetValue ?? undefined;
    }
  }
}
