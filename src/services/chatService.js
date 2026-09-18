// src/services/chatService.js

// Get the backend URL from environment variables, fallback to localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function sendMessage(question) {
  try {
    // 1. Call the actual FastAPI /query endpoint
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        session_id: 'frontend-web-user', // Can be made dynamic later with UUID
        top_k: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data = await response.json();

    // 2. Map backend sources to the format your frontend UI components expect
    const mappedSources = (data.sources || []).map((src) => ({
      name: src.college_name || 'TNEA Rules',
      detail: src.district 
        ? `${src.district} | TNEA Code: ${src.tnea_code}` 
        : `TNEA Code: ${src.tnea_code}`,
    }));

    // 3. Return in the exact format your App.jsx/UI expects
    return {
      status: data.answer && data.answer.trim() !== '' ? 'success' : 'no-results',
      answer: data.answer || 'No matching results were found in the current sample dataset. Try another college, district, or course.',
      sources: mappedSources,
    };

  } catch (error) {
    console.error('Chat service error:', error);
    
    // Fallback UI state if the backend is unreachable
    return {
      status: 'no-results',
      answer: 'Sorry, I could not connect to the college database. Please ensure the backend API is running and accessible.',
      sources: [],
    };
  }
}