import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = width * 0.03;

const CameraCard = ({ 
  camera = {}, 
  index = 0, 
  isSelected = false, 
  isSelectionMode = false, 
  onSelect = () => {}, 
  onLongPress = () => {}, 
  onPress = () => {},
  previewFrame = null
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected && scaleAnim && typeof scaleAnim.setValue === 'function') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim]);

  const handlePress = () => {
    if (camera?.ip && typeof camera.ip === 'string' && camera.ip.trim()) {
      if (isSelectionMode) {
        onSelect(camera);
      } else {
        onPress(camera);
      }
    }
  };

  const handleLongPress = () => {
    if (camera?.ip && typeof camera.ip === 'string' && camera.ip.trim() && !isSelectionMode) {
      onLongPress(camera);
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim || 1 }],
          opacity: opacityAnim || 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.cardContent,
          !!isSelected && styles.selectedCard,
        ]}
              onPress={handlePress || (() => {})}
      onLongPress={handleLongPress || (() => {})}
        activeOpacity={0.8}
      >
        {/* Selection Indicator */}
        {!!isSelectionMode && (
          <View style={[styles.selectionIndicator, !!isSelected && styles.selectedIndicator]}>
                          <Ionicons
                name={!!isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={!!isSelected ? '#fff' : '#666'}
              />
          </View>
        )}

        {/* Camera Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: (camera?.status && typeof camera.status === 'string' ? camera.status.trim() : 'Offline') === 'Online' ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>{camera?.status && typeof camera.status === 'string' ? camera.status.trim() : 'Offline'}</Text>
        </View>

        {/* Camera Info */}
        <View style={styles.cameraInfo}>
          <Text style={styles.cameraName}>{camera?.name && typeof camera.name === 'string' ? camera.name.trim() : 'Unnamed Camera'}</Text>
          <Text style={styles.cameraIP}>{camera?.ip && typeof camera.ip === 'string' ? camera.ip.trim() : 'No IP'}</Text>
          {camera?.location && typeof camera.location === 'string' && camera.location.trim() && (
            <Text style={styles.cameraLocation}>{camera.location.trim()}</Text>
          )}
        </View>

        {/* Preview Frame */}
        {previewFrame && typeof previewFrame === 'string' && previewFrame.trim() && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${previewFrame}` }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={() => (onPress || (() => {}))(camera || {})}>
          <Ionicons name="play-circle" size={32} color="#007AFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING,
  },
  cardContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  selectedIndicator: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraInfo: {
    marginBottom: 16,
  },
  cameraName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cameraIP: {
    color: '#9aa5b1',
    fontSize: 14,
    marginBottom: 2,
  },
  cameraLocation: {
    color: '#9aa5b1',
    fontSize: 12,
  },
  previewContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  actionButton: {
    alignSelf: 'flex-end',
  },
});

export default CameraCard;
