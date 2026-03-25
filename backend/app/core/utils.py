import uuid

def uuid4_str() -> str:
    """Generate a string representation of a random UUID (version 4)."""
    return str(uuid.uuid4())
