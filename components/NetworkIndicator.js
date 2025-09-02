import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NetworkIndicator = ({
  networkStatus,
  serverURL,
  onNetworkPress,
  onLongPress
}) => {
  const getStatusColor = () => {
    switch (networkStatus || 'disconnected') {
      case 'connected':
        return '#4CAF50';
      case 'checking':
        return '#FF9800';
      case 'disconnected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus || 'disconnected') {
      case 'connected':
        return 'wifi';
      case 'checking':
        return 'time';
      case 'disconnected':
        return 'wifi-off';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      onPress={onNetworkPress || (() => {})}
      onLongPress={onLongPress || (() => {})}
      style={[
        styles.networkIndicator,
        { backgroundColor: getStatusColor() }
      ]}
    >
      <Ionicons
        name={getStatusIcon()}
        size={16}
        color="#fff"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  networkIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default NetworkIndicator;
