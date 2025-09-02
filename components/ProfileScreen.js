import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  ScrollView,
  Button
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ 
  currentUser,
  onLogout,
  onShareDevice,
  onScroll
}) => {
  const handleLogout = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
      
      <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </BlurView>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={["#0ea5e9", "#3b82f6", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={54} color="#e5f0ff" />
            </View>
          </LinearGradient>
          <Text style={styles.username}>{currentUser?.username || 'User'}</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* User Information Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="person-outline" size={18} color="#9aa5b1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{currentUser?.username || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="mail-outline" size={18} color="#9aa5b1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{currentUser?.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="camera-outline" size={18} color="#9aa5b1" />
            </View>
            <View style={styles.infoContentRow}>
              <View>
                <Text style={styles.infoLabel}>Cameras</Text>
                <Text style={styles.infoValue}>Connected devices</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{currentUser?.cameras?.length || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={onShareDevice}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="share-social-outline" size={18} color="#9aa5b1" />
            </View>
            <Text style={styles.settingText}>Share device</Text>
            <Ionicons name="chevron-forward" size={18} color="#788290" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="notifications-outline" size={18} color="#9aa5b1" />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#788290" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="shield-outline" size={18} color="#9aa5b1" />
            </View>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#788290" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="help-circle-outline" size={18} color="#9aa5b1" />
            </View>
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#788290" />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    height: 80,
    zIndex: 10,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 22,
    backgroundColor: 'transparent',
    width: '100%',
    height: 80,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
  },
  contentContainer: {
    paddingBottom: 100, // ensure bottom space so navbar doesn't cover logout button
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(24, 24, 28, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e6e9ef',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#9aa5b1',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e6e9ef',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoContentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9aa5b1',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#e6e9ef',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#e6e9ef',
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    minWidth: 220,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B6BFB',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  chip: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    color: '#cfe0ff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProfileScreen;
