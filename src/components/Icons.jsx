import { StyleSheet, View } from 'react-native';

import { colors } from '../styles/colors';

export function SearchIcon({ size = 18, color = colors.textMuted }) {
  return (
    <View style={[styles.searchIcon, { width: size, height: size }]}>
      <View
        style={[
          styles.searchIconCircle,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.searchIconHandle,
          {
            width: size * 0.52,
            height: size * 0.16,
            borderColor: color,
            borderRadius: size,
          },
        ]}
      />
    </View>
  );
}

export function CloseIcon({ size = 14, color = colors.textMuted }) {
  const bar = { width: size, height: Math.max(2, size * 0.18) };
  return (
    <View style={[styles.closeIcon, { width: size * 0.72, height: size * 0.72 }]}>
      <View style={[styles.closeBar, bar, styles.closeBarA, { backgroundColor: color }]} />
      <View style={[styles.closeBar, bar, styles.closeBarB, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    position: 'relative',
  },
  searchIconCircle: {
    borderRadius: 999,
    borderWidth: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchIconHandle: {
    backgroundColor: 'transparent',
    position: 'absolute',
    borderTopWidth: 2,
    transform: [{ rotate: '45deg' }],
    right: 0,
    bottom: 0,
  },
  closeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBar: {
    position: 'absolute',
    borderRadius: 999,
  },
  closeBarA: {
    transform: [{ rotate: '45deg' }],
  },
  closeBarB: {
    transform: [{ rotate: '-45deg' }],
  },
});