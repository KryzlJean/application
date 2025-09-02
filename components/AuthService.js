import * as Network from 'expo-network';

class AuthService {
  // Handle login from database
  static async handleLogin(username, password, serverURL) {
    try {
      // Ensure server URL configured
      let baseUrl = serverURL || 'http://192.168.1.14/capstone';
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `http://${baseUrl}`;
      }

      // Basic connectivity check
      const netState = await Network.getNetworkStateAsync();
      if (!netState.isConnected) {
        throw new Error('No Internet connection');
      }

      const url = `${baseUrl}/smokedetection-api/login.php`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

      console.log('🔐 Attempting login at:', url);
      console.log('🌐 Current server URL:', baseUrl);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      console.log('Login response:', text);
      console.log('Login response status:', response.status);
      
      const result = JSON.parse(text);

      if (result.success) {
        const user = result.user;
        return { success: true, user: { ...user, cameras: [] } };
      } else {
        return { success: false, message: result.message || 'Invalid username or password' };
      }
    } catch (error) {
      console.log('Login network error:', error);
      
      let message = 'Login failed due to network error.';
      if (error?.name === 'AbortError') {
        message = 'Login timed out. The server is not responding. Please check your network connection and try again.';
      } else if (error?.message?.includes('Network request failed')) {
        message = 'Network request failed. Please check your internet connection and server URL.';
      } else if (error?.message?.includes('No Internet')) {
        message = 'No Internet connection. Please check your network settings.';
      }
      
      return { success: false, message, error };
    }
  }

  // Handle registration - save to database
  static async handleRegister(newUser, serverURL) {
    try {
      let baseUrl = serverURL || 'http://192.168.1.14/capstone';
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `http://${baseUrl}`;
      }

      const netState = await Network.getNetworkStateAsync();
      if (!netState.isConnected) {
        throw new Error('No Internet connection');
      }

      const url = `${baseUrl}/smokedetection-api/register.php`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds

      console.log('📝 Attempting register at:', url);
      console.log('🌐 Current server URL:', baseUrl);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      console.log('Response:', text);
      console.log('Response status:', response.status);
      
      const result = JSON.parse(text);

      if (result.success) {
        return { success: true, message: 'Registration successful! Please log in.' };
      } else {
        return { success: false, message: result.message || 'Please try again.' };
      }
    } catch (error) {
      console.log('Register network error:', error);
      
      let message = 'Registration failed due to network error.';
      if (error?.name === 'AbortError') {
        message = 'Registration timed out. The server is not responding. Please check your network connection and try again.';
      } else if (error?.message?.includes('Network request failed')) {
        message = 'Network request failed. Please check your internet connection and server URL.';
      } else if (error?.message?.includes('No Internet')) {
        message = 'No Internet connection. Please check your network settings.';
      }
      
      return { success: false, message, error };
    }
  }

  // Validate user input
  static validateUserInput(username, password) {
    if (!username?.trim()) {
      return { valid: false, message: 'Username is required' };
    }
    if (!password?.trim()) {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  }

  // Validate registration input
  static validateRegistrationInput(userData) {
    const { firstname, lastname, email, password, phoneNumber } = userData;
    
    if (!firstname?.trim()) {
      return { valid: false, message: 'First name is required' };
    }
    if (!lastname?.trim()) {
      return { valid: false, message: 'Last name is required' };
    }
    if (!email?.trim()) {
      return { valid: false, message: 'Email is required' };
    }
    if (!password?.trim()) {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    if (!phoneNumber?.trim()) {
      return { valid: false, message: 'Phone number is required' };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    return { valid: true };
  }
}

export default AuthService;
