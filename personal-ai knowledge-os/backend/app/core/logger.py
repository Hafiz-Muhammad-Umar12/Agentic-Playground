import logging
import sys

# Configure standard logging for the application
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("knowledge_os")

def get_logger(name: str):
    return logging.getLogger(f"knowledge_os.{name}")
