import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, SafeAreaView, Alert } from 'react-native';
import { useUser } from './UserContext';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client

const EmailInput = ({ email, setEmail }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.emailInputBox}
      keyboardType="email-address"
      placeholder="Email"
      placeholderTextColor="#434343"
      autoCapitalize="none"
      autoCorrect={false}
      value={email}
      onChangeText={setEmail}
    />
  </View>
);

const PasswordInput = ({ password, setPassword }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.passwordInputBox}
      secureTextEntry={true}
      placeholder="Password"
      placeholderTextColor="#434343"
      autoCapitalize="none"
      autoCorrect={false}
      value={password}
      onChangeText={setPassword}
    />
  </View>
);

const ImageRow = ({ navigation }) => (
  <View style={styles.imageRowContainer}>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
    <TouchableOpacity>
      <Image
        source={require('./assets/Blank.png')}
        style={styles.imageStyle}
      />
    </TouchableOpacity>
  </View>
);

const LogIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();

  const isButtonDisabled = !email || !password;

  const handleLoginPress = async () => {
    if (isButtonDisabled) {
      Alert.alert('Please fill in both email and password fields.');
      return;
    }
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      Alert.alert(error.message);
    } else {
      const userId = data?.user?.id;
  
      if (!userId) {
        Alert.alert('Error', 'User ID is missing.');
        return;
      }
  
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
  
      if (profileError) {
        Alert.alert(profileError.message);
      } else {
        setUser(profile);  // Set user data in context
        navigation.navigate('Main');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('./assets/AppIcon.png')} 
        style={styles.iconStyle}
      />
      {/* <Image 
        source={require('./assets/LogoWords.png')} 
        style={styles.logoStyle}
      /> */}
      <EmailInput email={email} setEmail={setEmail} />
      <PasswordInput password={password} setPassword={setPassword} />
      <TouchableOpacity 
        onPress={handleLoginPress}
        style={styles.buttonContainer}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      <ImageRow navigation={navigation}/>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')} style={{ bottom: 142 }}>
        <Text style={styles.loginButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.createAccountButtonContainer}>
        <Text style={styles.newAccountButton}>Create new account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    bottom: 0,
  },
  imageStyle: {
    width: 0,
    height: 60,
    resizeMode: 'contain',
    backgroundColor: '#141414',
  },
  iconStyle: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    top: 100,
    zIndex: 1,
  },
  logoStyle: {
    width: 600,
    height: 350,
    top: -190,
    resizeMode: 'contain'
  },
  emailInputBox: {
    position: 'absolute',
    height: 60,
    width: 360,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    top: 130,
    fontSize: 16
  },
  passwordInputBox: {
    position: 'absolute',
    height: 60,
    width: 360,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 165,
    fontSize: 16
  },
  buttonContainer: {
    backgroundColor: '#70349E',
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 151
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    bottom: 75,
  },
  newAccountButton: {
    color: '#70349E',
    fontSize: 16,
  },
  createAccountButtonContainer: {
    backgroundColor: "#141414",
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#70349E',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 20
  }
});