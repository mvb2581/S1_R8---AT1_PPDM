import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getCharacterById } from '../services/narutoService';
import { colors } from '../styles/colors';

// Converte um objeto em texto, ex.: {a: 1} => "a: 1 • b: 2"
function entriesLabel(obj) {
  if (!obj) return null;
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('  •  ');
}

// Transforma qualquer valor em texto de exibição (lista, objeto ou texto)
function valuesLabel(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  if (typeof value === 'object') return entriesLabel(value) || null;
  return String(value);
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Linha com rótulo (label) à esquerda e valor (value) à direita
function InfoRow({ label, value }) {
  const text = valuesLabel(value);
  if (!text) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{text}</Text>
    </View>
  );
}

// Exibe uma lista de textos como "chips" (etiquetas arredondadas)
function ChipList({ values }) {
  const items = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!items.length) return null;
  return (
    <View style={styles.chipWrap}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionRow({ label, value }) {
  const text = valuesLabel(value);
  if (!text) return null;
  return <InfoRow label={label} value={text} />;
}

export default function CharacterDetailScreen({ route }) {
  const { id } = route.params;
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCharacterById(id)
      .then((data) => setCharacter(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error || !character) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Personagem não encontrado.'}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const { personal = {}, debut = {}, family = {}, rank = {}, voiceActors = {} } = character;
  const heroImage = character.images && character.images.length > 0 ? character.images[0] : null;
  const clan = personal.clan || character.clan;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {heroImage ? (
          <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="contain" />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={styles.heroPlaceholderText}>{character.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.name}>{character.name}</Text>
        <View style={styles.chipsRow}>
          {clan ? (
            <View style={styles.titleChip}>
              <Text style={styles.titleChipText}>Clã {clan}</Text>
            </View>
          ) : null}
          {personal.sex ? (
            <View style={[styles.titleChip, styles.titleChipAlt]}>
              <Text style={styles.titleChipText}>{personal.sex}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Section title="Informações pessoais">
        <InfoRow label="Nascimento" value={personal.birthdate} />
        <InfoRow label="Sexo" value={personal.sex} />
        <InfoRow label="Tipo sanguíneo" value={personal.bloodType} />
        <InfoRow label="Idade" value={personal.age} />
        <InfoRow label="Altura" value={personal.height} />
        <InfoRow label="Peso" value={personal.weight} />
        <InfoRow label="Classificação" value={personal.classification} />
        <InfoRow label="Kekkei Genkai" value={personal.kekkeiGenkai} />
      </Section>

      <Section title="Papéis e lealdades">
        <InfoRow label="Ocupação" value={personal.occupation} />
        <InfoRow label="Afiliação" value={personal.affiliation} />
        <InfoRow label="Equipe" value={personal.team} />
        <InfoRow label="Besta com cauda" value={personal.tailedBeast} />
      </Section>

      <Section title="Rank ninja">
        <InfoRow label="Rank" value={rank.ninjaRank} />
        <InfoRow label="Registro" value={rank.ninjaRegistration} />
      </Section>

      <Section title="Aparições">
        <InfoRow label="Mangá" value={debut.manga} />
        <InfoRow label="Anime" value={debut.anime} />
        <InfoRow label="Novel" value={debut.novel} />
        <InfoRow label="Filme" value={debut.movie} />
        <InfoRow label="Game" value={debut.game} />
      </Section>

      <Section title="Família">
        <InfoRow label="Pai" value={family.father} />
        <InfoRow label="Mãe" value={family.mother} />
        <InfoRow label="Filhos" value={family.son} />
        <InfoRow label="Esposa" value={family.wife} />
        <InfoRow label="Irmãos" value={family.brother} />
      </Section>

      <Section title="Jutsus">
        <ChipList values={character.jutsu} />
      </Section>

      <Section title="Naturezas de chakra">
        <ChipList values={character.natureType} />
      </Section>

      <Section title="Ferramentas">
        <ChipList values={character.tools} />
      </Section>

      <Section title="Dubladores">
        <InfoRow label="Japonês" value={voiceActors.japanese} />
        <InfoRow label="Inglês" value={voiceActors.english} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  stateText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 15,
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
  hero: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: 18,
    backgroundColor: colors.secondary,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    fontSize: 96,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  titleChip: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginTop: 4,
  },
  titleChipAlt: {
    backgroundColor: colors.primaryLight,
  },
  titleChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 16,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  infoLabel: {
    width: '38%',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginTop: 8,
  },
  chipText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});