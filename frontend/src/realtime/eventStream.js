import api from "../../configs/axiosConfig";

// espera entre as reconexões (o último valor se repete)
const RETRY_DELAYS_MS = [1000, 2000, 3000, 5000];

// quebra o stream sse em mensagens { event, data }
async function readMessages(body, onMessage) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop();

    for (const block of blocks) {
      let event = "message";
      const data = [];
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith(":")) continue; // comment / heartbeat
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
      }
      if (data.length > 0) onMessage({ event, data: data.join("\n") });
    }
  }
}

// abre o stream com fetch (o EventSource não manda o header do jwt) e reconecta se cair.
// devolve uma função que fecha ele
export function connectEventStream({ onEvent, onGamificationEvent, onStatus }) {
  const controller = new AbortController();
  let attempt = 0;
  let wakeUp = null;

  // espera antes de tentar de novo (se voltar pra aba ou a internet voltar, tenta na hora)
  const waitBeforeRetry = (ms) =>
    new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        wakeUp = null;
        resolve();
      };
      const timer = setTimeout(done, ms);
      wakeUp = done;
    });

  const retryNow = () => {
    if (document.visibilityState === "visible") wakeUp?.();
  };
  window.addEventListener("online", retryNow);
  window.addEventListener("focus", retryNow);
  document.addEventListener("visibilitychange", retryNow);

  controller.signal.addEventListener(
    "abort",
    () => {
      window.removeEventListener("online", retryNow);
      window.removeEventListener("focus", retryNow);
      document.removeEventListener("visibilitychange", retryNow);
      wakeUp?.();
    },
    { once: true },
  );

  const run = async () => {
    while (!controller.signal.aborted) {
      const token = localStorage.getItem("token");
      if (!token) {
        onStatus("offline");
        return;
      }

      onStatus("connecting");
      try {
        const response = await fetch(`${api.defaults.baseURL}/api/v1/events/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          cache: "no-store",
          signal: controller.signal,
        });

        // sessão expirou
        if (response.status === 401) {
          onStatus("offline");
          return;
        }
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        await readMessages(response.body, ({ event, data }) => {
          if (event === "connected") {
            attempt = 0;
            onStatus("live");
          } else if (event === "wallet-event") {
            onEvent(JSON.parse(data));
          } else if (event === "gamification-event") {
            onGamificationEvent?.(JSON.parse(data));
          }
        });
        // o servidor fechou o stream: reconecta
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn("Real-time connection lost", err);
      }

      onStatus("connecting");
      await waitBeforeRetry(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]);
      attempt += 1;
    }
  };

  run();
  return () => controller.abort();
}
