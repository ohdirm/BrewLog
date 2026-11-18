import React from 'react';
import { Text, TextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { typography, palette } from '../../theme/tokens';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'callout'
  | 'calloutMedium'
  | 'subheadline'
  | 'subheadlineMedium'
  | 'caption'
  | 'overline';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'danger'
  | 'warning';

interface Props extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  tabular?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const colorMap: Record<TypographyColor, string> = {
  primary: palette.textPrimary,
  secondary: palette.textSecondary,
  tertiary: palette.textTertiary,
  inverse: palette.textInverse,
  accent: palette.accent,
  success: palette.statusSuccess,
  danger: palette.statusDanger,
  warning: palette.statusWarning,
};

export const Typography: React.FC<Props> = ({
  variant = 'body',
  color = 'primary',
  tabular = false,
  align,
  style,
  children,
  ...rest
}) => {
  const baseStyle = typography[variant];
  const textColor = colorMap[color];

  return (
    <Text
      style={[
        baseStyle,
        { color: textColor },
        tabular && typography.tabular,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
