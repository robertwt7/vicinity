import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useIncidents } from '@/context/incidents';
import IncidentRow from '@/components/IncidentRow';

export default function FeedScreen() {
  const { incidents } = useIncidents();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sorted = [...incidents].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Nearby</Text>
          <Text style={styles.headerSub}>{sorted.length} active incidents</Text>
        </View>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>LIVE</Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncidentRow item={item} onPress={() => router.push({ pathname: '/incident/[id]' as any, params: { id: item.id } })} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌆</Text>
            <Text style={styles.emptyTitle}>All clear nearby</Text>
            <Text style={styles.emptySub}>No incidents reported in your area yet. Be the first to report!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1.2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});
