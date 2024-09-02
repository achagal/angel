import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, SafeAreaView, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from './supabaseClient';
import { useUser } from './UserContext'; // Import useUser from your context
import ModalSelector from 'react-native-modal-selector'; // Import ModalSelector

const Settings = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser(); // Get the user and setUser from context
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [schoolOptions, setSchoolOptions] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, school')
          .eq('id', user.id)
          .single();

        if (error) {
          // console.error('Error fetching profile:', error.message);
        } else {
          setName(data.name);
          setSchool(data.school);
        }
      }
    };

    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('school');

      if (error) {
        // console.error('Error fetching schools:', error.message);
      } else {
        const schools = data.map(profile => profile.school).filter((value, index, self) => self.indexOf(value) === index);
        setSchoolOptions(schools);
      }
    };

    fetchProfile();
    fetchSchools();
  }, [user]);

  const handleSaveDetails = async () => {
    if (!name || !school) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, school })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      Alert.alert('Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error saving profile information:', error.message);
    }
  };

  const deleteUserAccount = async (userId, userType, navigation) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this account?',
      [
        {
          text: 'No',
          // onPress: () => console.log('Account deletion canceled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              navigation.navigate('LogIn');
  
              // Step 1: Fetch the user's profile to get associated houses
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('houses')
                .eq('id', userId)
                .single();
  
              if (profileError) {
                throw profileError;
              }
  
              const houseIds = profileData.houses || [];
  
              // Step 2: Delete all messages associated with the user's houses
              for (let houseId of houseIds) {
                const { error: deleteMessagesError } = await supabase
                  .from('messages')
                  .delete()
                  .eq('house_id', houseId);
  
                if (deleteMessagesError) {
                  throw deleteMessagesError;
                }
              }
  
              // Step 3: Delete all matches associated with the user's houses and as a Seeker
              if (userType === 'Seeker') {
                const { error: deleteSeekerMatchesError } = await supabase
                  .from('matches')
                  .delete()
                  .or(`seeker_id.eq.${userId}, house_id.in.(${houseIds.join(',')})`);
  
                if (deleteSeekerMatchesError) {
                  throw deleteSeekerMatchesError;
                }
              } else {
                const { error: deleteRenterMatchesError } = await supabase
                  .from('matches')
                  .delete()
                  .in('house_id', houseIds);
  
                if (deleteRenterMatchesError) {
                  throw deleteRenterMatchesError;
                }
              }
  
              // Step 4: Delete all houses associated with the user
              const { error: deleteHousesError } = await supabase
                .from('houses')
                .delete()
                .in('id', houseIds);
  
              if (deleteHousesError) {
                throw deleteHousesError;
              }
  
              // Step 5: Delete the user's preferences (if Seeker)
              if (userType === 'Seeker') {
                const { error: deletePreferencesError } = await supabase
                  .from('preferences')
                  .delete()
                  .eq('id', userId);
  
                if (deletePreferencesError) {
                  throw deletePreferencesError;
                }
              }
  
              // Step 6: Delete the user's profile
              const { error: deleteProfileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);
  
              if (deleteProfileError) {
                throw deleteProfileError;
              }
  
              //console.log('User account and associated data deleted successfully');
            } catch (error) {
              // console.error('Error deleting user account:', error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = () => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to log out?',
    [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          navigation.navigate('LogIn'); // Navigate to the Login screen
        },
      },
    ],
    { cancelable: false }
  );
};

const handleCustomerSupport = () => {
  const phoneNumber = "+16316446128";
  const message = "";
  Linking.openURL(`sms:${phoneNumber}?&body=${message}`);
};

  const SchoolInput = ({ school, setSchool, schoolOptions }) => (
    sortedSchoolOptions = schoolOptions.sort((a, b) => a.localeCompare(b)),

    <ModalSelector
      data={sortedSchoolOptions.map((schoolOption) => ({ key: schoolOption, label: schoolOption }))}
      initValue="Select a school"
      onChange={(option) => setSchool(option.label)}
      style={styles.pickerContainer}
      selectTextStyle={styles.pickerText}
      optionContainerStyle={styles.optionContainer}
      optionTextStyle={styles.optionText}
      sectionTextStyle={styles.sectionText}
      cancelTextStyle={styles.cancelText}
      cancelText="Close"
      cancelStyle={styles.cancelContainer}
    >
      <TextInput
        style={styles.pickerInput}
        editable={false}
        placeholder="Select a school"
        placeholderTextColor="#434343"
        value={school}
      />
    </ModalSelector>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
        </TouchableOpacity>
        < Text style={styles.titleText}>Settings</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Edit Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Edit School</Text>
          <SchoolInput school={school} setSchool={setSchool} schoolOptions={schoolOptions} />
        </View>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingsOption} onPress={() => navigation.navigate('Notifications')}>
            <Image source={require('./assets/NotificationBell.png')} style={styles.settingsIcon} />
            <Text style={styles.settingsText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption} onPress={handleCustomerSupport}>
            <Image source={require('./assets/PhoneIcon.png')} style={styles.settingsIcon} />
            <Text style={styles.settingsText}>Customer Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption} onPress={handleLogout}>
            <Image source={require('./assets/LogoutIcon.png')} style={styles.settingsIcon} />
            <Text style={styles.settingsText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption} onPress={() => deleteUserAccount(user.id, 'Seeker', navigation)}>
            <Image source={require('./assets/DeleteAccountIcon.png')} style={styles.settingsIcon} />
            <Text style={styles.settingsText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleSaveDetails} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Save</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.ppText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
          <Text style={styles.tosText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 20,
  },
  topBanner: {
    position: 'absolute',
    width: '100%',
    height: 95,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    top: 25,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    width: 20,
    height: 20,
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  formContainer: {
    marginTop: 70,
    width: '100%',
  },
  section: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 60,
    width: '100%',
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: {
    height: 60,
    width: '100%',
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 16,
    justifyContent: 'center',
    marginBottom: 0,
  },
  pickerInput: {
    height: 50,
    width: '100%',
    color: 'black',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  pickerText: {
    color: 'black',
    fontSize: 16,
  },
  settingsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
    height: '100%',
    height: 240
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  settingsText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  doneButton: {
    backgroundColor: '#70349E',
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 100,
  },
  doneButtonText: {
    color: 'black',
    fontSize: 16,
  },
  linksContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  ppText: {
    color: '#fff',
    fontSize: 14,
    left: 40,
  },
  tosText: {
    color: '#fff',
    fontSize: 14,
    right: 35,
  },
  cancelContainer: {
    backgroundColor: 'white', // Background color of the cancel button
    borderRadius: 10, // Border radius of the cancel button (adjust this value as needed)
    padding: 10, // Padding inside the cancel button
  },
  optionContainer: {
    backgroundColor: 'white', // Background color of the options menu
    borderRadius: 10, // Border radius of the options menu
    padding: 5,
  },
  optionText: {
    fontSize: 16, // Font size of the options text
    color: 'black', // Color of the options text
    alignSelf: 'flex-start',
  },
  sectionText: {
    fontSize: 16, // Font size of the section text
    fontWeight: 'bold', // Font weight of the section text
    color: 'black', // Color of the section text
  },
  cancelText: {
    fontSize: 16, // Font size of the cancel text
    color: 'red', // Color of the cancel text
  },
});
