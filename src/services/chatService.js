// src/services/chatService.js

// Safe backend base URL: prefer env var, fallback to production Render URL in prod, or localhost in dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://tnea-ai-eng.onrender.com' : 'http://localhost:8000');

function getSessionId() {
  try {
    let id = localStorage.getItem('tnea_session_id');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('tnea_session_id', id);
    }
    return id;
  } catch (_) {
    return 'frontend-web-user';
  }
}

/**
 * Non-blocking call to wake up Render free tier instances proactively on mount.
 */
export async function warmupBackend() {
  try {
    fetch(`${API_BASE_URL}/warmup`, { method: 'GET', mode: 'cors' }).catch(() => {});
  } catch (_) {}
}

export async function sendMessage(question) {
  // Generate a fresh session ID per request to keep queries fast (~2s)
  // and prevent Render free-tier (512MB RAM) from crashing due to history re-writing
  const activeSessionId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);

  try {
    // Call FastAPI /query endpoint with required schema fields
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        question: question,
        session_id: activeSessionId,
        top_k: 5,
      }),
    });

    if (!response.ok) {
      // Render free tier returns 502/503/504 when cold-starting or restarting
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error('COLD_START');
      }
      const errorText = await response.text().catch(() => '');
      throw new Error(`Backend returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Map backend sources to the format frontend UI expects
    const mappedSources = (data.sources || []).map((src) => ({
      name: src.college_name || 'TNEA Rules',
      detail: src.district
        ? `${src.district} | TNEA Code: ${src.tnea_code}`
        : `TNEA Code: ${src.tnea_code}`,
    }));

    // Return in the format App.jsx expects
    return {
      status: data.answer && data.answer.trim() !== '' ? 'success' : 'no-results',
      answer:
        data.answer ||
        'No matching results were found in the current dataset. Try another college, district, or course.',
      sources: mappedSources,
    };
  } catch (error) {
    console.error('Chat service error:', error);

    // Timeout triggered
    if (error.name === 'AbortError') {
      return {
        status: 'no-results',
        answer:
          'Request timed out waiting for the server. The free-tier backend is currently under load or restarting. Please try again in a few seconds.',
        sources: [],
      };
    }

    // Render free-tier cold start — service needs ~30-60s to wake up
    if (error.message === 'COLD_START') {
      return {
        status: 'no-results',
        answer:
          'The counselor server is currently waking up (Render free tier takes 30–60 seconds). Please try sending your message again in a moment.',
        sources: [],
      };
    }

    // CORS block or connection failure
    if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
      return {
        status: 'no-results',
        answer:
          'Unable to reach the counselor server. The service may be starting up or sleeping on Render. Please wait 30–60 seconds and try again.',
        sources: [],
      };
    }

    // Fallback UI state if the backend is unreachable
    return {
      status: 'no-results',
      answer:
        'Sorry, I could not connect to the college database. Please check your internet connection or try again shortly.',
      sources: [],
    };
  } finally {
    clearTimeout(timeoutId);
  }
}