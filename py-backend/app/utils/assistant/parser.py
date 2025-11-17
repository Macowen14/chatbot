import re
from typing import Optional, Tuple

CODE_BLOCK_RE = re.compile(
    r'```(?P<language>\w+)?\n(?P<code>.*?)\n```', 
    re.DOTALL | re.MULTILINE
)

def parse_llm_response(text: str) -> Tuple[str, Optional[str]]:
    """
    Parses the LLM response to separate the main content and the code block.
    
    Returns: (main_content, code_block_content)
    """
    print(f"Parsing LLM response: {text}")
    match = CODE_BLOCK_RE.search(text)
    
    if match:
        # Extract language and code content
        language = match.group('language') or 'text'
        code_content = match.group('code').strip()

        # The full code block, including backticks and language, to be removed from content
        full_code_block = match.group(0)
        
        # Remove the code block from the main content
        main_content = text.replace(full_code_block, '').strip()

        # For saving to DB, we just save the code itself.
        print(f"Extracted code block: {code_content}")
        return main_content, code_content
    else:
        # No code block found
        print("No code block found in response")
        return text.strip(), None