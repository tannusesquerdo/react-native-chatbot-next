import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type InputBarProps = {
  placeholder?: string;
  onSubmit: (value: string) => void;
  inputStyle?: object;
  submitButtonStyle?: object;
  submitButtonContent?: string | React.ReactElement;
  footerStyle?: object;
};

export function InputBar({
  placeholder = 'Type the message ...',
  onSubmit,
  inputStyle,
  submitButtonStyle,
  submitButtonContent = 'SEND',
  footerStyle,
}: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <View style={[styles.footer, footerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSend}
      />
      <Pressable style={[styles.button, submitButtonStyle]} onPress={handleSend}>
        {typeof submitButtonContent === 'string' ? <Text style={styles.buttonText}>{submitButtonContent}</Text> : submitButtonContent}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#6E48AA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
