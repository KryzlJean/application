import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      level: 1,
      title: 'Smoke Detected - Level 1',
      message: 'Light smoke detected in the kitchen area. Monitor closely.',
      time: '2 minutes ago',
      read: false,
      icon: 'warning-outline',
      color: '#FF9500'
    },
    {
      id: 2,
      level: 2,
      title: 'Smoke Detected - Level 2',
      message: 'Moderate smoke detected in the living room. Immediate attention required.',
      time: '5 minutes ago',
      read: false,
      icon: 'flame-outline',
      color: '#FF3B30'
    },
    {
      id: 3,
      level: 3,
      title: 'Smoke Detected - Level 3',
      message: 'Heavy smoke detected in the basement. EVACUATE IMMEDIATELY!',
      time: '10 minutes ago',
      read: true,
      icon: 'alert-circle-outline',
      color: '#FF0000'
    },
    {
      id: 4,
      level: 1,
      title: 'Smoke Detected - Level 1',
      message: 'Light smoke detected in the garage area. Check for potential sources.',
      time: '15 minutes ago',
      read: true,
      icon: 'warning-outline',
      color: '#FF9500'
    },
    {
      id: 5,
      level: 2,
      title: 'Smoke Detected - Level 2',
      message: 'Moderate smoke detected in the bedroom. Investigate immediately.',
      time: '1 hour ago',
      read: true,
      icon: 'flame-outline',
      color: '#FF3B30'
    },
    {
      id: 6,
      level: 1,
      title: 'Smoke Detected - Level 1',
      message: 'Light smoke detected in the dining room. Monitor situation.',
      time: '2 hours ago',
      read: true,
      icon: 'warning-outline',
      color: '#FF9500'
    }
  ]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const getLevelText = (level) => {
    switch (level) {
      case 1: return 'Level 1';
      case 2: return 'Level 2';
      case 3: return 'Level 3';
      default: return 'Level 1';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return '#FF9500'; // Orange - Light smoke warning
      case 2: return '#FF3B30'; // Red - Moderate smoke alert
      case 3: return '#FF0000'; // Dark Red - Emergency evacuation
      default: return '#FF9500';
    }
  };

  const renderNotification = (notification) => (
    <View key={notification.id} style={[
      styles.notificationItem,
      !notification.read && styles.unreadNotification
    ]}>
      <View style={styles.notificationHeader}>
        <View style={styles.levelContainer}>
          <View style={[
            styles.levelBadge,
            { backgroundColor: getLevelColor(notification.level) }
          ]}>
            <Text style={styles.levelText}>
              {getLevelText(notification.level)}
            </Text>
          </View>
        </View>
        <Text style={styles.timeText}>{notification.time}</Text>
      </View>
      
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${notification.color}20` }
        ]}>
          <Ionicons 
            name={notification.icon} 
            size={20} 
            color={notification.color} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
        {!notification.read && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Smoke Detection Alerts</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.filter(n => !n.read).length}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.filter(n => n.level === 3).length}</Text>
            <Text style={styles.statLabel}>Level 3 (Emergency)</Text>
          </View>
        </View>

        <View style={styles.notificationsList}>
          {notifications.map(renderNotification)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 35,
    backgroundColor: 'transparent',
    width: '100%',
    height: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    padding: 8,
  },
  clearAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9AA5B1',
    fontWeight: '500',
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  unreadNotification: {
    borderColor: 'rgba(0, 122, 255, 0.3)',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#9AA5B1',
    fontSize: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E6E9EF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#9AA5B1',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationsScreen;
