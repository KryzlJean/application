import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';

const WifiSetupModal = ({ onClose, onSave, currentUser, serverURL }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    getCurrentNetworkInfo();
    loadSavedConfigurations();
    // Initial network scan
    scanForNetworks();
    
    // Set up network monitoring
    const networkInterval = setInterval(() => {
      checkNetworkConnection();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(networkInterval);
  }, []);

  const checkNetworkConnection = async () => {
    try {
      const netState = await Network.getNetworkStateAsync();
      if (netState.type === Network.NetworkStateType.WIFI && netState.name) {
        const newNetwork = {
          ssid: netState.name,
          ip: '192.168.50.7', // This would be dynamic in real app
          signal: 4,
          isConnected: true
        };
        
        // Check if this is a new connection
        if (!currentNetwork || currentNetwork.ssid !== newNetwork.ssid) {
          setCurrentNetwork(newNetwork);
          setSsid(newNetwork.ssid);
          
          // Automatically save new WiFi connection to database
          if (currentUser?.id && serverURL && !isConnected) {
            await autoSaveWiFiConnection(newNetwork.ssid);
            setIsConnected(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking network connection:', error);
    }
  };

  const autoSaveWiFiConnection = async (ssid) => {
    if (!currentUser?.id || !serverURL) return;
    
    try {
      // Check if this connection is already saved
      const existingConfig = savedConfigurations.find(config => config.ssid === ssid);
      if (existingConfig) {
        console.log('WiFi connection already saved:', ssid);
        return;
      }

      // Auto-save the connection (without password since we can't detect it)
      const wifiConfig = {
        user_id: currentUser.id,
        ssid: ssid,
        password: 'Auto-detected connection', // Placeholder since we can't detect password
        is_auto_detected: true
      };

      const response = await fetch(`${serverURL}/wifi_config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wifiConfig),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('WiFi connection auto-saved:', ssid);
          // Reload saved configurations
          loadSavedConfigurations();
          Alert.alert('WiFi Connected!', `Connected to ${ssid} and saved to database.`);
        }
      }
    } catch (error) {
      console.error('Error auto-saving WiFi connection:', error);
    }
  };

  const getCurrentNetworkInfo = async () => {
    try {
      const netState = await Network.getNetworkStateAsync();
      if (netState.type === Network.NetworkStateType.WIFI && netState.name) {
        const network = {
          ssid: netState.name,
          ip: '192.168.50.7', // This would be dynamic in real app
          signal: 4,
          isConnected: true
        };
        setCurrentNetwork(network);
        setSsid(netState.name);
        
        // Auto-save if this is a new connection
        if (currentUser?.id && serverURL) {
          await autoSaveWiFiConnection(network.ssid);
        }
      }
    } catch (error) {
      console.error('Error getting network info:', error);
      // Fallback for demo purposes
      setCurrentNetwork({
        ssid: 'Demo Network',
        ip: '192.168.1.100',
        signal: 4,
        isConnected: false
      });
    }
  };

  const scanForNetworks = async () => {
    setIsScanning(true);
    try {
      // In a real app, you would use a native module to scan for WiFi networks
      // For now, we'll simulate the scanning process and show realistic networks
      
      // Simulate network scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate found networks (in real app, these would come from native WiFi scanning)
      const simulatedNetworks = [
        { name: 'HomeNetwork_5G', secured: true, signal: 4, frequency: '5 GHz' },
        { name: 'HomeNetwork_2.4G', secured: true, signal: 3, frequency: '2.4 GHz' },
        { name: 'Neighbor_WiFi', secured: true, signal: 2, frequency: '2.4 GHz' },
        { name: 'Office_Network', secured: false, signal: 3, frequency: '5 GHz' },
        { name: 'Guest_Access', secured: true, signal: 1, frequency: '2.4 GHz' },
        { name: 'Public_WiFi', secured: false, signal: 2, frequency: '2.4 GHz' }
      ];
      
      setAvailableNetworks(simulatedNetworks);
    } catch (error) {
      console.error('Error scanning networks:', error);
      Alert.alert('Error', 'Failed to scan for WiFi networks');
    } finally {
      setIsScanning(false);
    }
  };

  const loadSavedConfigurations = async () => {
    if (!currentUser?.id || !serverURL) return;
    
    try {
      const response = await fetch(`${serverURL}/wifi_config.php?user_id=${currentUser.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedConfigurations(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading saved configurations:', error);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!ssid.trim()) {
      Alert.alert('Error', 'Please enter a WiFi name');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a WiFi password');
      return;
    }

    if (!currentUser?.id || !serverURL) {
      Alert.alert('Error', 'User not authenticated or server not available');
      return;
    }

    setIsLoading(true);
    try {
      const wifiConfig = {
        user_id: currentUser.id,
        ssid: ssid.trim(),
        password: password.trim(),
        is_auto_detected: false
      };

      const response = await fetch(`${serverURL}/wifi_config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wifiConfig),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          Alert.alert('Success', 'WiFi configuration saved to database!');
          // Reload saved configurations
          loadSavedConfigurations();
          // Clear form
          setSsid('');
          setPassword('');
          // Call parent onSave if provided
          if (onSave) {
            await onSave(result.data);
          }
        } else {
          Alert.alert('Error', result.error || 'Failed to save configuration');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving WiFi config:', error);
      Alert.alert('Error', 'Failed to save WiFi configuration to database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      scanForNetworks(),
      loadSavedConfigurations(),
      checkNetworkConnection()
    ]);
    setRefreshing(false);
  };

  const renderSignalBars = (signal) => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push(
        <View
          key={i}
          style={[
            styles.signalBar,
            { backgroundColor: i < signal ? '#4CAF50' : '#E0E0E0' }
          ]}
        />
      );
    }
    return <View style={styles.signalBars}>{bars}</View>;
  };

  const renderNetworkItem = (network, index) => (
    <View key={`network-${index}`} style={styles.networkItem}>
      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>{network.name}</Text>
        <Text style={styles.networkStatus}>
          {network.secured ? 'Secured' : 'Open'} • {network.frequency}
        </Text>
      </View>
      <View style={styles.networkIcons}>
        {network.secured && (
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
        )}
        {renderSignalBars(network.signal)}
      </View>
    </View>
  );

  const renderAvailableNetworks = () => {
    if (availableNetworks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No networks found</Text>
          <Text style={styles.emptyStateSubtext}>Tap refresh to scan for networks</Text>
        </View>
      );
    }

    return availableNetworks.map((network, index) => renderNetworkItem(network, index));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WiFi Setup</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Current Network Information */}
        {currentNetwork && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Network</Text>
              {currentNetwork.isConnected && (
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              )}
            </View>
            <View style={styles.networkInfo}>
              <Text style={styles.infoText}>Network: {currentNetwork.ssid}</Text>
              <Text style={styles.infoText}>IP: {currentNetwork.ip}</Text>
              <View style={styles.signalRow}>
                <Text style={styles.infoText}>Signal: </Text>
                {renderSignalBars(currentNetwork.signal)}
              </View>
              {currentNetwork.isConnected && (
                <Text style={styles.autoSavedText}>
                  ✓ Automatically saved to database
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Available Networks */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Available Networks</Text>
            <TouchableOpacity 
              onPress={scanForNetworks} 
              style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="refresh" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
          {renderAvailableNetworks()}
        </View>

        {/* Saved Configurations */}
        {savedConfigurations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saved Configurations</Text>
            {savedConfigurations.map((config, index) => (
              <View key={config.id} style={styles.savedConfigItem}>
                <View style={styles.savedConfigInfo}>
                  <Text style={styles.savedConfigName}>{config.ssid}</Text>
                  <Text style={styles.savedConfigDate}>
                    {new Date(config.created_at).toLocaleDateString()}
                  </Text>
                  {config.is_auto_detected && (
                    <Text style={styles.autoDetectedText}>Auto-detected</Text>
                  )}
                </View>
                <View style={styles.savedConfigStatus}>
                  <View style={[styles.statusDot, { backgroundColor: config.is_active ? '#4CAF50' : '#FF9800' }]} />
                  <Text style={styles.statusText}>
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Manual WiFi Setup Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manual WiFi Setup</Text>
          <Text style={styles.cardSubtitle}>
            Use this section to manually add WiFi networks or update passwords
          </Text>
          
          {/* WiFi Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>WiFi Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={ssid}
                onChangeText={setSsid}
                placeholder="Enter WiFi name"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={() => {
                  if (availableNetworks.length > 0) {
                    setSsid(availableNetworks[0].name);
                  }
                }}
              >
                <Ionicons name="list" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter WiFi password"
              placeholderTextColor="#999"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Generate QR Code Button */}
          <TouchableOpacity
            style={[styles.generateButton, isLoading && styles.generateButtonDisabled]}
            onPress={handleGenerateQRCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="qr-code" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Save to Database & Generate QR</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0B1220',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  connectedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  autoSavedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  networkInfo: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    gap: 2,
  },
  signalBar: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  networkName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  networkStatus: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  networkIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedConfigItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  savedConfigInfo: {
    flex: 1,
  },
  savedConfigName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  savedConfigDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  autoDetectedText: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontStyle: 'italic',
  },
  savedConfigStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  scanButton: {
    padding: 16,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#374151',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WifiSetupModal;