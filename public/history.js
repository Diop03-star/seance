// The server only reads the last 12 messages; keeping more would only grow the request past its 64 KB limit.
export const HISTORY_KEEP = 12;

export function remember(history, ...messages) {
  history.push(...messages);
  if (history.length > HISTORY_KEEP) history.splice(0, history.length - HISTORY_KEEP);
  return history;
}
