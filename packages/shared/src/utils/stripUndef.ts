export function stripUndef<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter((item) => typeof item !== "undefined").map(stripUndef) as T;
  }

  const result = Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = stripUndef(value);
    }
    return acc;
  }, {} as T);

  return result;
}
