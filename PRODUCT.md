# ComplyOS product context

ComplyOS is an organization-scoped compliance operations application. Its core mechanism is a unified control library: one implementation can satisfy requirements from multiple, explicitly versioned frameworks without cloning evidence or operational work.

Primary users are compliance managers, control owners, reviewers, and organization administrators. They need auditable tenant isolation, explicit ownership, immutable published framework editions, optimistic concurrency, provenance-safe requirement imports, and review decisions that cannot be inferred from drafts.

Product rules:

- Global framework metadata is readable across organizations; organization custom frameworks and controls remain tenant-scoped.
- Published editions and their requirements are immutable. New work occurs in a draft edition.
- Requirement content is imported only with source, edition, retrieval date, declared count, and validation. Unavailable or licensed content is flagged, never invented.
- Assessments remain pinned to their original edition when a program migrates.
- Control review and mapping approval are explicit states. Draft or rejected mappings never count as approved coverage.
- Every sensitive mutation is permission-checked, audited where applicable, and protected from stale edits.
