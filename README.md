# @tannus/react-native-chatbot-next

Modern TypeScript rewrite of `react-native-chatbot` with compatibility-first API.

## Status

Initial implementation started:
- Typed step schema
- Trigger engine
- Core `ChatBot` component
- User input + options flow
- Legacy-style customization props (baseline)

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

1. Delay behavior parity (`botDelay`, `userDelay`, `customDelay`)
2. Full custom step contract (`triggerNextStep`, `waitAction`, `replace`, `asMessage`)
3. Avatar parity + hide user avatar
4. End payload parity tests
5. Snapshot parity against original default styles
