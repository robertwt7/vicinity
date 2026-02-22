import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ThumbsUp,
  Clock,
  MessageCircle,
  Send,
  Share2,
  UserRound,
  EyeOff,
  MapPin,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { getCategoryById } from '@/constants/categories';
import { useIncidents } from '@/context/incidents';
import { useAuth } from '@/context/auth';
import { Comment } from '@/lib/api/types';
import { getCommentsApi, createCommentApi } from '@/lib/api/comments';

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatTimeFull(date: Date): string {
  const hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = mins.toString().padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day} at ${h}:${m} ${ampm}`;
}

function buildTwitterThread(title: string, description: string, category: string, upvotes: number): string {
  const thread = `🚨 ${category}: ${title}\n\n${description}\n\n👍 ${upvotes} people confirmed this\n\n📍 Reported on Vicinity — know what's happening around you`;
  return thread;
}

function CommentBubble({ comment }: { comment: Comment }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.commentBubble,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthorRow}>
          {comment.isAnonymous ? (
            <View style={styles.anonAvatar}>
              <EyeOff color={Colors.textMuted} size={12} strokeWidth={2} />
            </View>
          ) : (
            <View style={styles.userAvatar}>
              <UserRound color={Colors.accent} size={12} strokeWidth={2} />
            </View>
          )}
          <Text style={[styles.commentAuthor, comment.isAnonymous && styles.commentAuthorAnon]}>
            {comment.author}
          </Text>
        </View>
        <Text style={styles.commentTime}>{formatTimeAgo(comment.timestamp)}</Text>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
    </Animated.View>
  );
}

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { incidents, upvoteIncident } = useIncidents();
  const { user, isAuthenticated } = useAuth();

  const incident = incidents.find((i) => i.id === id);
  const category = incident ? getCategoryById(incident.categoryId) : null;

  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!isAuthenticated);
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const heroFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [heroFade]);

  const commentsQuery = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getCommentsApi(id ?? ''),
    enabled: !!id,
    staleTime: 15_000,
  });

  const addCommentMutation = useMutation({
    mutationFn: createCommentApi,
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(['comments', id], (prev = []) => [
        newComment,
        ...prev,
      ]);
      setCommentText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('[Detail] Comment added:', newComment.id);
    },
    onError: (err) => {
      console.error('[Detail] Comment failed:', err);
    },
  });

  const handleUpvote = useCallback(() => {
    if (!incident) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 1.15, useNativeDriver: true, speed: 30 }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    upvoteIncident(incident.id);
  }, [incident, buttonScale, upvoteIncident]);

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim() || !id) return;
    addCommentMutation.mutate({
      incidentId: id,
      text: commentText.trim(),
      isAnonymous,
    });
  }, [commentText, id, isAnonymous, addCommentMutation]);

  const handleShareTwitter = useCallback(() => {
    if (!incident || !category) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const thread = buildTwitterThread(
      incident.title,
      incident.description,
      category.label,
      incident.upvotes
    );
    const encoded = encodeURIComponent(thread);
    const url = `https://twitter.com/intent/tweet?text=${encoded}`;
    Linking.openURL(url);
    console.log('[Detail] Share to Twitter:', incident.id);
  }, [incident, category]);

  if (!incident || !category) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorEmoji}>🔍</Text>
        <Text style={styles.errorTitle}>Incident not found</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const comments = commentsQuery.data ?? [];

  const renderHeader = () => (
    <Animated.View style={{ opacity: heroFade }}>
      <View style={[styles.heroSection, { backgroundColor: category.color + '0D' }]}>
        <View style={[styles.categoryStrip, { backgroundColor: category.color }]} />

        <View style={styles.heroInner}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroBadge, { backgroundColor: category.color + '1A', borderColor: category.color + '44' }]}>
              <Text style={styles.heroBadgeEmoji}>{category.emoji}</Text>
              <Text style={[styles.heroBadgeLabel, { color: category.color }]}>
                {category.label.toUpperCase()}
              </Text>
            </View>
            <View style={styles.heroTime}>
              <Clock color={Colors.textMuted} size={12} strokeWidth={2} />
              <Text style={styles.heroTimeText}>{formatTimeFull(incident.timestamp)}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{incident.title}</Text>
          <Text style={styles.heroDescription}>{incident.description}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.metaChip}>
              <MapPin color={Colors.textSub} size={12} strokeWidth={2} />
              <Text style={styles.metaChipText}>
                {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <UserRound color={Colors.textSub} size={12} strokeWidth={2} />
              <Text style={styles.metaChipText}>{incident.reportedBy}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.upvoteBtn}
                onPress={handleUpvote}
                activeOpacity={0.8}
                testID="upvote-btn"
              >
                <ThumbsUp color={Colors.accent} size={16} strokeWidth={2.5} />
                <Text style={styles.upvoteText}>{incident.upvotes} Confirmed</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareTwitter}
              activeOpacity={0.8}
              testID="share-twitter-btn"
            >
              <Share2 color="#1DA1F2" size={16} strokeWidth={2.5} />
              <Text style={styles.shareBtnText}>Post to X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.commentsHeader}>
        <View style={styles.commentsHeaderLeft}>
          <MessageCircle color={Colors.textSub} size={16} strokeWidth={2} />
          <Text style={styles.commentsTitle}>
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </Text>
        </View>
      </View>

      {commentsQuery.isLoading && (
        <View style={styles.loadingComments}>
          <ActivityIndicator color={Colors.accent} size="small" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      )}

      {!commentsQuery.isLoading && comments.length === 0 && (
        <View style={styles.emptyComments}>
          <Text style={styles.emptyCommentsEmoji}>💬</Text>
          <Text style={styles.emptyCommentsText}>No comments yet. Be the first to share an update!</Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          testID="back-btn"
        >
          <ArrowLeft color={Colors.text} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{incident.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentBubble comment={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="comments-list"
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.anonToggle}>
            <EyeOff
              color={isAnonymous ? Colors.accent : Colors.textMuted}
              size={14}
              strokeWidth={2}
            />
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: Colors.surfaceHigh, true: Colors.accent + '40' }}
              thumbColor={isAnonymous ? Colors.accent : Colors.textMuted}
              style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
              testID="anon-toggle"
            />
          </View>
          <TextInput
            ref={inputRef}
            style={styles.commentInput}
            placeholder={isAnonymous ? 'Comment anonymously...' : `Comment as ${user?.username ?? 'user'}...`}
            placeholderTextColor={Colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
            testID="comment-input"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!commentText.trim() || addCommentMutation.isPending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || addCommentMutation.isPending}
            testID="send-comment-btn"
          >
            {addCommentMutation.isPending ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Send color={Colors.bg} size={16} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.3,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  heroSection: {
    overflow: 'hidden' as const,
  },
  categoryStrip: {
    height: 3,
  },
  heroInner: {
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroBadgeEmoji: {
    fontSize: 14,
  },
  heroBadgeLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroTimeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  heroDescription: {
    fontSize: 15,
    color: Colors.textSub,
    lineHeight: 22,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.textSub,
    fontWeight: '500' as const,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  upvoteText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(29,161,242,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(29,161,242,0.25)',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1DA1F2',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  loadingComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyCommentsEmoji: {
    fontSize: 32,
  },
  emptyCommentsText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    paddingHorizontal: 40,
    lineHeight: 19,
  },
  commentBubble: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  anonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  commentAuthorAnon: {
    color: Colors.textSub,
    fontStyle: 'italic' as const,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: Colors.textSub,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  errorBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  errorBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.bg,
  },
});
