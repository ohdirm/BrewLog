import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { palette, radii, spacing, layout, strokes } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  trailingIcon?: React.ReactNode;
  onTrailingIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  trailingIcon,
  onTrailingIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { palette: themePalette } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="subheadlineMedium" color="primary" style={styles.label}>
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: themePalette.surface,
            borderColor: themePalette.borderStrong,
          },
          isFocused && { borderColor: themePalette.accent, borderWidth: 1.5 },
          Boolean(error) && { borderColor: themePalette.statusDanger },
        ]}
      >
        <TextInput
          placeholderTextColor={themePalette.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: themePalette.textPrimary }, style]}
          {...rest}
        />

        {trailingIcon && (
          <TouchableOpacity
            onPress={onTrailingIconPress}
            activeOpacity={0.7}
            disabled={!onTrailingIconPress}
            style={styles.trailingIconContainer}
          >
            {trailingIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Typography variant="caption" color="danger" style={styles.feedback}>
          {error}
        </Typography>
      ) : helper ? (
        <Typography variant="caption" color="secondary" style={styles.feedback}>
          {helper}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: strokes.hairline,
    borderColor: palette.borderStrong,
    minHeight: layout.inputHeight,
    paddingHorizontal: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: palette.accent,
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: palette.statusDanger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  trailingIconContainer: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: {
    marginTop: spacing.xs,
  },
});

