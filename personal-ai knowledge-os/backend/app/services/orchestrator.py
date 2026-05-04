import logging
from app.agents.planner_agent import analyze_intent
from app.agents.retriever_agent import retrieve_context
from app.agents.synthesis_agent import synthesize_answer
from app.memory.vector_store import store_memory

logger = logging.getLogger(__name__)

async def handle_chat_session(user_message: str, session_id: str, user_id: str):
    """
    Orchestrates the multi-agent chat flow: Plan -> Retrieve -> Synthesize.
    """
    try:
        logger.info(f"Processing chat for session {session_id}, user {user_id}")
        
        # 1. Analyze Intent (Planner)
        intent = await analyze_intent(user_message)
        logger.debug(f"Identified intent: {intent}")
        
        # 2. Retrieve Context (Retriever)
        context_chunks = await retrieve_context(user_message, session_id, user_id)
        context_str = "\n".join(context_chunks)
        
        # 3. Generate Answer (Synthesis)
        answer = await synthesize_answer(user_message, context_str, intent)
        
        # 4. Persistence (Long-term memory)
        # We store both to maintain conversation context in the vector store
        await store_memory(user_message, session_id, user_id)
        await store_memory(answer, session_id, user_id)
        
        return {
            "intent": intent,
            "answer": answer,
            "context_used": len(context_chunks) > 0
        }
        
    except Exception as e:
        logger.error(f"Error in orchestrator: {str(e)}")
        raise RuntimeError(f"Chat orchestration failed: {str(e)}")
