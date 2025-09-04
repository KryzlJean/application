import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WifiSetupModal = ({ visible, onClose, currentUser, serverURL }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSavedConfigurations();
      scanForNetworks();
      checkNetworkConnection();
    }
  }, [visible]);

  const scanForNetworks = () => {
    // Simulate network scanning - in real app, this would use device WiFi APIs
    const mockNetworks = [
      { id: 1, ssid: 'HomeWiFi', strength: 4, secured: true, isConnected: true },
      { id: 2, ssid: 'NeighborWiFi', strength: 3, secured: true, isConnected: false },
      { id: 3, ssid: 'GuestNetwork', strength: 2, secured: false, isConnected: false },
      { id: 4, ssid: 'OfficeWiFi', strength: 5, secured: true, isConnected: false },
    ];
    setNetworks(mockNetworks);
  };

  const loadSavedConfigurations = async () => {
    if (!currentUser || !serverURL) return;
    
    try {
      const response = await fetch(`${serverURL}/smokedetection-api/wifi_config.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.configurations) {
          setSavedConfigs(data.configurations);
        }
      }
    } catch (error) {
      console.log('Failed to load saved configurations:', error);
    }
  };

  const checkNetworkConnection = async () => {
    try {
      const response = await fetch(`${serverURL}/smokedetection-api/network_test.php`);
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const autoSaveWiFiConnection = async (networkSSID) => {
    if (!currentUser || !serverURL) return;
    
    try {
      const response = await fetch(`${serverURL}/smokedetection-api/wifi_config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          ssid: networkSSID,
          password: '', // Auto-detected connections don't have passwords
          is_active: true,
          is_auto_detected: true,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          loadSavedConfigurations();
        }
      }
    } catch (error) {
      console.log('Failed to auto-save WiFi connection:', error);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!ssid.trim()) {
      Alert.alert('Error', 'Please enter WiFi network name');
      return;
    }

    if (!currentUser || !serverURL) {
      Alert.alert('Error', 'Server connection not available');
      return;
    }

    setLoading(true);
    
    try {
      // Save to database
      const response = await fetch(`${serverURL}/smokedetection-api/wifi_config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          ssid: ssid.trim(),
          password: password.trim(),
          is_active: true,
          is_auto_detected: false,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowQR(true);
          loadSavedConfigurations();
        } else {
          Alert.alert('Error', data.message || 'Failed to save configuration');
        }
      } else {
        Alert.alert('Error', 'Failed to save configuration');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedConfigurations();
    scanForNetworks();
    checkNetworkConnection();
    setTimeout(() => setRefreshing(false), 1000);
  };



  const renderNetworkItem = (network) => (
    <TouchableOpacity 
      key={network.id}
      style={[
        styles.networkItem,
        network.isConnected && styles.connectedNetwork
      ]}
      onPress={() => {
        setSsid(network.ssid);
        if (network.isConnected) {
          autoSaveWiFiConnection(network.ssid);
        }
      }}
    >
      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>
          {network.ssid}
          {network.isConnected && " (Connected)"}
        </Text>
        <View style={styles.networkDetails}>
          <Text style={styles.networkDetail}>
            Signal: {network.strength}/5
          </Text>
          <Text style={styles.networkDetail}>
            {network.secured ? 'Secured' : 'Open'}
          </Text>
        </View>
      </View>
      <View style={styles.networkIcon}>
        <Ionicons 
          name={network.isConnected ? "wifi" : "wifi-outline"} 
          size={24} 
          color={network.isConnected ? "#4CAF50" : "#666"} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderSavedConfig = (config) => (
    <View key={config.id} style={styles.savedConfigItem}>
      <View style={styles.configInfo}>
        <Text style={styles.configName}>{config.ssid}</Text>
        <Text style={styles.configDetail}>
          {config.is_auto_detected ? 'Auto-detected' : 'Manual setup'}
        </Text>
      </View>
      <View style={styles.configStatus}>
        <View style={[
          styles.statusDot,
          { backgroundColor: config.is_active ? '#4CAF50' : '#999' }
        ]} />
      </View>
    </View>
  );

  const emptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="wifi-outline" size={48} color="#666" />
      <Text style={styles.emptyStateText}>No networks found</Text>
      <Text style={styles.emptyStateSubtext}>
        Pull down to refresh and scan for available networks
      </Text>
    </View>
  );



  if (!visible) return null;

  console.log('WifiSetupModal rendering with:', { 
    visible, 
    currentUser: currentUser ? { id: currentUser.id, name: currentUser.firstname } : null, 
    serverURL,
    networks: networks.length,
    savedConfigs: savedConfigs.length,
    isConnected
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WiFi Setup</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
      >
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={isConnected ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={isConnected ? "#4CAF50" : "#FF3B30"} 
            />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected to Server' : 'Server Connection Failed'}
            </Text>
          </View>
        </View>

        {/* Available Networks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Networks</Text>
          {networks.length > 0 ? (
            networks.map(renderNetworkItem)
          ) : (
            emptyState()
          )}
        </View>

        {/* Saved Configurations */}
        {savedConfigs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Configurations</Text>
            {savedConfigs.map(renderSavedConfig)}
          </View>
        )}

        {/* Manual Setup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual WiFi Setup</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Network Name (SSID)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter WiFi network name"
              placeholderTextColor="#999"
              value={ssid}
              onChangeText={setSsid}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter WiFi password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={handleGenerateQRCode}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.generateButtonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="qr-code-outline" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Save Configuration</Text>
              </>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginLeft: -40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  networkItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectedNetwork: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  networkDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  networkDetail: {
    color: '#999',
    fontSize: 14,
  },
  networkIcon: {
    marginLeft: 16,
  },
  savedConfigItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  configInfo: {
    flex: 1,
  },
  configName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  configDetail: {
    color: '#999',
    fontSize: 14,
  },
  configStatus: {
    marginLeft: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#666',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WifiSetupModal; 