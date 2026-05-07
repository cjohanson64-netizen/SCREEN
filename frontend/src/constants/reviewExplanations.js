export const REVIEW_EXPLANATIONS = {
  long_file:
    "This file is large enough that it may be harder to scan, review, and safely modify.",
  token_heavy:
    "This file contains a lot of code tokens, which can make it harder to understand at a glance.",
  function_heavy:
    "This file defines many functions, which may indicate too many responsibilities in one place.",

  hook_heavy:
    "This file defines several useX functions, which may mean custom hooks should be grouped into a dedicated hook module or folder.",
  component_heavy:
    "This file defines several PascalCase functions, which may mean child components should be split into clearer component files.",
  getter_heavy:
    "This file has many getX functions, suggesting a selector or data-access responsibility may be dominating the file.",
  setter_heavy:
    "This file has many setX functions, suggesting mutation behavior may be concentrated in one place.",
  predicate_heavy:
    "This file has many hasX/isX/canX/shouldX functions, suggesting rule or predicate logic may deserve its own module.",
  analyzer_heavy:
    "This file has many analyzeX/detectX functions, suggesting analysis rules may deserve a dedicated analyzer module.",
  handler_heavy:
    "This file has many handleX/toggleX functions, suggesting UI event behavior may be crowding the file.",
  builder_heavy:
    "This file has many buildX/createX/makeX functions, suggesting object construction or assembly logic may deserve a focused builder module.",
  transformer_heavy:
    "This file has many parseX/formatX/normalizeX/transformX functions, suggesting transformation logic may deserve a focused utility module.",
  io_heavy:
    "This file has many fetchX/loadX/saveX/sendX functions, suggesting data access or side-effect behavior may deserve a service layer.",
  orchestrator_heavy:
    "This file has many runX/executeX/applyX functions, suggesting orchestration logic may need a clearer pipeline entry point.",

  constant_heavy:
    "This file defines many constants, which may mean configuration, flags, or rules are concentrated in one place.",
  boolean_constant_heavy:
    "This file has many boolean-shaped constants such as isX, hasX, canX, and shouldX, suggesting dense rule or condition state.",
  threshold_constant_heavy:
    "This file has several threshold or configuration constants such as MAX, MIN, DEFAULT, LIMIT, or THRESHOLD values.",
  flag_constant_heavy:
    "This file has several flag-shaped constants, suggesting local UI or state decisions may be scattered across the file.",
  decision_rule_constant_heavy:
    "This file has several decision-rule constants, suggesting policy, permission, or rule logic may deserve clearer grouping.",
  predicate_constant_heavy:
    "This file has several predicate-style constants, suggesting boolean checks may be better expressed as named predicate helpers.",
  capability_constant_heavy:
    "This file has several canX/allowsX constants, suggesting permission or capability logic may be concentrated here.",
  requirement_rule_constant_heavy:
    "This file has several needsX/requiresX constants, suggesting requirement rules may deserve a focused rules module.",
  feature_flag_constant_heavy:
    "This file has several enableX/disableX constants, suggesting feature flag behavior may deserve clearer grouping.",
  visibility_flag_heavy:
    "This file has several showX/hideX/visibleX constants, suggesting UI visibility rules may be scattered.",
  state_flag_heavy:
    "This file has several selectedX/openX/loadingX/errorX style constants, suggesting UI state flags may deserve grouping.",
  validation_flag_heavy:
    "This file has several validX/invalidX constants, suggesting validation state may deserve clearer rule helpers.",

  block_heavy:
    "This file has many structural blocks, which can make the file harder to scan and reason about.",
  deeply_nested:
    "This file has deeply nested logic, which makes local reasoning harder.",
  long_lines:
    "This file has several long lines, which can hide dense expressions or overloaded responsibilities.",
  repetition_high:
    "This file contains repeated or similarly shaped code that may be worth extracting.",
  complexity_high:
    "This file has a high overall complexity score based on branching, loops, boolean logic, and error-handling paths.",
  decision_heavy:
    "This file has many decision points such as if, else, switch, case, or match logic.",
  loop_heavy:
    "This file uses many loops or collection transforms, which can make execution flow harder to follow.",
  boolean_heavy:
    "This file uses many boolean operators, which may hide complex conditions inside single expressions.",
  error_handling_heavy:
    "This file has many try/catch or exception paths, which can make failure behavior harder to reason about.",

  risky_to_extend:
    "This file has enough structural pressure that it should be refactored before adding more features.",
    render_data_projection:
    "This file projects several values into render-ready constants. This can improve readability, but too much projection may suggest a view-model helper or selector would help.",
  entity_alias_heavy:
    "This file creates several local aliases for domain objects or nested properties.",
  collection_alias_heavy:
    "This file creates several local aliases for arrays or collection-like values.",
  derived_value_heavy:
    "This file derives several values before rendering or execution, which may indicate local view-model construction.",
  boolean_expression_constant_heavy:
    "This file stores several boolean expressions in constants, suggesting condition or rule logic is being named locally.",
  action_guard_heavy:
    "This file has several constants that appear to control whether actions are enabled, disabled, or allowed.",
  function_expression_constant_heavy:
    "This file declares several functions through const-style assignments. These are function-shaped values and should be reviewed with the function profile.",
  view_model_pressure:
    "This file appears to be building a view model inline from aliases, derived values, and action guards.",
    import_heavy:
    "This file has many imports. That is not automatically bad, but it may indicate dependency or orchestration pressure.",
  external_import_heavy:
    "This file imports several external packages, suggesting integration or dependency pressure.",
  local_import_heavy:
    "This file imports many local project modules, which can increase coupling and refactor risk.",
  deep_relative_import_heavy:
    "This file uses deep relative imports, which may suggest it reaches across project boundaries.",
  wide_named_import_heavy:
    "This file has wide named imports, which can hide a large dependency surface behind a single import path.",
  import_responsibility_spread:
    "This file imports from several responsibility zones, which may indicate boundary or orchestration pressure.",
  ui_imports_data_access:
    "This UI-shaped file imports data-access code, which may mix rendering and data responsibilities.",
  ui_imports_domain_logic:
    "This UI-shaped file imports domain or rule logic. This can be healthy, but too much may put policy decisions in rendering code.",
  production_imports_test_support:
    "This production file imports test support code such as fixtures, mocks, or stubs.",

  export_heavy:
    "This file exports many symbols, giving it a larger public API surface.",
  named_export_heavy:
    "This file has many named exports, which can make the public surface harder to reason about.",
  default_export_present:
    "This file has a default export.",
  reexport_heavy:
    "This file has many re-exports, suggesting it may be a public API gateway or barrel module.",
  star_reexport_present:
    "This file uses a star re-export, which can expose a broad public surface.",
  barrel_file:
    "This file appears to be a barrel or public API gateway.",
  public_api_pressure:
    "This file exposes a large public surface, which can increase refactor risk if many files depend on it.",
  export_responsibility_spread:
    "This file exports several different responsibility types.",
  mixed_export_roles:
    "This file exposes mixed export roles, suggesting a broad or grab-bag public surface.",
  utility_grab_bag:
    "This file appears to expose a grab bag of utility exports.",
  type_export_heavy:
    "This file exports many types or contracts, which may be healthy for type modules but still creates a public API surface.",
};