export const REVIEW_EXPLANATIONS = {
  long_file:
    "This file is large enough that it may be harder to scan, review, and safely modify.",
  high_token_count:
    "This file contains a lot of code tokens, which can make it harder to understand at a glance.",
  many_functions:
    "This file defines many functions, which may indicate too many responsibilities in one place.",
  deep_nesting:
    "This file has deeply nested logic, which makes local reasoning harder.",
  repeated_patterns:
    "This file contains repeated or similarly shaped code that may be worth extracting.",
  high_complexity:
    "This file has a high overall complexity score based on branching, loops, boolean logic, and error-handling paths.",
  needs_refactor:
    "This file has enough structural pressure that it should be refactored before adding more features.",
  many_decisions:
    "This file has many decision points such as if, else, switch, case, or match logic.",
  loop_heavy:
    "This file uses many loops or collection transforms, which can make execution flow harder to follow.",
  boolean_dense:
    "This file uses many boolean operators, which may hide complex conditions inside single expressions.",
  error_handling_heavy:
    "This file has many try/catch or exception paths, which can make failure behavior harder to reason about.",
};