# backend/analyzer/detect_blocks.py

import re
from typing import Any, Dict, List


def detect_blocks(code: str) -> Dict[str, Any]:
    blocks = []

    blocks.extend(detect_js_blocks(code))
    blocks.extend(detect_python_blocks(code))

    largest_block = max(blocks, key=lambda b: b["lineCount"], default=None)
    long_blocks = [b for b in blocks if b["lineCount"] >= 40]

    return {
        "blockCount": len(blocks),
        "largestBlock": largest_block,
        "longBlockCount": len(long_blocks),
        "longBlocks": long_blocks,
        "blocks": blocks,
    }


# -----------------------------
# JavaScript-ish block detection
# -----------------------------

def detect_js_blocks(code: str) -> List[Dict[str, Any]]:
    lines = code.split("\n")
    blocks = []
    stack = []

    for index, line in enumerate(lines):
        stripped = line.strip()

        if "{" in stripped:
            stack.append({
                "startLine": index + 1,
                "signature": stripped,
            })

        if "}" in stripped and stack:
            start = stack.pop()
            end_line = index + 1
            line_count = end_line - start["startLine"] + 1

            blocks.append({
                "type": "js_block",
                "signature": start["signature"],
                "startLine": start["startLine"],
                "endLine": end_line,
                "lineCount": line_count,
            })

    return blocks


# -----------------------------
# Python block detection
# -----------------------------

def detect_python_blocks(code: str) -> List[Dict[str, Any]]:
    lines = code.split("\n")
    blocks = []
    block_starts = []

    block_pattern = re.compile(
        r"^\s*(def|class|if|elif|else|for|while|try|except|finally|with)\b.*:\s*$"
    )

    for index, line in enumerate(lines):
        if block_pattern.match(line):
            indent = count_indent(line)

            while block_starts and indent <= block_starts[-1]["indent"]:
                block = block_starts.pop()
                end_line = index
                line_count = end_line - block["startLine"] + 1

                blocks.append({
                    "type": "python_block",
                    "signature": block["signature"],
                    "startLine": block["startLine"],
                    "endLine": end_line,
                    "lineCount": line_count,
                })

            block_starts.append({
                "startLine": index + 1,
                "indent": indent,
                "signature": line.strip(),
            })

    total_lines = len(lines)

    while block_starts:
        block = block_starts.pop()
        line_count = total_lines - block["startLine"] + 1

        blocks.append({
            "type": "python_block",
            "signature": block["signature"],
            "startLine": block["startLine"],
            "endLine": total_lines,
            "lineCount": line_count,
        })

    return blocks


def count_indent(line: str) -> int:
    return len(line) - len(line.lstrip(" "))