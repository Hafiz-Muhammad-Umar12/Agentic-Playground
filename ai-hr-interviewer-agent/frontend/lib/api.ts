const BASE_URL = 'http://127.0.0.1:8000/api';

/* ---------------- TYPES ---------------- */

export interface InterviewQuestion {
  level: string;
  question: string;
}

export interface StartInterviewResponse {
  session_id: string;
  questions: InterviewQuestion[];
  status: string;
  success: boolean;
}

export interface SubmitAnswerResponse {
  next_question: string;
  next_action: string;
  followups: string[];
  evaluation: {
    score: {
      correctness: number;
      clarity: number;
      depth: number;
      technical_accuracy: number;
      total: number;
    };
    feedback: {
      strengths: string[];
      weaknesses: string[];
      improvements: string[];
    };
  };
  success: boolean;
}

/* ---------------- START INTERVIEW ---------------- */

export async function startInterview(
  topic: string
): Promise<StartInterviewResponse> {
  const response = await fetch(`${BASE_URL}/start-interview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Start Interview Error:', errorData);

    throw new Error(
      typeof errorData.detail === 'string'
        ? errorData.detail
        : JSON.stringify(errorData.detail)
    );
  }

  return response.json();
}

/* ---------------- SUBMIT ANSWER (FIXED) ---------------- */

export async function submitAnswer(
  sessionId: string,
  question: string,
  answer: string,
  topic: string
): Promise<SubmitAnswerResponse> {
  const payload = {
    session_id: sessionId,
    question,
    answer,
    topic,
  };

  console.log('Submitting Payload:', payload); // DEBUG

  const response = await fetch(`${BASE_URL}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    console.error('Submit Answer Error:', errorData);

    const message =
      typeof errorData.detail === 'string'
        ? errorData.detail
        : JSON.stringify(errorData.detail);

    throw new Error(message || 'Failed to submit answer');
  }

  return response.json();
}