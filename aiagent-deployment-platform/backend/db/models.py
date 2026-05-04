from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, JSON
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
import enum


class Base(DeclarativeBase):
    pass


class AgentStatus(str, enum.Enum):
    building = "building"
    running  = "running"
    idle     = "idle"
    error    = "error"
    stopped  = "stopped"


class AgentFramework(str, enum.Enum):
    langgraph = "LangGraph"
    crewai    = "CrewAI"
    custom    = "Custom"


class Agent(Base):
    __tablename__ = "agents"

    id           = Column(String(50), primary_key=True)          # e.g. agt_8f2a
    name         = Column(String(255), nullable=False)
    framework    = Column(Enum(AgentFramework), nullable=False)
    model        = Column(String(100), default="gpt-4o")
    container_id = Column(String(255), nullable=True)
    image_tag    = Column(String(255), nullable=True)
    status       = Column(Enum(AgentStatus), default=AgentStatus.building)
    endpoint     = Column(String(255), nullable=True)
    config       = Column(JSON, default={})
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    agent_id   = Column(String(50), nullable=False, index=True)
    level      = Column(String(20), default="INFO")   # INFO | WARN | ERROR | OK
    message    = Column(Text, nullable=False)
    meta       = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id          = Column(String(50), primary_key=True)
    agent_id    = Column(String(50), nullable=False, index=True)
    input_text  = Column(Text, nullable=False)
    output_text = Column(Text, nullable=True)
    status      = Column(String(20), default="queued")   # queued | running | done | error
    tool_calls  = Column(Integer, default=0)
    latency_ms  = Column(Integer, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)