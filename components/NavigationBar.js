import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NavigationBar = ({ 
  activeTab, 
  onTabChange, 
  isSelectionMode, 
  selectedCameras, 
  onRemoveSelected 
}) => {
  // If in selection mode, show selection controls
  if (isSelectionMode && selectedCameras.length > 0) {
    return (
      <View style={styles.selectionBar}>
        <Text style={styles.selectionText}>
          {selectedCameras.length} camera{selectedCameras.length > 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemoveSelected}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Normal navigation bar
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity
        style={[styles.navButton, activeTab === 'home' && styles.activeNavButton]}
        onPress={() => onTabChange('home')}
      >
        <Ionicons 
          name={activeTab === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeTab === 'home' ? '#007FFF' : '#8E8E93'} 
        />
        <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'add' && styles.activeNavButton]}
        onPress={() => onTabChange('add')}
      >
        <Ionicons 
          name={activeTab === 'add' ? 'add-circle' : 'add-circle-outline'} 
          size={24} 
          color={activeTab === 'add' ? '#007FFF' : '#8E8E93'} 
        />
        <Text style={[styles.navText, activeTab === 'add' && styles.activeNavText]}>
          Add Camera
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'wifi' && styles.activeNavButton]}
        onPress={() => onTabChange('wifi')}
      >
        <Ionicons 
          name={activeTab === 'wifi' ? 'wifi' : 'wifi-outline'} 
          size={24} 
          color={activeTab === 'wifi' ? '#007FFF' : '#8E8E93'} 
        />
        <Text style={[styles.navText, activeTab === 'wifi' && styles.activeNavText]}>
          WiFi Setup
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, activeTab === 'profile' && styles.activeNavButton]}
        onPress={() => onTabChange('profile')}
      >
        <Ionicons 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeTab === 'profile' ? '#007FFF' : '#8E8E93'} 
        />
        <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    paddingVertical: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#38383A',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavButton: {
    // Active state styling handled by icon and text color changes
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavText: {
    color: '#007FFF',
    fontWeight: '500',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#38383A',
  },
  selectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default NavigationBar;
