# Deployed verification — CR-DESIGN-SYSTEM-019

Nothing is deployed from this package; consumers pin the merged sha in their own changes.

**Real-browser proof: NOT done.** The plan (§4.6) asked for an Edge-driven check of the owner's repro. This session could not run one: the sibling DC tree has no `node_modules` (so no `playwright-core`), and the Edge install path is outside the directories this session may read. The new behaviour is the native `disabled` attribute, asserted in 14 DOM tests (happy-dom, user-event and raw click, plus a form submit). The greyed look is the existing `disabled:opacity-50 disabled:cursor-not-allowed` class that every `inflight`-only button already shows. The first real-browser sight of the change will be Manga Verde's purchase screen at its pin bump, and its change should include the 2.5 s repro.
