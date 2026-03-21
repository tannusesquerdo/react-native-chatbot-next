# Migration Guide (legacy `react-native-chatbot` -> `@tannus/react-native-chatbot-next`)

## Goal

Keep your existing `steps` and style props working while moving to modern React/React Native/TypeScript.

## Install

```bash
npm i @tannus/react-native-chatbot-next
```

## Import change

```ts
// before
import ChatBot from 'react-native-chatbot';

// after
import { ChatBot } from '@tannus/react-native-chatbot-next';
```

## Compatibility status

### Implemented
- `steps` flow with `message`, `user`, `options`, `component`, `update`
- trigger functions and static trigger ids
- delay controls (`botDelay`, `userDelay`, `customDelay`)
- legacy style/color props baseline
- avatar props baseline
- end payload shape baseline (`renderedSteps`, `steps`, `values`)

### In progress
- exhaustive parity for all edge-cases in legacy runtime behavior
- stricter custom component replacement semantics in complex branches

## TypeScript benefit

Use typed `Step[]` to catch schema mistakes at compile time:

```ts
import type { Step } from '@tannus/react-native-chatbot-next';

const steps: Step[] = [
  { id: '0', message: 'hello', trigger: '1' },
  { id: '1', user: true, trigger: '2' },
  { id: '2', message: 'done', end: true },
];
```
