import { startInterview, submitAnswer } from './api';
import { useInterviewStore } from '../store/interviewStore';

export const useInterviewFlow = () => {
  const store = useInterviewStore();

  const initiateInterview = async (topic: string) => {
    const state = useInterviewStore.getState();
    
    // 🔥 Prevent multiple initiations
    if (state.isInitializing || state.sessionId) return;

    try {
      store.setInitializing(true);
      store.setLoading(true);
      store.setTopic(topic);

      const data = await startInterview(topic);

      const firstQuestion = data.questions[0]?.question || "Welcome! Let's start the interview.";
      
      store.setSessionId(data.session_id);
      store.setCurrentQuestion(firstQuestion);

      store.addMessage({
        role: 'ai',
        content: firstQuestion,
      });

    } catch (error) {
      console.error('Error starting interview:', error);
      store.addMessage({
        role: 'ai',
        content: 'Sorry, I encountered an error starting the interview. Please try again.',
      });
    } finally {
      store.setLoading(false);
      store.setInitializing(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    const state = useInterviewStore.getState();
    const cleanAnswer = answer.trim();

    if (!cleanAnswer || state.isLoading || !state.sessionId) return;

    if (!state.currentQuestion || !state.topic) {
      console.error("Missing question or topic", {
        currentQuestion: state.currentQuestion,
        topic: state.topic,
      });
      return;
    }

    try {
      store.setLoading(true);

      // 1. Add user message immediately
      store.addMessage({ role: 'user', content: cleanAnswer });

      // 2. Submit to API
      const data = await submitAnswer(
        state.sessionId,
        state.currentQuestion,
        cleanAnswer,
        state.topic
      );

      // 3. Handle termination
      if (data.next_action === 'end') {
        // If there's a final message/question from the AI, show it before ending
        if (data.next_question) {
          store.addMessage({
            role: 'ai',
            content: data.next_question,
          });
        }
        
        setTimeout(() => {
          store.setEnded(true);
          store.setScoreData(data.evaluation);
        }, 1500); // Small delay so user can read the final AI message
        return;
      }

      // 4. Handle next question
      if (data.next_question) {
        store.setCurrentQuestion(data.next_question);
        store.addMessage({
          role: 'ai',
          content: data.next_question,
        });
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      store.addMessage({
        role: 'ai',
        content: 'Sorry, I had trouble processing your answer. Can you please try again?',
      });
    } finally {
      store.setLoading(false);
    }
  };

  return {
    initiateInterview,
    handleAnswerSubmit,
  };
};
