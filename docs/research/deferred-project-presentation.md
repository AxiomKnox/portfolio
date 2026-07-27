# Canceled — project-level presentation state

**Status:** Canceled (2026-07-26)  
**Linear:** [PROG-85](https://linear.app/general-stuff/issue/PROG-85/project-presentation-flags-published-or-learning-or-hidden) (Canceled)  
**Document:** [CANCELED — project-level presentation state](https://linear.app/general-stuff/document/canceled-project-level-presentation-state-8adaf9c5c74a)

## Decision

Owner: we will not need project-level `presentation?: published | learning | hidden` flags.

**Reason:** Visibility stays with the content fetch/repo list. An in-catalog presentation enum is unnecessary schema/UI surface.

Do **not** implement this field.

## Historical note (superseded)

Previously deferred outside PROG-58 as an optional Project field for in-catalog presentation states (`published` / `learning` / `hidden`). Kept here only so agents do not revive it from older briefs.
