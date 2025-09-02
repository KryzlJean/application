import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const NavigationBar = ({ activeTab, onTabChange, isSelectionMode, selectedCameras, onRemoveSelected }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'add', icon: 'add-circle', label: 'Add Camera' },
    { id: 'wifi', icon: 'wifi', label: 'WiFi Setup' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <BlurView intensity={90} tint="dark" style={styles.navbarBlur}>
      <View style={styles.navbar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => (onTabChange || (() => {}))(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? '#007AFF' : '#9aa5b1'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Selection Mode Actions */}
              {!!isSelectionMode && selectedCameras && selectedCameras.length > 0 && (
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemoveSelected || (() => {})}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.removeButtonText}>
              Remove ({selectedCameras.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  navbarBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tabLabel: {
    color: '#9aa5b1',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectionActions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NavigationBar;
