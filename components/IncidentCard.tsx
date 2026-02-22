import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Clock, ThumbsUp, ChevronRight } from 'lucide-react-native';
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

interface IncidentCardProps {
  incident: Incident;
  onDismiss: () => void;
}

export default function IncidentCard({ incident, onDismiss }: IncidentCardProps) {
  const router = useRouter();
  const category = getCategoryById(incident.categoryId);
  const slideAnim = useRef(new Animated.Value(220)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 22,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [incident.id, slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: category.color }]} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: category.color + '1A', borderColor: category.color + '55' }]}>
            <Text style={styles.badgeEmoji}>{category.emoji}</Text>
            <Text style={[styles.badgeLabel, { color: category.color }]}>{category.label.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} testID="dismiss-incident-card">
            <X color={Colors.textSub} size={15} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={1}>{incident.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{incident.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>{formatTimeAgo(incident.timestamp)}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <ThumbsUp color={Colors.textMuted} size={11} strokeWidth={2} />
            <Text style={styles.metaText}>{incident.upvotes}</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{incident.reportedBy}</Text>
        </View>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => router.push({ pathname: '/incident/[id]' as any, params: { id: incident.id } })}
          activeOpacity={0.8}
          testID="view-detail-btn"
        >
          <Text style={styles.detailBtnText}>View details</Text>
          <ChevronRight color={Colors.accent} size={14} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dismissBtn: {
    width: 26,
    height: 26,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: Colors.textSub,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.accentDim,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent + '25',
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
});
