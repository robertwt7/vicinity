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
import { ThumbsUp, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getCategoryById } from '@/constants/categories';
import { useIncidents } from '@/context/incidents';
import { Incident } from '@/lib/api/types';

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function IncidentRow({ item, onPress }: { item: Incident; onPress: () => void }) {
  const category = getCategoryById(item.categoryId);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.72} onPress={onPress} testID={`feed-item-${item.id}`}>
      <View style={[styles.emojiBox, { backgroundColor: category.color + '1A' }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={[styles.pill, { borderColor: category.color + '55' }]}>
            <Text style={[styles.pillText, { color: category.color }]}>
              {category.label.toUpperCase()}
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock color={Colors.textMuted} size={10} strokeWidth={2} />
            <Text style={styles.timeText}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <ThumbsUp color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.footerText}>{item.upvotes} confirmed</Text>
          </View>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>{item.reportedBy}</Text>
          <View style={{ flex: 1 }} />
          <ChevronRight color={Colors.textMuted} size={14} strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    paddingVertical: 16,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
    gap: 5,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSub,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
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
