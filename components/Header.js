import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Header = ({
  currentUser,
  cameraLocation,
  networkStatus,
  serverURL,
  notificationCount,
  onNetworkPress,
  onNotificationPress,
  onLongPressNetwork
}) => {
  return (
    <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.greetingRow}>
            <Ionicons name="person-circle" size={24} color="#e6f0ff" style={styles.greetingIcon} />
            <Text style={styles.greeting}>
              Hello, <Text style={styles.greetingName}>{currentUser?.username || 'User'}</Text>
            </Text>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.greetingSpacer} />
            <Ionicons name="location-outline" size={14} color="#9aa5b1" style={styles.locationIcon} />
            <Text style={styles.locationText}>
              {cameraLocation || 'Location not set'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerButtons}>
          {/* Network Status Indicator */}
          <TouchableOpacity 
            onPress={onNetworkPress || (() => {})}
            onLongPress={onLongPressNetwork || (() => {})}
            style={[
              styles.networkIndicator,
              (networkStatus || 'disconnected') === 'connected' ? styles.networkConnected : 
              (networkStatus || 'disconnected') === 'checking' ? styles.networkChecking : 
              styles.networkDisconnected
            ]}
          >
            <Ionicons 
              name={
                (networkStatus || 'disconnected') === 'connected' ? 'wifi' : 
                (networkStatus || 'disconnected') === 'checking' ? 'time' : 
                'wifi-off'
              } 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNotificationPress || (() => {})} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {(notificationCount || 0) > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {(notificationCount || 0) > 99 ? '99+' : (notificationCount || 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingIcon: {
    marginRight: 8,
  },
  greeting: {
    color: '#e6f0ff',
    fontSize: 18,
    fontWeight: '600',
  },
  greetingName: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingSpacer: {
    width: 32,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    color: '#9aa5b1',
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  networkConnected: {
    backgroundColor: '#4CAF50',
  },
  networkChecking: {
    backgroundColor: '#FF9800',
  },
  networkDisconnected: {
    backgroundColor: '#F44336',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
