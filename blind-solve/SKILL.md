---
name: "blind-solve"
description: "Create a blind, independent implementation of a learner's completed exercise in an isolated Git worktree, then compare both solutions for learning. Use only when the learner explicitly requests independent reimplementation rather than an upfront code review."
---

# Independent reimplementation for learning

Create an independent implementation that lets the learner study design
choices, not merely whether their code passes. It is an alternative for
comparison, not an authoritative answer.

## Blind boundary

Obtain the exercise requirements, intended paths, constraints, and intended
starter commit from the learner or from authoritative exercise instructions
they explicitly identify. Default to the chapter files in `docs/` matching the
exercise number. Images referenced by those files are part of the
specification: Read the ones in the sections covering the exercise. Use these
as the specification.

If the learner's solution has already been exposed in the active context,
do not claim the implementation is blind. Ask the learner to start a fresh
task without providing the solution.

Before the independent implementation is frozen, do not inspect anything
that reveals the learner's solution: no main-worktree status or diff,
changed files, patches, stashes, or pasted code. In the main worktree, inspect
only what is needed to identify the repository and baseline commit.

Tracked starter files, tests, and public exercise instructions at the
confirmed baseline are allowed. Do not infer requirements from changed file
names or the learner's implementation; ask when material scope is unclear.

## Isolation

Leave the learner's main worktree untouched: do not stash, reset, modify it,
or switch its branch.

Confirm that the baseline represents the intended starter state. Create a
unique branch and linked worktree at that exact commit, using an
OS-appropriate temporary directory outside the repository. Verify that the
branch name and path are not already in use.

```bash
git worktree add -b ai/independent-<unique-name> <temporary-path> <baseline-ref>
```

Work only in the linked worktree until comparison. Recreate anything required
from the specification, never by copying the learner's files. Do not copy
secrets or `.env` files.

## Independent implementation

Act as an experienced engineer creating a teaching alternative, not merely
an implementation that passes the current tests.

- Follow the starter repository's relevant architecture, conventions, and
  public APIs unless they conflict with the specification.
- Satisfy the specification, including boundary and failure cases implied by it.
- Prefer the simplest clear solution; avoid speculative abstractions,
  unnecessary dependencies, and unrelated refactors.
- Run relevant tests, lint, type checks, or builds when available.
- Add focused tests only when supported by the specification and useful in
  the repository's existing test setup.

State material assumptions and a short plan, then implement and validate.
If relevant validation fails, diagnose and fix it within scope. If completion
is blocked, report the blocker rather than using the main worktree as a
fallback or presenting an incomplete solution as finished.

Avoid servers, shared databases, and external writes unless authorized.

Before freezing, record the independent implementation's changed paths and
validation results. Declare it frozen, then do not revise its implementation
after seeing the learner's code. Do not commit unless asked.

## Comparison and teaching

Only after freezing may you inspect the learner's implementation. Compare
the intended paths, relevant tests, and relevant untracked files. Prefer a
targeted side-by-side comparison; do not paste a repository-wide diff.

Apply the same specification and quality criteria to both implementations.
Do not assume the independent implementation is superior. Report weaknesses
in either solution.

Classify each material difference as:

- a correctness or edge-case issue;
- a maintainability, clarity, safety, or performance trade-off;
- two valid designs suited to different constraints.

For each material recommendation, explain the concrete risk or limitation,
the governing principle and trade-off, when the other choice remains
reasonable, and—when useful—a small discriminating test or scenario.
Separate correctness fixes from optional refactors and style preferences.

End with:

- what the learner did well;
- the 1–3 highest-value improvements;
- any meaningful weakness in the independent implementation;
- one focused follow-up exercise.

## Cleanup

Keep the worktree and branch until comparison is complete. Remove them only
on explicit request and only after the learner has preserved or chosen to
discard the independent changes.

Verify the exact worktree path before using `git worktree remove`. Never
force-remove it or delete its directory directly. Delete the temporary branch
only after the worktree has been removed and with the learner's approval.
