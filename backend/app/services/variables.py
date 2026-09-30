import json
import re

VAR_PATTERN = re.compile(r"\{\{(\w+)\}\}")

def load_variables(environment) -> dict:
    """Parse an Environment row's JSON variables into a dict."""
    try:
        return json.loads(environment.variables or "{}")
    except json.JSONDecodeError:
        return {}


def substitute(text: str | None, variables: dict) -> str:
    """Replace {{var}} placeholders. Unknown vars are left as-is."""
    if not text:
        return ""
    return VAR_PATTERN.sub(
        lambda m: str(variables.get(m.group(1), m.group(0))), text
    )


def substitute_headers(headers: dict, variables: dict) -> dict:
    return {
        substitute(k, variables): substitute(v, variables)
        for k, v in headers.items()
    }
