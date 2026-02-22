import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getCategoryById } from '@/constants/categories';
import { useIncidents } from '@/context/incidents';
import MarkerPin from '@/components/MarkerPin';
import IncidentCard from '@/components/IncidentCard';
import ReportSheet from '@/components/ReportSheet';
import { Incident } from '@/lib/api/types';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
}

const DEFAULT_REGION = {
  latitude: 40.7549,
  longitude: -73.984,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2033' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181824' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c3e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373750' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c5a' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e70' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

function WebFallback() {
  const { incidents } = useIncidents();
  const insets = useSafeAreaInsets();

  return (
    <View style={[webStyles.container, { paddingTop: insets.top }]}>
      <View style={webStyles.header}>
        <View>
          <View style={webStyles.liveRow}>
            <View style={webStyles.liveDot} />
            <Text style={webStyles.liveLabel}>LIVE</Text>
          </View>
          <Text style={webStyles.appName}>Vicinity</Text>
        </View>
        <View style={webStyles.countBadge}>
          <Text style={webStyles.countText}>{incidents.length} reports</Text>
        </View>
      </View>

      <View style={webStyles.mapBox}>
        <Text style={webStyles.mapEmoji}>🗺️</Text>
        <Text style={webStyles.mapTitle}>Live Incident Map</Text>
        <Text style={webStyles.mapSub}>
          Scan the QR code to open on your phone and see real-time incident pins on the map
        </Text>
      </View>

      <Text style={webStyles.listLabel}>RECENT REPORTS</Text>
      {incidents.slice(0, 5).map((inc) => {
        const cat = getCategoryById(inc.categoryId);
        return (
          <View key={inc.id} style={webStyles.listItem}>
            <View style={[webStyles.listIcon, { backgroundColor: cat.color + '22' }]}>
              <Text style={webStyles.listEmoji}>{cat.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={webStyles.listTitle}>{inc.title}</Text>
              <Text style={webStyles.listSub}>{inc.reportedBy}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const webStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  liveLabel: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1.5 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.8 },
  countBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: { fontSize: 12, fontWeight: '600', color: Colors.textSub },
  mapBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  mapEmoji: { fontSize: 44, marginBottom: 10 },
  mapTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  mapSub: { fontSize: 13, color: Colors.textSub, textAlign: 'center', lineHeight: 20 },
  listLabel: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2, marginBottom: 10 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  listEmoji: { fontSize: 22 },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  listSub: { fontSize: 12, color: Colors.textMuted },
});

export default function MapScreen() {
  const { incidents } = useIncidents();
  const insets = useSafeAreaInsets();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleMarkerPress = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[Map] Marker pressed:', incident.id, incident.title);
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedIncident(null);
  }, []);

  const handleReportPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 30 }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    setReportVisible(true);
  }, [fabScale]);

  if (Platform.OS === 'web') {
    return <WebFallback />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={DEFAULT_REGION}
        customMapStyle={DARK_MAP_STYLE}
        onPress={handleMapPress}
        onRegionChangeComplete={(region: { latitude: number; longitude: number }) => {
          setMapCenter({ latitude: region.latitude, longitude: region.longitude });
        }}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        showsBuildings={false}
        showsIndoors={false}
      >
        {incidents.map((incident) => {
          const category = getCategoryById(incident.categoryId);
          return (
            <Marker
              key={incident.id}
              coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
              onPress={() => handleMarkerPress(incident)}
              tracksViewChanges={false}
            >
              <MarkerPin emoji={category.emoji} color={category.color} />
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
          <Text style={styles.appName}>Vicinity</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{incidents.length} reports</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} testID="notifications-btn">
            <Bell color={Colors.textSub} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {!selectedIncident && (
        <Animated.View style={[styles.fabWrap, { bottom: 28, transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleReportPress}
            activeOpacity={0.9}
            testID="report-fab"
          >
            <Plus color={Colors.bg} size={20} strokeWidth={3} />
            <Text style={styles.fabLabel}>Report</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {selectedIncident && (
        <IncidentCard
          incident={selectedIncident}
          onDismiss={() => setSelectedIncident(null)}
        />
      )}

      <ReportSheet
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        mapCenter={mapCenter}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(17,17,25,0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSub,
  },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(17,17,25,0.88)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    backgroundColor: Colors.accent,
    borderRadius: 30,
    height: 54,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
  },
  fabLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.bg,
    letterSpacing: -0.2,
  },
});
