import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraCard from './CameraCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = width * 0.03;

const CameraList = ({
  cameras,
  previewFrames,
  isSelectionMode,
  selectedCameras,
  activeIndex,
  onSelectCamera,
  onLongPressCamera,
  onViewableItemsChanged,
  onRefresh,
  refreshing
}) => {
  const renderCameraCard = ({ item: camera, index }) => (
    <CameraCard
      camera={camera}
      index={index}
      isSelected={selectedCameras && selectedCameras.includes(camera)}
      isSelectionMode={!!isSelectionMode}
      onSelect={onSelectCamera || (() => {})}
      onLongPress={onLongPressCamera || (() => {})}
      onPress={onSelectCamera || (() => {})}
      previewFrame={previewFrames && previewFrames[camera.ip]}
    />
  );

  const renderPaginationDots = () => {
    if (cameras.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {cameras.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === (activeIndex || 0) && styles.activePaginationDot,
            ]}
            onPress={() => {
              // Scroll to specific camera
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                  index,
                  animated: true,
                });
              }
            }}
          >
            <Ionicons
              name={index === (activeIndex || 0) ? 'radio-button-on' : 'radio-button-off'}
              size={12}
              color={index === (activeIndex || 0) ? '#007AFF' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const flatListRef = React.useRef(null);

  if (!cameras || !Array.isArray(cameras) || cameras.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>No cameras added yet</Text>
        <Text style={styles.emptySubtext}>Tap the + button to add your first camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={cameras}
        renderItem={renderCameraCard}
        keyExtractor={(item) => item.ip}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING * 2}
        snapToAlignment="center"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged || (() => {})}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh || (() => {})}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      />
      {renderPaginationDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9aa5b1',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  paginationDot: {
    marginHorizontal: 4,
    padding: 4,
  },
  activePaginationDot: {
    transform: [{ scale: 1.2 }],
  },
});

export default CameraList;
