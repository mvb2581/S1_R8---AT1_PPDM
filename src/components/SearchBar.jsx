import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CloseIcon, SearchIcon } from './Icons';
import { colors } from '../styles/colors';

export default function SearchBar({ value, onChangeText, onClear, loading = false, placeholder = 'Buscar personagem...' }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <SearchIcon size={18} color={colors.primaryDark} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.actionBox} />
      ) : value.length > 0 ? (
        <Pressable
          style={({ pressed }) => [styles.actionBox, styles.clearButton, pressed && styles.pressed]}
          onPress={onClear}
          hitSlop={8}
        >
          <CloseIcon size={11} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 15,
    color: colors.text,
  },
  actionBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.7,
  },
});