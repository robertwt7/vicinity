import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Send } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { CATEGORIES, CategoryId } from '@/constants/categories';
import { useIncidents } from '@/context/incidents';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CATEGORY_ITEM_SIZE = (SCREEN_WIDTH - 40 - 30) / 4;

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  mapCenter: { latitude: number; longitude: number };
}

export default function ReportSheet({ visible, onClose, mapCenter }: ReportSheetProps) {
  const { addIncident, isSubmitting } = useIncidents();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 28,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = () => {
    setSelectedCategory(null);
    setDescription('');
    onClose();
  };

  const handleCategorySelect = (id: CategoryId) => {
    setSelectedCategory(id);
    Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    if (!selectedCategory || isSubmitting) return;
    try {
      await addIncident({
        categoryId: selectedCategory,
        description,
        latitude: mapCenter.latitude + (Math.random() - 0.5) * 0.006,
        longitude: mapCenter.longitude + (Math.random() - 0.5) * 0.006,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch (e) {
      console.error('[ReportSheet] Submit error:', e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Report an incident</Text>
              <Text style={styles.subtitle}>Help people around you stay informed</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} testID="close-report-sheet">
              <X color={Colors.textSub} size={18} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>What's happening?</Text>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    {
                      width: CATEGORY_ITEM_SIZE,
                      height: CATEGORY_ITEM_SIZE,
                      backgroundColor: isSelected ? cat.color + '22' : Colors.surfaceHigh,
                      borderColor: isSelected ? cat.color : Colors.border,
                    },
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                  activeOpacity={0.7}
                  testID={`category-${cat.id}`}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.catLabel,
                      { color: isSelected ? cat.color : Colors.textSub },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Add details</Text>

          <TextInput
            style={styles.input}
            placeholder="Describe what you see..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
            testID="description-input"
          />

          <View style={styles.locationRow}>
            <MapPin color={Colors.textMuted} size={12} strokeWidth={2} />
            <Text style={styles.locationText}>Placed at your current map view</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: selectedCategory && !isSubmitting ? Colors.accent : Colors.surfaceHigh },
            ]}
            onPress={handleSubmit}
            disabled={!selectedCategory || isSubmitting}
            activeOpacity={0.85}
            testID="submit-report"
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <>
                <Send
                  color={selectedCategory ? Colors.bg : Colors.textMuted}
                  size={16}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.submitText,
                    { color: selectedCategory ? Colors.bg : Colors.textMuted },
                  ]}
                >
                  Submit Report
                </Text>
              </>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  closeBtn: {
    width: 34,
    height: 34,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  categoryItem: {
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 5,
  },
  catEmoji: {
    fontSize: 24,
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  submitBtn: {
    borderRadius: 18,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
