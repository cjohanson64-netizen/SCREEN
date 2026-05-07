# TAT Lexer Structure

The lexer is now organized as a small language graph:

- `core/` owns scanner mechanics and the public tokenizer implementation.
- `tokens/` owns the token surface of TAT.
- `tokens/directives/` groups `@...` keywords by directive family.
- `tokens/symbols/` groups punctuation by grammar role: open, close, separators, and operators.
- `chars/` owns character classification helpers.
- `readers/` owns token readers for strings, numbers, identifiers, keywords, regexes, and comments.
- `errors/` owns lexer-specific error types.

The public compatibility entrypoint remains:

```ts
import { tokenize, TokenizeError } from "./lexer/tokenize.js";
```

That file is now a shim over the explicit lexer structure.
