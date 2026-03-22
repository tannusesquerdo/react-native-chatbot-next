import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Avatar } from './Avatar';

type TypingBubbleProps = {
  botBubbleColor?: string;
  avatarUri?: string;
  avatarStyle?: object;
  avatarWrapperStyle?: object;
};

function Dot({ delay = 0 }: { delay?: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

export function TypingBubble({ botBubbleColor = '#6E48AA', avatarUri, avatarStyle, avatarWrapperStyle }: TypingBubbleProps) {
  return (
    <View style={[styles.wrapper, styles.left]}>
      <View style={styles.row}>
        <Avatar uri={avatarUri} style={avatarStyle} wrapperStyle={avatarWrapperStyle} />
        <View style={[styles.bubble, { backgroundColor: botBubbleColor }]}>
          <Dot delay={0} />
          <Dot delay={120} />
          <Dot delay={240} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    width: '100%',
    paddingHorizontal: 10,
  },
  left: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
});
