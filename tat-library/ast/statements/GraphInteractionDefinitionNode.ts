import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { GraphRefNode } from "../graph/GraphRefNode.js";
import type { GraphBridgeNode } from "../graph/GraphBridgeNode.js";
import type { QueryExprNode } from "../query/QueryExprNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";
import type { EffectBlockNode } from "../effect/EffectBlockNode.js";

export interface GraphInteractionDefinitionNode extends BaseNode {
  type: "GraphInteractionDefinition";

  /**
   * Optional relationship name for future debugging/import/export use.
   */
  name: IdentifierNode | null;

  /**
   * Source graph in the relationship.
   *
   * Example:
   *   @graph(battleGraph)
   */
  source: GraphRefNode;

  /**
   * Explicit or implicit bridge between the source and target graph.
   *
   * Explicit:
   *   : @ctx(hero) ::
   *
   * Implicit:
   *   :::
   */
  bridge: GraphBridgeNode;

  /**
   * Target graph in the relationship.
   *
   * Example:
   *   @graph(characterGraph)
   */
  target: GraphRefNode;

  /**
   * Domain-specific hook node used after the ctx bridge check.
   *
   * Example:
   *   through: battleParticipant
   */
  through: IdentifierNode;

  /**
   * Optional relationship condition.
   */
  when?: QueryExprNode | BooleanExprNode;

  /**
   * Optional effect to apply after ctx gate, hook gate, and condition pass.
   */
  effect?: EffectBlockNode;
}