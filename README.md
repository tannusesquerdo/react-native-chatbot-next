# @tannus/react-native-chatbot-next

Modern TypeScript rewrite of `react-native-chatbot` with compatibility-first API.

## Status

Initial implementation in progress:
- Typed step schema
- Trigger engine + delay resolver
- Core `ChatBot` component
- User input + options flow
- Avatar support + hide user avatar
- Custom step injection (`triggerNextStep`, `step`, `steps`, `previousStep`)
- Legacy-style customization props (baseline)
- Keyboard avoidance support (`keyboardVerticalOffset`) + custom step styling (`customStyle`)
- Unit tests (trigger + delay + runtime + waitAction semantics)

## Install

```bash
npm i @tannus/react-native-chatbot-next
```

## Usage

```tsx
import React from 'react';
import { ChatBot, type Step } from '@tannus/react-native-chatbot-next';

const steps: Step[] = [
  { id: '0', message: 'Welcome to react chatbot!', trigger: '1' },
  { id: '1', user: true, trigger: '2' },
  { id: '2', message: ({ previousValue }) => `You said: ${String(previousValue ?? '')}`, end: true },
];

export function App() {
  return <ChatBot steps={steps} />;
}
```

## Next milestones

1. Full component-level render tests (React Native Testing Library)
2. Tighten custom-step `replace` parity for nested/branch flows
3. Snapshot parity against original default styles
4. Publish `0.1.x` beta and validate against real legacy examples

## Docs

- [MIGRATION.md](./MIGRATION.md)
- [CHANGELOG.md](./CHANGELOG.md)
