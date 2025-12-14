import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GradientView } from '@/components/GradientView';
import { useCommunityStore, CommunityPreset, CATEGORY_INFO } from '@/store/useCommunityStore';
import { playFrequencyBath, stopAllFrequencies } from '@/lib/audioEngine';

const { width } = Dimensions.get('window');

type TabType = 'browse' | 'saved' | 'shared';
type CategoryFilter = CommunityPreset['category'] | 'all';

export function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CommunityPreset | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingPresetId, setPlayingPresetId] = useState<string | null>(null);

  // Share form state
  const [shareName, setShareName] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [shareCategory, setShareCategory] = useState<CommunityPreset['category']>('other');
  const [shareTags, setShareTags] = useState('');
  const [shareIsPublic, setShareIsPublic] = useState(true);

  const {
    communityPresets,
    featuredPresets,
    trendingPresets,
    mySharedPresets,
    savedPresets,
    likedPresetIds,
    isLoading,
    fetchCommunityPresets,
    sharePreset,
    unsharePreset,
    savePreset,
    unsavePreset,
    likePreset,
    unlikePreset,
    searchPresets
  } = useCommunityStore();

  useEffect(() => {
    fetchCommunityPresets();
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAllFrequencies();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityPresets();
    setRefreshing(false);
  };

  const filteredPresets = searchQuery || categoryFilter !== 'all'
    ? searchPresets(searchQuery, categoryFilter === 'all' ? undefined : categoryFilter)
    : communityPresets;

  const handleLoadPreset = async (preset: CommunityPreset) => {
    // Stop any currently playing audio
    if (isPlaying) {
      stopAllFrequencies();
    }

    // Play this preset's frequencies
    const frequencies = preset.frequencies.map(f => f.hz);
    const volumes = preset.frequencies.map(f => Math.round(f.volume * 100));
    
    try {
      await playFrequencyBath(frequencies, {
        volumes,
        waveform: 'sine',
        duration: 300 // 5 minutes default
      });
      setIsPlaying(true);
      setPlayingPresetId(preset.id);
      Alert.alert('Playing!', `Now playing "${preset.name}"`);
    } catch (error) {
      Alert.alert('Error', 'Failed to play frequencies');
    }
  };

  const handleStopPlaying = () => {
    stopAllFrequencies();
    setIsPlaying(false);
    setPlayingPresetId(null);
  };

  const handleSavePreset = (preset: CommunityPreset) => {
    const isSaved = savedPresets.some(p => p.id === preset.id);
    if (isSaved) {
      unsavePreset(preset.id);
    } else {
      savePreset(preset);
    }
  };

  const handleLikePreset = (presetId: string) => {
    const isLiked = likedPresetIds.includes(presetId);
    if (isLiked) {
      unlikePreset(presetId);
    } else {
      likePreset(presetId);
    }
  };

  const handleShareCurrentStack = () => {
    // Since we don't have access to the Composer's layers,
    // inform the user to save from Composer instead
    Alert.alert(
      'Share from Composer',
      'To share your custom stack, please save it in the Composer first, then come back here to share it with the community.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmitShare = async () => {
    if (!shareName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your preset');
      return;
    }

    // For now, this creates an empty preset since we don't have access to composer layers
    // In a real implementation, you'd pass the layers from the Composer
    Alert.alert('Coming Soon', 'Sharing from Community screen will be available in a future update. Please use the Composer to create and save your stacks.');
    setShowShareModal(false);
  };

  const handleDeleteShared = (presetId: string) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to remove this shared preset?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => unsharePreset(presetId) }
      ]
    );
  };

  const renderPresetCard = (preset: CommunityPreset, showActions = true) => {
    const categoryInfo = CATEGORY_INFO[preset.category];
    const isLiked = likedPresetIds.includes(preset.id);
    const isSaved = savedPresets.some(p => p.id === preset.id);

    return (
      <TouchableOpacity
        key={preset.id}
        style={styles.presetCard}
        onPress={() => {
          setSelectedPreset(preset);
          setShowDetailModal(true);
        }}
      >
        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '30' }]}>
          <Text style={styles.categoryEmoji}>{categoryInfo.icon}</Text>
          <Text style={[styles.categoryText, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
        </View>

        <Text style={styles.presetName}>{preset.name}</Text>
        <Text style={styles.presetAuthor}>by {preset.authorName}</Text>
        <Text style={styles.presetDescription} numberOfLines={2}>{preset.description}</Text>

        <View style={styles.frequencyPreview}>
          {preset.frequencies.slice(0, 3).map((freq, idx) => (
            <View key={idx} style={styles.freqChip}>
              <Text style={styles.freqChipText}>{freq.hz}Hz</Text>
            </View>
          ))}
          {preset.frequencies.length > 3 && (
            <Text style={styles.moreFreqs}>+{preset.frequencies.length - 3}</Text>
          )}
        </View>

        {showActions && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleLikePreset(preset.id)}
            >
              <Feather
                name={isLiked ? 'heart' : 'heart'}
                size={16}
                color={isLiked ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>{preset.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleSavePreset(preset)}
            >
              <Feather
                name={isSaved ? 'bookmark' : 'bookmark'}
                size={16}
                color={isSaved ? '#a855f7' : '#64748b'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loadBtn}
              onPress={() => handleLoadPreset(preset)}
            >
              <Feather name="play" size={14} color="#fff" />
              <Text style={styles.loadBtnText}>Load</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTrendingSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Trending</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingPresets.map(preset => (
          <View key={preset.id} style={styles.trendingCard}>
            {renderPresetCard(preset, false)}
            <TouchableOpacity
              style={styles.trendingLoadBtn}
              onPress={() => handleLoadPreset(preset)}
            >
              <Feather name="play" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderBrowseTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#a855f7"
        />
      }
    >
      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search presets..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]}
          onPress={() => setCategoryFilter('all')}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {(Object.keys(CATEGORY_INFO) as Array<CommunityPreset['category']>).map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={styles.filterEmoji}>{CATEGORY_INFO[cat].icon}</Text>
            <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
              {CATEGORY_INFO[cat].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trending Section */}
      {!searchQuery && categoryFilter === 'all' && renderTrendingSection()}

      {/* Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {searchQuery || categoryFilter !== 'all' ? '🔍 Results' : '🌟 All Presets'}
        </Text>
        {filteredPresets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No presets found</Text>
          </View>
        ) : (
          filteredPresets.map(preset => renderPresetCard(preset))
        )}
      </View>
    </ScrollView>
  );

  const renderSavedTab = () => (
    <ScrollView style={styles.tabContent}>
      {savedPresets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No saved presets yet</Text>
          <Text style={styles.emptySubtext}>Browse and save presets you like!</Text>
        </View>
      ) : (
        savedPresets.map(preset => renderPresetCard(preset))
      )}
    </ScrollView>
  );

  const renderSharedTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity style={styles.shareButton} onPress={handleShareCurrentStack}>
        <LinearGradient
          colors={['#a855f7', '#6366f1']}
          style={styles.shareButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Feather name="upload" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share Current Stack</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>📤 My Shared Presets</Text>

      {mySharedPresets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={styles.emptyText}>No shared presets yet</Text>
          <Text style={styles.emptySubtext}>Create a frequency stack and share it!</Text>
        </View>
      ) : (
        mySharedPresets.map(preset => (
          <View key={preset.id} style={styles.sharedPresetCard}>
            <View style={styles.sharedPresetHeader}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <View style={styles.sharedBadge}>
                <Feather name={preset.isPublic ? 'globe' : 'lock'} size={12} color="#a855f7" />
                <Text style={styles.sharedBadgeText}>
                  {preset.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>
            <Text style={styles.presetDescription}>{preset.description}</Text>
            <View style={styles.sharedStats}>
              <View style={styles.statItem}>
                <Feather name="heart" size={14} color="#ef4444" />
                <Text style={styles.statText}>{preset.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="download" size={14} color="#10b981" />
                <Text style={styles.statText}>{preset.downloads}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteShared(preset.id)}
            >
              <Feather name="trash-2" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e1b4b', '#111827']} style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Discover & share frequency presets</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['browse', 'saved', 'shared'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Feather
              name={tab === 'browse' ? 'compass' : tab === 'saved' ? 'bookmark' : 'upload'}
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
      {activeTab === 'browse' && renderBrowseTab()}
      {activeTab === 'saved' && renderSavedTab()}
      {activeTab === 'shared' && renderSharedTab()}

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Stack</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Focus Stack"
                placeholderTextColor="#64748b"
                value={shareName}
                onChangeText={setShareName}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what this preset is good for..."
                placeholderTextColor="#64748b"
                value={shareDescription}
                onChangeText={setShareDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {(Object.keys(CATEGORY_INFO) as Array<CommunityPreset['category']>).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catOption, shareCategory === cat && styles.catOptionActive]}
                    onPress={() => setShareCategory(cat)}
                  >
                    <Text style={styles.catOptionEmoji}>{CATEGORY_INFO[cat].icon}</Text>
                    <Text style={[styles.catOptionText, shareCategory === cat && styles.catOptionTextActive]}>
                      {CATEGORY_INFO[cat].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., focus, work, concentration"
                placeholderTextColor="#64748b"
                value={shareTags}
                onChangeText={setShareTags}
              />

              <View style={styles.publicToggle}>
                <Text style={styles.inputLabel}>Make Public</Text>
                <TouchableOpacity
                  style={[styles.toggle, shareIsPublic && styles.toggleActive]}
                  onPress={() => setShareIsPublic(!shareIsPublic)}
                >
                  <View style={[styles.toggleKnob, shareIsPublic && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.frequencyInfo}>
                Share your frequency stack with the community
              </Text>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitShare}>
                <LinearGradient
                  colors={['#a855f7', '#6366f1']}
                  style={styles.submitBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitBtnText}>Share Preset</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPreset && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedPreset.name}</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Feather name="x" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_INFO[selectedPreset.category].color + '30', alignSelf: 'flex-start' }]}>
                    <Text style={styles.categoryEmoji}>{CATEGORY_INFO[selectedPreset.category].icon}</Text>
                    <Text style={[styles.categoryText, { color: CATEGORY_INFO[selectedPreset.category].color }]}>
                      {CATEGORY_INFO[selectedPreset.category].label}
                    </Text>
                  </View>

                  <Text style={styles.detailAuthor}>by {selectedPreset.authorName}</Text>
                  <Text style={styles.detailDescription}>{selectedPreset.description}</Text>

                  <Text style={styles.detailSectionTitle}>Frequencies</Text>
                  {selectedPreset.frequencies.map((freq, idx) => (
                    <View key={idx} style={styles.frequencyRow}>
                      <View style={styles.freqInfo}>
                        <Text style={styles.freqHz}>{freq.hz} Hz</Text>
                        <Text style={styles.freqName}>{freq.name}</Text>
                      </View>
                      <View style={styles.volumeBar}>
                        <View style={[styles.volumeFill, { width: `${freq.volume * 100}%` }]} />
                      </View>
                    </View>
                  ))}

                  {selectedPreset.tags.length > 0 && (
                    <>
                      <Text style={styles.detailSectionTitle}>Tags</Text>
                      <View style={styles.tagContainer}>
                        {selectedPreset.tags.map((tag, idx) => (
                          <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  <View style={styles.detailStats}>
                    <View style={styles.detailStatItem}>
                      <Feather name="heart" size={20} color="#ef4444" />
                      <Text style={styles.detailStatValue}>{selectedPreset.likes}</Text>
                      <Text style={styles.detailStatLabel}>likes</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <Feather name="download" size={20} color="#10b981" />
                      <Text style={styles.detailStatValue}>{selectedPreset.downloads}</Text>
                      <Text style={styles.detailStatLabel}>downloads</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.loadPresetBtn}
                    onPress={() => {
                      handleLoadPreset(selectedPreset);
                      setShowDetailModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={['#a855f7', '#6366f1']}
                      style={styles.loadPresetBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Feather name="play" size={20} color="#fff" />
                      <Text style={styles.loadPresetBtnText}>Load & Play</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12
  },
  categoryFilter: {
    marginBottom: 16
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4
  },
  filterChipActive: {
    backgroundColor: '#a855f7'
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13
  },
  filterChipTextActive: {
    color: '#fff'
  },
  filterEmoji: {
    fontSize: 14
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12
  },
  trendingCard: {
    width: width * 0.75,
    marginRight: 12,
    position: 'relative'
  },
  trendingLoadBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#a855f7',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8
  },
  categoryEmoji: {
    fontSize: 12
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500'
  },
  presetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4
  },
  presetAuthor: {
    fontSize: 12,
    color: '#a855f7',
    marginBottom: 8
  },
  presetDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12
  },
  frequencyPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  freqChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  freqChipText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '500'
  },
  moreFreqs: {
    fontSize: 12,
    color: '#64748b',
    alignSelf: 'center'
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionText: {
    fontSize: 12,
    color: '#64748b'
  },
  likedText: {
    color: '#ef4444'
  },
  loadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
    gap: 4
  },
  loadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
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
    marginTop: 4
  },
  shareButton: {
    marginBottom: 24
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  sharedPresetCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative'
  },
  sharedPresetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sharedBadgeText: {
    fontSize: 12,
    color: '#a855f7'
  },
  sharedStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 12,
    color: '#94a3b8'
  },
  deleteBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },
  modalBody: {
    padding: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  categoryPicker: {
    marginBottom: 16
  },
  catOption: {
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 80
  },
  catOptionActive: {
    backgroundColor: '#a855f7'
  },
  catOptionEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  catOptionText: {
    color: '#94a3b8',
    fontSize: 12
  },
  catOptionTextActive: {
    color: '#fff'
  },
  publicToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
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
  frequencyInfo: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16
  },
  submitBtn: {
    marginBottom: 20
  },
  submitBtnGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  detailAuthor: {
    fontSize: 14,
    color: '#a855f7',
    marginVertical: 8
  },
  detailDescription: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 20
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8
  },
  freqInfo: {
    flex: 1
  },
  freqHz: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7'
  },
  freqName: {
    fontSize: 12,
    color: '#94a3b8'
  },
  volumeBar: {
    width: 60,
    height: 4,
    backgroundColor: '#111827',
    borderRadius: 2
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 2
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  tagText: {
    fontSize: 12,
    color: '#a855f7'
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 24
  },
  detailStatItem: {
    alignItems: 'center'
  },
  detailStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  loadPresetBtn: {
    marginBottom: 20
  },
  loadPresetBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  loadPresetBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
