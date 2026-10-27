// Reads the server's NDJSON stream: {"t": fragment}… then {"done": true, "ms": n}.
export async function readNdjson(response, onText) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = { ms: null };

  const handle = (line) => {
    if (!line.trim()) return;
    const data = JSON.parse(line);
    if (data.error) throw new Error(data.error);
    if (typeof data.t === 'string') onText(data.t);
    if (data.done) result = { ms: data.ms };
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      handle(buffer.slice(0, nl));
      buffer = buffer.slice(nl + 1);
    }
  }
  handle(buffer + decoder.decode());
  return result;
}
