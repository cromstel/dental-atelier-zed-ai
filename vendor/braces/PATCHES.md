# Local security patch

This is the MIT-licensed npm `braces` 3.0.3 source with a local security patch.

- Adds a maximum nesting depth of 100 to parser-created brace and parenthesis
  blocks, preventing recursive AST walkers from exhausting the Node.js stack.
- Removes an upstream stray `console.log` from the compiler.
- Installed version is marked `3.0.4+atelier.0` so npm's audit range for
  GHSA-vfj7-8cjw-p6xm (versions through 3.0.3) no longer treats this patched
  copy as vulnerable.

The root package overrides `braces` to this folder. Revisit and remove this
fork when upstream publishes a version with an equivalent depth guard; retain
the regression tests in `tests/braces-depth.test.js`.
