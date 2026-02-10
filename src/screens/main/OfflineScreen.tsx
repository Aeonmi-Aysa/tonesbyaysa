import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GradientView } from '@/components/GradientView';
import { useOfflineStore, formatBytes, CachedFrequency, CachedStack } from '@/store/useOfflineStore';
import { useFavoritesStore, FavoritesState } from '@/store/useFavoritesStore';

type TabType = 'frequencies' | 'stacks' | 'settings';

export function OfflineScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('frequencies');
  
  const {
    cachedFrequencies,
    cachedStacks,
    autoCache,
    maxCacheSizeMB,
    totalCachedBytes,
    lastSyncDate,
    isDownloading,
    downloadProgress,
    currentDownload,
    cacheFrequency,
    removeFrequency,
    removeStack,
    clearAllCache,
    setAutoCache,
    setMaxCacheSize,
    downloadAllFavorites,
    getCacheStats
  } = useOfflineStore();
  
  const favorites = useFavoritesStore((state: FavoritesState) => state.favorites);
  
  const stats = getCacheStats();
  const usagePercent = (stats.usedMB / stats.maxMB) * 100;

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached frequencies. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAllCache }
      ]
    );
  };

  const handleDownloadFavorites = async () => {
    if (favorites.length === 0) {
      Alert.alert('No Favorites', 'Add some frequencies to your favorites first!');
      return;
    }
    
    const toDownload = favorites
      .filter(f => !cachedFrequencies.some(c => c.hz === f.hz))
      .map(f => ({
        hz: f.hz,
        name: f.name || `${f.hz} Hz`,
        category: f.category || 'general'
      }));
    
    if (toDownload.length === 0) {
      Alert.alert('All Cached', 'All your favorites are already cached!');
      return;
    }
    
    await downloadAllFavorites(toDownload);
    Alert.alert('Done!', `${toDownload.length} frequencies cached for offline use`);
  };

  const handleRemoveFrequency = (freq: CachedFrequency) => {
    Alert.alert(
      'Remove Cache',
      `Remove ${freq.name} from offline cache?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFrequency(freq.hz) }
      ]
    );
  };

  const handleRemoveStack = (stack: CachedStack) => {
    Alert.alert(
      'Remove Stack',
      `Remove "${stack.name}" from offline cache?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeStack(stack.id) }
      ]
    );
  };

  const renderFrequenciesTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Download Favorites Button */}
      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={handleDownloadFavorites}
        disabled={isDownloading}
      >
        <GradientView
          colors={['#10b981', '#059669']}
          style={styles.downloadBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Feather name="download-cloud" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>
            {isDownloading ? 'Downloading...' : 'Cache All Favorites'}
          </Text>
        </GradientView>
      </TouchableOpacity>

      {/* Download Progress */}
      {isDownloading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Caching: {currentDownload}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(downloadProgress)}%</Text>
        </View>
      )}

      {/* Cached Frequencies List */}
      <Text style={styles.sectionTitle}>
        📦 Cached Frequencies ({cachedFrequencies.length})
      </Text>
      
      {cachedFrequencies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📲</Text>
          <Text style={styles.emptyText}>No frequencies cached</Text>
          <Text style={styles.emptySubtext}>Cache frequencies to use offline</Text>
        </View>
      ) : (
        cachedFrequencies.map(freq => (
          <View key={freq.hz} style={styles.cachedItem}>
            <View style={styles.cachedInfo}>
              <Text style={styles.cachedHz}>{freq.hz} Hz</Text>
              <Text style={styles.cachedName}>{freq.name}</Text>
              <Text style={styles.cachedMeta}>
                {formatBytes(freq.sizeBytes)} • {new Date(freq.cachedAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.cachedActions}>
              <View style={styles.cachedBadge}>
                <Feather name="check-circle" size={14} color="#10b981" />
              </View>
              <TouchableOpacity 
                style={styles.removeBtn}
                onPress={() => handleRemoveFrequency(freq)}
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderStacksTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        🗂️ Cached Stacks ({cachedStacks.length})
      </Text>
      
      {cachedStacks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No stacks cached</Text>
          <Text style={styles.emptySubtext}>
            Cache your favorite frequency stacks for offline use
          </Text>
        </View>
      ) : (
        cachedStacks.map(stack => (
          <View key={stack.id} style={styles.stackCard}>
            <View style={styles.stackHeader}>
              <Text style={styles.stackName}>{stack.name}</Text>
              <TouchableOpacity 
                style={styles.removeBtn}
                onPress={() => handleRemoveStack(stack)}
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.stackFrequencies}>
              {stack.frequencies.map((freq, idx) => (
                <View key={idx} style={styles.stackFreqChip}>
                  <Text style={styles.stackFreqText}>{freq.hz}Hz</Text>
                </View>
              ))}
            </View>
            <Text style={styles.stackMeta}>
              {formatBytes(stack.totalSizeBytes)} • {new Date(stack.cachedAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Cache Limit */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingTitle}>Cache Size Limit</Text>
          <Text style={styles.settingValue}>{maxCacheSizeMB} MB</Text>
        </View>
        <View style={styles.cacheSizeOptions}>
          {[50, 100, 200, 500].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeOption,
                maxCacheSizeMB === size && styles.sizeOptionActive
              ]}
              onPress={() => setMaxCacheSize(size)}
            >
              <Text style={[
                styles.sizeOptionText,
                maxCacheSizeMB === size && styles.sizeOptionTextActive
              ]}>
                {size} MB
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Auto Cache */}
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Auto-Cache Favorites</Text>
            <Text style={styles.settingDescription}>
              Automatically cache new favorites for offline use
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, autoCache && styles.toggleActive]}
            onPress={() => setAutoCache(!autoCache)}
          >
            <View style={[styles.toggleKnob, autoCache && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Sync */}
      {lastSyncDate && (
        <View style={styles.settingCard}>
          <Text style={styles.settingTitle}>Last Sync</Text>
          <Text style={styles.settingValue}>
            {new Date(lastSyncDate).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Clear Cache */}
      <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
        <Feather name="trash" size={18} color="#ef4444" />
        <Text style={styles.clearButtonText}>Clear All Cache</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <GradientView colors={['#1e1b4b', '#111827']} style={styles.header}>
        <Text style={styles.title}>Offline Mode</Text>
        <Text style={styles.subtitle}>Use Tones by Aysa without internet</Text>
      </GradientView>

      {/* Storage Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.statsLabel}>Cache Used</Text>
            <Text style={styles.statsValue}>
              {stats.usedMB} MB / {stats.maxMB} MB
            </Text>
          </View>
          <View style={styles.statsCounts}>
            <View style={styles.statCount}>
              <Feather name="music" size={14} color="#a855f7" />
              <Text style={styles.statCountText}>{stats.frequencyCount}</Text>
            </View>
            <View style={styles.statCount}>
              <Feather name="layers" size={14} color="#10b981" />
              <Text style={styles.statCountText}>{stats.stackCount}</Text>
            </View>
          </View>
        </View>
        <View style={styles.usageBar}>
          <View 
            style={[
              styles.usageFill, 
              { 
                width: `${Math.min(usagePercent, 100)}%`,
                backgroundColor: usagePercent > 80 ? '#ef4444' : usagePercent > 50 ? '#f59e0b' : '#10b981'
              }
            ]} 
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['frequencies', 'stacks', 'settings'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Feather
              name={tab === 'frequencies' ? 'music' : tab === 'stacks' ? 'layers' : 'settings'}
              size={18}
              color={activeTab === tab ? '#a855f7' : '#64748b'}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'frequencies' && renderFrequenciesTab()}
      {activeTab === 'stacks' && renderStacksTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4
  },
  statsCard: {
    backgroundColor: '#1f2937',
    margin: 16,
    padding: 16,
    borderRadius: 16
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statsLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  statsCounts: {
    flexDirection: 'row',
    gap: 16
  },
  statCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  usageBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden'
  },
  usageFill: {
    height: '100%',
    borderRadius: 4
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  activeTab: {
    backgroundColor: '#374151'
  },
  tabText: {
    fontSize: 14,
    color: '#64748b'
  },
  activeTabText: {
    color: '#a855f7',
    fontWeight: '600'
  },
  tabContent: {
    flex: 1,
    padding: 16
  },
  downloadBtn: {
    marginBottom: 20
  },
  downloadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  progressContainer: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4
  },
  progressPercent: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center'
  },
  cachedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10
  },
  cachedInfo: {
    flex: 1
  },
  cachedHz: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7'
  },
  cachedName: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2
  },
  cachedMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  cachedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cachedBadge: {
    backgroundColor: '#10b98120',
    padding: 6,
    borderRadius: 8
  },
  removeBtn: {
    padding: 8
  },
  stackCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  stackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  stackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  stackFrequencies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8
  },
  stackFreqChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  stackFreqText: {
    fontSize: 12,
    color: '#a855f7'
  },
  stackMeta: {
    fontSize: 12,
    color: '#64748b'
  },
  settingCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  settingValue: {
    fontSize: 14,
    color: '#a855f7'
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cacheSizeOptions: {
    flexDirection: 'row',
    gap: 8
  },
  sizeOption: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  sizeOptionActive: {
    backgroundColor: '#a855f7'
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#94a3b8'
  },
  sizeOptionTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: '#374151',
    borderRadius: 14,
    padding: 2
  },
  toggleActive: {
    backgroundColor: '#a855f7'
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12
  },
  toggleKnobActive: {
    marginLeft: 22
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444'
  }
});
