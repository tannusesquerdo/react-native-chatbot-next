import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type AvatarProps = {
  uri?: string;
  style?: object;
  wrapperStyle?: object;
};

export function Avatar({ uri, style, wrapperStyle }: AvatarProps) {
  if (!uri) return null;

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <Image source={{ uri }} style={[styles.avatar, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
