import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';

type BubbleProps = {
  text: string;
  isUser?: boolean;
  botBubbleColor?: string;
  userBubbleColor?: string;
  botFontColor?: string;
  userFontColor?: string;
  style?: object;
  avatarUri?: string;
  hideAvatar?: boolean;
  avatarStyle?: object;
  avatarWrapperStyle?: object;
};

export function Bubble({
  text,
  isUser,
  botBubbleColor = '#6E48AA',
  userBubbleColor = '#fff',
  botFontColor = '#fff',
  userFontColor = '#4a4a4a',
  style,
  avatarUri,
  hideAvatar,
  avatarStyle,
  avatarWrapperStyle,
}: BubbleProps) {
  const bubbleStyle = {
    backgroundColor: isUser ? userBubbleColor : botBubbleColor,
  };

  return (
    <View style={[styles.wrapper, isUser ? styles.right : styles.left]}>
      <View style={[styles.row, isUser ? styles.rowReverse : null]}>
        {!hideAvatar ? <Avatar uri={avatarUri} style={avatarStyle} wrapperStyle={avatarWrapperStyle} /> : null}
        <View style={[styles.bubble, bubbleStyle, style]}>
          <Text style={{ color: isUser ? userFontColor : botFontColor }}>{text}</Text>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
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
