# Parity Checklist (toward stable)

## Core Runtime
- [x] text/user/options/custom/update step progression
- [x] static + function trigger resolution
- [x] end payload baseline (`renderedSteps`, `steps`, `values`)
- [x] delay handling (`botDelay`, `userDelay`, `customDelay`)
- [x] waitAction custom behavior
- [x] replace custom behavior (latest-only render)
- [~] legacy edge-case replay fixtures (baseline set added; still expanding)

## UI/Behavior
- [x] user/bot bubble color and font props
- [x] avatar props baseline + hide user avatar
- [x] keyboard avoiding + `keyboardVerticalOffset`
- [x] auto-scroll to latest message
- [ ] pixel-level visual parity snapshots

## Inputs / Validation
- [x] user validators (block + string error output)
- [x] step inputAttributes forwarding
- [ ] richer validation callback parity across uncommon paths

## Packaging
- [x] default + named export compatibility
- [x] CI (test/typecheck/build)
- [x] beta release tag
- [ ] npm publish pipeline + release automation
