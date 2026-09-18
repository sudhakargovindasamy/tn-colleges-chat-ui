// This service handles chat responses.
// Now calls the real backend API instead of the fake sample data.

const API_BASE_URL = 'https://tnea-ai-eng.onrender.com'

export async function sendMessage(question) {
  try {
    const res = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.error('Backend error:', res.status, errorText)

      return {
        status: 'no-results',
        answer:
          'Something went wrong reaching the college database. Please try again in a moment.',
        sources: [],
      }
    }

    const data = await res.json()

    // The backend's exact field names may differ slightly (answer / response /
    // result / message). This tries the common possibilities so the UI doesn't
    // silently break if the field name isn't exactly "answer".
    const answerText =
      data.answer ??
      data.response ??
      data.result ??
      data.message ??
      'No answer was returned by the server.'

    const sources = Array.isArray(data.sources)
      ? data.sources
      : Array.isArray(data.source_documents)
      ? data.source_documents
      : []

    return {
      status: 'success',
      answer: answerText,
      sources,
    }
  } catch (error) {
    console.error('Failed to reach backend:', error)

    return {
      status: 'no-results',
      answer:
        'Unable to reach the college database right now. Please check your connection and try again.',
      sources: [],
    }
  }
}