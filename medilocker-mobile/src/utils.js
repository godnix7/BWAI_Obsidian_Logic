export function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

export function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function cleanObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
}
