# Changelog

## 0.1.0 (in progress)

### Added
- TypeScript-first package scaffold with ESM/CJS + d.ts output.
- Compatibility-first step model (`text`, `user`, `options`, `custom`, `update`).
- Core `ChatBot` runtime with trigger resolution and state progression.
- Delay configuration support (`botDelay`, `userDelay`, `customDelay`).
- Avatar support (`botAvatar`, `userAvatar`, hide user avatar mode).
- Custom-step injection contract (`triggerNextStep`, `step`, `steps`, `previousStep`).
- Runtime state helpers for map/update/end-payload creation.
- Auto-scroll to bottom on new messages.
- Test suite for trigger, delay, runtime state, and conversation simulation.

### Notes
- API parity is still in-progress; this release line is pre-stable.
