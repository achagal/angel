import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Please enter your email address.');
      return;
    }

    // Attempt to send a password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Success', 'Password reset email sent!');
      navigation.navigate('LogIn');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Image 
        source={require('./assets/AppIcon.png')}  // Adjust the path as necessary
        style={styles.iconStyle}
      />
      {/* <Image 
        source={require('./assets/LogoWords.png')}  // Adjust the path as necessary
        style={styles.logoStyle}
      /> */}
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        placeholder="Enter your email"
        placeholderTextColor="#434343"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity onPress={handleForgotPassword} style={styles.button}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 20,
    height: 20,
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  iconStyle: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    bottom: 154,
    zIndex: 1,
  },
  logoStyle: {
    width: 600,
    height: 350,
    top: -120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  input: {
    height: 60,
    width: 360,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 120,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#70349E',
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 105
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
});
