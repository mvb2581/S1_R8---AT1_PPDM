import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getCharacters, searchCharacters } from '../services/narutoService';
import SearchBar from '../components/SearchBar';
import { colors } from '../styles/colors';

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 300;

export default function CharactersScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const debounceTimer = useRef(null);

  const loadPage = useCallback(async (pageNumber, mode) => {
    if (mode === 'initial') setInitialLoading(true);
    if (mode === 'more') setLoadingMore(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    try {
      const data = await getCharacters(pageNumber, PAGE_SIZE);
      const records = data.characters || [];
      setItems((prev) => (mode === 'more' ? [...prev, ...records] : records));
      setTotal(data.total || 0);
      setPage(pageNumber);
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  const runSearch = useCallback(async (searchTerm) => {
    setSearching(true);
    setError(null);
    try {
      const data = await searchCharacters(searchTerm);
      setSearchResults(data.characters || []);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, 'initial');
  }, [loadPage]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const term = query.trim();
    if (term.length === 0) {
      setSearchResults(null);
      setError(null);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      runSearch(term);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, runSearch]);

  const handleClear = () => {
    setQuery('');
    setSearchResults(null);
  };

  const handleRefresh = () => loadPage(1, 'refresh');

  // Disparado ao chegar no fim da lista: carrega a próxima página
  const handleEndReached = () => {
    if (initialLoading || loadingMore || refreshing || searchResults !== null) return;
    if (!total || items.length >= total) return;
    loadPage(page + 1, 'more');
  };

  const goToDetail = (character) => {
    navigation.navigate('CharacterDetail', {
      id: character.id,
      name: character.name,
    });
  };

  const searchingActive = searchResults !== null;
  const dataSource = searchingActive ? searchResults : items;
  const displayTotal = searchingActive ? searchResults.length : total;

  const renderCard = ({ item }) => {
    const image = item.images && item.images.length > 0 ? item.images[0] : null;
    const clan = item.personal && item.personal.clan ? item.personal.clan : item.clan || 'Clã desconhecido';
    const affiliation =
      item.personal && item.personal.affiliation && item.personal.affiliation.length
        ? item.personal.affiliation[0]
        : 'Afiliação desconhecida';

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => goToDetail(item)}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {clan}
              </Text>
            </View>
          </View>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {affiliation}
          </Text>
        </View>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchArea}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={handleClear}
          loading={searching}
          placeholder="Busque o personagem pelo nome..."
        />
      </View>

      {initialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Carregando personagens...</Text>
        </View>
      ) : error && dataSource.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => (searchingActive ? runSearch(query.trim()) : loadPage(1, 'initial'))}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={dataSource} // lista de personagens exibida
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached} // carrega mais ao chegar no fim
          onEndReachedThreshold={0.4} // aciona a 40% antes do fim
          refreshing={refreshing && !searchingActive}
          onRefresh={searchingActive ? undefined : handleRefresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <Text style={styles.header}>
              {searchingActive ? `${dataSource.length} resultado(s)` : `${displayTotal} personagens no universo`}
            </Text>
          }
          ListEmptyComponent={
            searchingActive && !searching ? (
              <View style={styles.centeredBox}>
                <Text style={styles.emptyTitle}>Nenhum personagem encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  Tente buscar por outro nome, como "Sasuke" ou "Hatake".
                </Text>
              </View>
            ) : (
              <View style={styles.centeredBox}>
                <Text style={styles.stateText}>Nenhum personagem encontrado.</Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centeredBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  cardBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '900',
    marginTop: -2,
  },
  footer: {
    paddingVertical: 20,
  },
});