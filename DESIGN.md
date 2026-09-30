# ComplyOS interface system

ComplyOS uses an Operate-mode application shell optimized for repeated compliance work. The incumbent visual system is authoritative: a neutral light ground, restrained blue primary color, compact sans-serif typography, thin borders, clear section rhythm, and Lucide line icons.

## Layout and hierarchy

- Desktop uses a persistent 16rem sidebar and sticky topbar. Mobile uses a static topbar plus an explicit menu control so page content is never covered while scrolling or focusing fields.
- Content uses a maximum-width work area. Identity and status precede actions; related fields group tightly while workflow stages receive generous vertical separation.
- Avoid nested card scaffolding. Use borders and spacing to express sequence: record identity → ownership → mapping → review.

## Controls and states

- Every input has a persistent visible label and programmatic association. Placeholders are hints only.
- Buttons name the action and expose pending, success, failure, and disabled prerequisite states.
- Errors state both the problem and recovery. Concurrency errors offer an explicit reload control.
- Empty, loading, and error states remain visible at list, detail, edition, requirement, mapping, and migration boundaries.

## Domain-specific patterns

- Framework choices always display framework, edition, lifecycle state, and requirement identity in that order.
- Migration requires discoverable program/source/target selectors, a source-to-target preview, an explicit confirmation, and completion feedback.
- Mapping review keeps edition-qualified requirement identity, rationale, provenance source, coverage, and approval state visible together.
- Destructive or irreversible lifecycle actions are visually secondary until their prerequisites are satisfied.
