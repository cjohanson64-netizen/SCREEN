import type { EffectGraftStateOpNode } from "./EffectGraftStateOpNode.js";
import type { EffectGraftMetaOpNode } from "./EffectGraftMetaOpNode.js";
import type { EffectPruneStateOpNode } from "./EffectPruneStateOpNode.js";
import type { EffectPruneMetaOpNode } from "./EffectPruneMetaOpNode.js";
import type { EffectDeriveStateOpNode } from "./EffectDeriveStateOpNode.js";
import type { EffectDeriveMetaOpNode } from "./EffectDeriveMetaOpNode.js";

export type EffectOpNode =
  | EffectGraftStateOpNode
  | EffectGraftMetaOpNode
  | EffectPruneStateOpNode
  | EffectPruneMetaOpNode
  | EffectDeriveStateOpNode
  | EffectDeriveMetaOpNode;
