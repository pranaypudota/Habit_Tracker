import logging
import sys
from loguru import logger

# ─── Loguru Config ────────────────────────────────────────────────────────────

class InterceptHandler(logging.Handler):
    """
    Default handler from Python logging to Loguru.
    Ensures uvicorn and library logs look consistent.
    """
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_app_logging():
    """Configures the entire app to use Loguru for structured, colored output."""
    
    # 1. Clear default handlers and SILENCE access logs
    # We want to use our OWN middleware for request logging to keep it to one line.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").handlers = []
    logging.getLogger("fastapi").handlers = []

    # 2. Wire them to Loguru's InterceptHandler
    intercept_handler = InterceptHandler()
    for name in ["uvicorn", "uvicorn.error", "fastapi"]:
        _log = logging.getLogger(name)
        _log.handlers = [intercept_handler]
        _log.propagate = False

    # 3. Finalize Loguru's stdout format
    logger.remove()
    logger.add(
        sys.stdout,
        enqueue=True,
        backtrace=True,
        level="INFO",
        colorize=True, # Ensure colors are forced or auto-detected
        format=(
            "<green>{time:HH:mm:ss}</green> | "
            "<level>{level: <5}</level> | "
            "{message}" # Message already contains tags
        ),
    )
    
    return logger
