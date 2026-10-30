export const MODEL = 'gemma4:e2b';
const KEEP_ALIVE = '30m';

export class OllamaDown extends Error {}
export class ModelMissing extends OllamaDown {}

async function call(url, path, body, signal) {
  let res;
  try {
    res = await fetch(url + path, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new OllamaDown(err.message);
  }
  if (res.status === 404) throw new ModelMissing(`HTTP ${res.status}`);
  if (!res.ok) throw new OllamaDown(`HTTP ${res.status}`);
  return res;
}

// Yields text fragments from Ollama's NDJSON chat stream.
export async function* streamChat({ url, messages, numPredict, signal }) {
  const res = await call(url, '/api/chat', {
    model: MODEL, messages, stream: true, think: false, keep_alive: KEEP_ALIVE,
    options: { num_predict: numPredict, temperature: 0.9 },
  }, signal);
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      const data = JSON.parse(line);
      if (data.error) throw new OllamaDown(data.error);
      if (data.message?.content) yield data.message.content;
    }
  }
}

export async function chatJson({ url, messages, signal }) {
  const res = await call(url, '/api/chat', {
    model: MODEL, messages, stream: false, think: false, format: 'json', keep_alive: KEEP_ALIVE,
    options: { num_predict: 200, temperature: 0.8 },
  }, signal);
  const data = await res.json();
  return data.message?.content ?? '';
}

export async function health(url) {
  try {
    const res = await call(url, '/api/tags');
    const { models = [] } = await res.json();
    return { ollama: true, model: models.some((m) => m.name === MODEL || m.model === MODEL) };
  } catch {
    return { ollama: false, model: false };
  }
}

// Loads the model into memory so the first séance message does not wait for it.
export function warmUp(url) {
  return call(url, '/api/generate', { model: MODEL, keep_alive: KEEP_ALIVE }).catch(() => {});
}
