import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Alert, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [firstnameFocused, setFirstnameFocused] = useState(false);
  const [lastnameFocused, setLastnameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Animation values for native driver (transform, opacity)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const firstnameTranslateX = useRef(new Animated.Value(40)).current;
  const lastnameTranslateX = useRef(new Animated.Value(50)).current;
  const emailTranslateX = useRef(new Animated.Value(60)).current;
  const phoneTranslateX = useRef(new Animated.Value(70)).current;
  const passwordTranslateX = useRef(new Animated.Value(80)).current;
  const firstnameOpacity = useRef(new Animated.Value(0)).current;
  const lastnameOpacity = useRef(new Animated.Value(0)).current;
  const emailOpacity = useRef(new Animated.Value(0)).current;
  const phoneOpacity = useRef(new Animated.Value(0)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;
  
  // Separate animation values for JS driver (colors, etc.)
  const firstnameBgAnim = useRef(new Animated.Value(0)).current;
  const lastnameBgAnim = useRef(new Animated.Value(0)).current;
  const emailBgAnim = useRef(new Animated.Value(0)).current;
  const phoneBgAnim = useRef(new Animated.Value(0)).current;
  const passwordBgAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Staggered input animations with delay
    Animated.sequence([
      Animated.delay(300),
      Animated.stagger(120, [
        Animated.parallel([
          Animated.timing(firstnameOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(firstnameTranslateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(lastnameOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(lastnameTranslateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(emailOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(emailTranslateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(phoneOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(phoneTranslateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(passwordOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(passwordTranslateX, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!firstname.trim() || !lastname.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      // Shake animation for empty fields
      const shakeAnimation = Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);
      
      shakeAnimation.start(() => {
        Alert.alert('Error', 'Please fill in all fields');
      });
      return;
    }

    setSubmitting(true);
    const ok = await onRegister({
      firstname,
      lastname,
      email,
      password,
      phone_number: phoneNumber,
    });
    if (!ok) {
      // Restore any faded inputs just in case
      firstnameOpacity.setValue(1);
      lastnameOpacity.setValue(1);
      emailOpacity.setValue(1);
      phoneOpacity.setValue(1);
      passwordOpacity.setValue(1);
      fadeAnim.setValue(1);
    }
    setSubmitting(false);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Handle focus animations with JS driver
  const handleFirstnameFocus = () => {
    setFirstnameFocused(true);
    Animated.timing(firstnameBgAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleFirstnameBlur = () => {
    setFirstnameFocused(false);
    Animated.timing(firstnameBgAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleLastnameFocus = () => {
    setLastnameFocused(true);
    Animated.timing(lastnameBgAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleLastnameBlur = () => {
    setLastnameFocused(false);
    Animated.timing(lastnameBgAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
    Animated.timing(emailBgAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleEmailBlur = () => {
    setEmailFocused(false);
    Animated.timing(emailBgAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePhoneFocus = () => {
    setPhoneFocused(true);
    Animated.timing(phoneBgAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handlePhoneBlur = () => {
    setPhoneFocused(false);
    Animated.timing(phoneBgAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    Animated.timing(passwordBgAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    Animated.timing(passwordBgAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  // Interpolate background colors for inputs
  const firstnameBgColor = firstnameBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)']
  });
  
  const lastnameBgColor = lastnameBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)']
  });

  const emailBgColor = emailBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)']
  });

  const phoneBgColor = phoneBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)']
  });

  const passwordBgColor = passwordBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.15)']
  });
  
  const firstnameBorderColor = firstnameBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', '#43cea2']
  });
  
  const lastnameBorderColor = lastnameBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', '#43cea2']
  });

  const emailBorderColor = emailBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', '#43cea2']
  });

  const phoneBorderColor = phoneBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', '#43cea2']
  });

  const passwordBorderColor = passwordBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', '#43cea2']
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientBackground}
      />
      <Animated.View 
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Smart CCTV</Text>
        <Text style={styles.subtitle}>Create your account</Text>
        
        <View style={styles.inputWrapper}>
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                backgroundColor: firstnameBgColor,
                borderColor: firstnameBorderColor,
              }
            ]}
          >
            <Animated.View
              style={{
                opacity: firstnameOpacity,
                transform: [{ translateX: firstnameTranslateX }],
                width: '100%',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#a0a0a0"
                value={firstname}
                onChangeText={setFirstname}
                onFocus={handleFirstnameFocus}
                onBlur={handleFirstnameBlur}
              />
            </Animated.View>
          </Animated.View>
        </View>
        
        <View style={styles.inputWrapper}>
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                backgroundColor: lastnameBgColor,
                borderColor: lastnameBorderColor,
              }
            ]}
          >
            <Animated.View
              style={{
                opacity: lastnameOpacity,
                transform: [{ translateX: lastnameTranslateX }],
                width: '100%',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="#a0a0a0"
                value={lastname}
                onChangeText={setLastname}
                onFocus={handleLastnameFocus}
                onBlur={handleLastnameBlur}
              />
            </Animated.View>
          </Animated.View>
        </View>
        
        <View style={styles.inputWrapper}>
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                backgroundColor: emailBgColor,
                borderColor: emailBorderColor,
              }
            ]}
          >
            <Animated.View
              style={{
                opacity: emailOpacity,
                transform: [{ translateX: emailTranslateX }],
                width: '100%',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
              />
            </Animated.View>
          </Animated.View>
        </View>
        
        <View style={styles.inputWrapper}>
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                backgroundColor: phoneBgColor,
                borderColor: phoneBorderColor,
              }
            ]}
          >
            <Animated.View
              style={{
                opacity: phoneOpacity,
                transform: [{ translateX: phoneTranslateX }],
                width: '100%',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor="#a0a0a0"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={handlePhoneFocus}
                onBlur={handlePhoneBlur}
              />
            </Animated.View>
          </Animated.View>
        </View>
        
        <View style={styles.inputWrapper}>
          <Animated.View 
            style={[
              styles.inputContainer,
              {
                backgroundColor: passwordBgColor,
                borderColor: passwordBorderColor,
              }
            ]}
          >
            <Animated.View
              style={{
                opacity: passwordOpacity,
                transform: [{ translateX: passwordTranslateX }],
                width: '100%',
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
              />
            </Animated.View>
          </Animated.View>
        </View>
        
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%', marginTop: 24 }}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <LinearGradient
              colors={['#43cea2', '#185a9d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Register</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity onPress={onSwitchToLogin} style={styles.switchContainer}>
          <Text style={styles.switchTextLight}>Already have an account? </Text>
          <Text style={styles.switchTextBold}>Login here</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 35, 60, 0.85)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d1d1',
    marginBottom: 28,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#1e233c",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    height: '100%',
    width: '100%',
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    marginTop: 12,
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchTextLight: {
    fontSize: 14,
    color: '#d1d1d1',
  },
  switchTextBold: {
    fontSize: 14,
    color: '#43cea2',
    fontWeight: 'bold',
  }
});

export default RegisterForm;