import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BubbleProps = {
  text: string;
  isUser?: boolean;
  botBubbleColor?: string;
  userBubbleColor?: string;
  botFontColor?: string;
  userFontColor?: string;
  style?: object;
};

export function Bubble({
  text,
  isUser,
  botBubbleColor = '#6E48AA',
  userBubbleColor = '#fff',
  botFontColor = '#fff',
  userFontColor = '#4a4a4a',
  style,
}: BubbleProps) {
  const bubbleStyle = {
    backgroundColor: isUser ? userBubbleColor : botBubbleColor,
  };

  return (
    <View style={[styles.wrapper, isUser ? styles.right : styles.left]}>
      <View style={[styles.bubble, bubbleStyle, style]}>
        <Text style={{ color: isUser ? userFontColor : botFontColor }}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    width: '100%',
    paddingHorizontal: 10,
  },
  left: {
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
