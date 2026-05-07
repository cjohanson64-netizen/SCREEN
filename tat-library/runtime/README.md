# TAT Runtime Layout

The runtime is organized around semantic responsibility instead of one flat folder.

- `engine/` runs whole programs, modules, and action registration.
- `execute/` is the directive-facing execution layer.
- `graph/` owns graph structures, graph control, and graph-to-graph interaction mechanics.
- `query/` owns query, match, path, where, why/how support machinery.
- `projection/` owns projection machinery.
- `bind/` owns binding evaluation helpers.
- `validation/` owns runtime validation.
- `debug/` owns developer-facing inspection helpers.
- root `*.ts` files are compatibility shims that re-export the new homes.
