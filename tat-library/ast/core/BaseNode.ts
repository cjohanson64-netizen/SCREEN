import type { SourceSpan } from "./SourceSpan.js";

export interface BaseNode {
  type: string;
  span?: SourceSpan;
}
