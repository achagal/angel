import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import supabase from './supabaseClient';
import { useUser } from './UserContext'; // Import useUser from your context
import Matches from './Matches';

const ProfileUser = ({ navigation }) => {
  const buttons = [
    { icon: require('./assets/Plane.png'), target: "Flight" },
    { icon: require('./assets/Friends.png'), target: "Map" },
    { icon: require('./assets/House.png'), target: "Main" },
    { icon: require('./assets/Chat.png'), target: "Chat" },
    { icon: require('./assets/ProfileFilled.png'), target: "ProfileUser" }
  ];

  const { user } = useUser(); // Get the user from context
  const [profile, setProfile] = useState({
    name: '',
    school: '',
    bio: '',
    profile_pic: ''
  });
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, school, profile_pic')
          .eq('id', user.id)
          .single();

        if (error) {
          // console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data);
          if (data.profile_pic) {
            setImageUri(data.profile_pic);
          }
        }
      }
    };

    fetchProfile();
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      updateProfilePic(uri);  // Directly update the profile_pic field in Supabase
    }
  };

  const updateProfilePic = async (url) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ profile_pic: url })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile picture:', error.message);
    } else {
      setProfile({ ...profile, profile_pic: url });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./assets/LogoWords.png')}
        style={styles.logo}
      />
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={imageUri ? { uri: imageUri } : require('./assets/InsertProfilePic.png')}
          style={imageUri ? styles.insertProfStyle : styles.profPicStyle}
        />
      </TouchableOpacity>
      <View contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label1}>{profile.name}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label2}>{profile.school}</Text>
          <View style={styles.underline} />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        style={styles.settingsContainer}>
        <Image source={require('./assets/Settings.png')} style={styles.settings} />
      </TouchableOpacity>
      <View style={styles.bottomHalf}>
        <Matches navigation={navigation} />
      </View>
      <View style={styles.buttonRow}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => navigation.navigate(button.target)}
          >
            <Image source={button.icon} style={styles.bottomRow} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default ProfileUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 135,
    height: 135,
    top: 15,
    left: 5,
    resizeMode: 'contain',
    position: 'absolute'
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginTop: 90,
    marginBottom: 55,
  },
  scrollContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
  },
  profPicStyle: {
    width: 125,
    height: 125,
    resizeMode: 'contain',
    borderRadius: 250,
    top: 100,
    marginBottom: 30,
  },
  insertProfStyle: {
    width: 125,
    height: 125,
    borderWidth: 0,
    borderColor: 'grey',
    resizeMode: 'contain',
    borderRadius: 250,
    top: 100,
    backgroundColor: 'white',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    width: 375,
  },
  bioContainer: {
    marginBottom: 20,
    width: 375,
  },
  label1: {
    color: 'white',
    fontSize: 24,
    top: 90,
    left: 20,
    marginTop: -10,
    marginBottom: -10,
    fontWeight: 'bold',
  },
  label2: {
    color: 'white',
    fontSize: 18,
    top: 90,
    left: 20,
    marginBottom: -5,
    fontWeight: 'bold',
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
    top: 110,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 'auto',
    width: 375,
  },
  boxText: {
    fontSize: 16,
    color: 'black',
  },
  buttonRow: {
    backgroundColor: '#141414',
    height: 100,
    position: 'absolute',
    bottom: -10,
    borderTopWidth: 1,
    borderTopColor: 'grey',
    flexDirection: 'row',
    width: 390,
    justifyContent: 'space-evenly',
    padding: 5,
  },
  button: {
      backgroundColor: '#141414',
      padding: 10,
      width: 45,
      height: 45,
      marginLeft: 15,
      marginRight: 15,
  },
  bottomRow: {
      width: '100%',
      height: '100%',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  settingsContainer: {
    position: 'absolute',
    top: 70,
    right: 20,
  },
  settings: {
    width: 30,
    height: 30,
  },
});
