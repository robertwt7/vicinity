import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThumbsUp, ThumbsDown, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getCategoryById } from '@/constants/categories';
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

interface IncidentRowProps {
  item: Incident;
  onPress: () => void;
}

export default function IncidentRow({ item, onPress }: IncidentRowProps) {
  const category = getCategoryById(item.categoryId);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.72} onPress={onPress}>
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
            <Text style={styles.footerText}>{item.upvotes}</Text>
          </View>
          <View style={styles.footerItem}>
            <ThumbsDown color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.footerText}>{item.downvotes}</Text>
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

const styles = StyleSheet.create({
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
    gap: 8,
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
});
