# Local Release Validation

Validated 2026-10-04T14:54:43.399Z on Abigail against the exact public payload.

Build: `0.4.1_Unassigned_pr-38_build-006_20261003T221730Z_gb3901d2b07bb_web`. Runtime source: `b3901d2b07bbc31380b1d1cb027b1aa3d087b6d1`.

- Unit tests: **43 passed; zero failed**.
- Browser suites: **3 passed**. All eight Learn steps and 24 Challenge orders, save/recovery/touch and finishing gestures passed. Recovery tests now await actual transition/save-warning states; finishing checks monotonic animation travel and completed plate positions instead of requiring a sample within the last five percent. Game bytes were unchanged.
- Public-path, identity, runtime-byte and exclusion checks passed. The local rollback snapshot loads.
- Workflow YAML is manual-only and main-only, with one standard Ubuntu publishing job and one-day artifact retention. No hosted build, browser test, package install or cache step.

[Machine-Readable Validation](LOCAL_VALIDATION.json) records hashes of retained local evidence. Raw screenshots, synthetic response downloads and local paths remain outside the public repository. Hosted CI was not run. Physical school-device/projector/screen-reader checks remain separate.
