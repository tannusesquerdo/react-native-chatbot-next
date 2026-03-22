import React from 'react';
import { View } from 'react-native';

type AnimatedMessageProps = {
  mode: 'none' | 'layout' | 'reanimated';
  children: React.ReactNode;
};

let ReanimatedView: any = null;
let enteringPreset: any = null;

try {
  // Optional dependency: only used when installed by host app.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require('react-native-reanimated');
  ReanimatedView = Reanimated?.default?.View ?? Reanimated?.View ?? null;
  enteringPreset = Reanimated?.FadeInDown?.duration?.(220) ?? Reanimated?.FadeInDown ?? null;
} catch {
  ReanimatedView = null;
  enteringPreset = null;
}

export function AnimatedMessage({ mode, children }: AnimatedMessageProps) {
  if (mode === 'none') return <View>{children}</View>;

  if (mode === 'reanimated' && ReanimatedView && enteringPreset) {
    return <ReanimatedView entering={enteringPreset}>{children}</ReanimatedView>;
  }

  return <View>{children}</View>;
}
