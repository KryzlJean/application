class NetworkService {
  // Server URL options for different network configurations
  static SERVER_URL_OPTIONS = [
    'http://192.168.1.14/capstone',  // Main network IP (recommended)
    'http://192.168.56.1/capstone',  // XAMPP network IP (fallback)
  ];

  static DEFAULT_SERVER_URL = this.SERVER_URL_OPTIONS[0];

  // Test network connectivity and find best server URL
  static async testServerConnectivity(url) {
    try {
      console.log(`Testing server connectivity: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout
      
      const response = await fetch(`${url}/smokedetection-api/network_test.php`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      if (response.ok) {
        console.log(`✅ Server ${url} is accessible`);
        return true;
      } else {
        console.log(`❌ Server ${url} returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Server ${url} not accessible:`, error.message);
      return false;
    }
  }

  // Find working server URL
  static async findWorkingServer() {
    for (const url of this.SERVER_URL_OPTIONS) {
      if (await this.testServerConnectivity(url)) {
        return url;
      }
    }
    return null;
  }

  // Test server connectivity on app start
  static async testServerOnStart() {
    try {
      // Always test and use the correct network IP
      let workingUrl = null;
      for (const url of this.SERVER_URL_OPTIONS) {
        if (await this.testServerConnectivity(url)) {
          workingUrl = url;
          console.log(`✅ Found working server: ${url}`);
          break;
        }
      }
      
      return workingUrl;
    } catch (error) {
      console.error('Failed to test server:', error);
      return null;
    }
  }

  // Check if URL is valid
  static isValidUrl(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  }

  // Format URL properly
  static formatUrl(url) {
    if (!this.isValidUrl(url)) {
      return `http://${url}`;
    }
    return url;
  }

  // Get network status based on server connectivity
  static async getNetworkStatus(serverURL) {
    if (!serverURL) return 'disconnected';
    
    try {
      const isConnected = await this.testServerConnectivity(serverURL);
      return isConnected ? 'connected' : 'disconnected';
    } catch (error) {
      return 'disconnected';
    }
  }
}

export default NetworkService;

