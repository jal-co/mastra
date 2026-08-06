export const MAX_USER_SESSION_NAME_INDEX = 999_999_999;

export function nextUserSessionNameIndex(previous: number | undefined, atLeast: number): number {
  if (!Number.isInteger(atLeast) || atLeast < 1 || atLeast > MAX_USER_SESSION_NAME_INDEX) {
    throw new Error(`User-session name index must be between 1 and ${MAX_USER_SESSION_NAME_INDEX}.`);
  }
  const next = previous === undefined ? atLeast : Math.max(previous + 1, atLeast);
  if (next > MAX_USER_SESSION_NAME_INDEX) throw new Error('User-session name index space exhausted.');
  return next;
}
