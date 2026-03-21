import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OptionItem } from '../types/steps';

type OptionsProps = {
  options: OptionItem[];
  onSelect: (option: OptionItem) => void;
  optionStyle?: object;
  optionElementStyle?: object;
  optionFontColor?: string;
  optionBubbleColor?: string;
};

export function Options({ options, onSelect, optionStyle, optionElementStyle, optionFontColor = '#fff', optionBubbleColor = '#6E48AA' }: OptionsProps) {
  return (
    <View style={[styles.container, optionStyle]}>
      {options.map((option, idx) => (
        <Pressable
          key={`${String(option.value)}-${idx}`}
          onPress={() => onSelect(option)}
          style={[styles.option, { backgroundColor: optionBubbleColor }, optionElementStyle]}
        >
          <Text style={{ color: optionFontColor }}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginVertical: 4,
    gap: 8,
  },
  option: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
});
