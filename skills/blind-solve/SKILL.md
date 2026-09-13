---
name: "blind-solve"
description: "Create a blind, independent implementation of a learner's completed exercise in an isolated Git worktree, then compare both solutions for learning. Use only when the learner explicitly asks for a blind independent solution to compare against, rather than an upfront code review."
---

# Independent reimplementation for learning

Create an independent implementation that lets the learner study design
choices, not merely whether their code passes. It is an alternative for
comparison, not an authoritative answer.

## Blind boundary

Obtain the exercise requirements, intended paths, constraints, and intended
starter commit from the learner or from authoritative exercise instructions
they explicitly identify. Default to the chapter files in `docs/` matching the
exercise number. On the first exercise taken from a chapter, read that chapter
in full — its theory as well as the exercise section — including every image
either references; the images are part of the specification, not decoration.
For a later exercise from a chapter already in context, read only what is new:
that exercise's own section and any images it references. Use these as the
specification.

If the learner's solution has already been exposed in the active context,
do not claim the implementation is blind. Ask the learner to start a fresh
task without providing the solution.

Before the independent implementation is frozen, do not inspect anything
that reveals the learner's solution: no main-worktree status or diff,
changed files, patches, stashes, or pasted code. In the main worktree, inspect
only what is needed to identify the repository and baseline commit.

Tracked starter files and tests at the confirmed baseline are allowed, as are
the exercise instructions wherever they live — including untracked or ignored
documentation in the main worktree, which carries no solution. Do not infer
requirements from changed file names or the learner's implementation; ask when
material scope is unclear.

## Isolation

Leave the learner's main worktree untouched: do not stash, reset, modify it,
or switch its branch.

Create a unique branch and linked worktree at that exact commit, using an
OS-appropriate temporary directory outside the repository. Verify that the
branch name and path are not already in use. Confirm that the baseline
represents the intended starter state.

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
Do not assume the independent implementation is superior; where the learner's
choice is better, say so plainly. Report weaknesses in either solution.

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
- where the learner's solution is better than the independent one, and why;
- one focused follow-up exercise.

## Cleanup

Keep the worktree and branch until comparison is complete. Remove them only
on explicit request and only after the learner has preserved or chosen to
discard the independent changes.

Verify the exact worktree path before using `git worktree remove`. Never delete
its directory directly; `--force` is acceptable once the learner has chosen to
discard the independent changes, since build artefacts always leave the
worktree dirty. Delete the temporary branch only after the worktree has been
removed and with the learner's approval.

## Checklist

Before reporting, confirm each of these happened:

- [ ] specification obtained, including every image it references
- [ ] blindness declared honestly — if the context was already contaminated,
      said so
- [ ] baseline derived, and starter state verified inside the worktree
- [ ] branch and path confirmed unused; main worktree never inspected or
      modified
- [ ] assumptions and a short plan stated before implementing
- [ ] nothing copied from the learner's files; no secrets, servers, or
      external writes
- [ ] implementation validated (lint/build/tests as available); nothing
      committed
- [ ] changed paths and validation results recorded, then frozen — and not
      revised after
- [ ] learner's solution inspected only after the freeze; comparison targeted,
      not a repo-wide diff
- [ ] each difference classified; correctness fixes separated from style
      preferences
- [ ] closing summary covers all four: what went well, 1–3 improvements, where
      the learner's solution is better, one follow-up exercise
- [ ] worktree and branch retained unless removal was explicitly requested
