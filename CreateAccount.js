import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ModalSelector from 'react-native-modal-selector';
import supabase from './supabaseClient';  // Ensure this is the correct path
import { useUser } from './UserContext';

const NameInput = ({ name, setName }) => (
    <TextInput
        style={styles.nameInputBox}
        placeholder="Name"
        placeholderTextColor="#434343"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
        selectTextStyle={styles.inputText}
        placeholderStyle={styles.placeholderText}
    />
);

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

const CreateAccount = ({ route, navigation }) => {
    const { userId } = route.params;
    const { setUser } = useUser();
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [imageUri, setImageUri] = useState(null);
    //const [activeRole, setActiveRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('school');

            if (error) {
                //console.error('Error fetching schools:', error.message);
            } else {
                const schools = data.map(profile => profile.school).filter((value, index, self) => self.indexOf(value) === index);
                setSchoolOptions(schools);
            }
        };

        fetchSchools();
    }, []);

    // const handleRolePress = (role) => {
    //     setActiveRole(role);
    // };

    const pickImage = async () => {
        if (imageUri) {
            // If an image is already selected, remove it
            Alert.alert(
                'Remove Image?',
                '',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Remove',
                        onPress: () => setImageUri(null),
                        style: 'destructive'
                    }
                ]
            );
        } else {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        }
    };

    const handleSaveDetails = async () => {
        if (!name || !school) {
            Alert.alert("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Insert additional profile information
            const { error } = await supabase
                .from('profiles')
                .insert([
                    { id: userId, name, school, profile_pic: imageUri}
                ]);

            if (error) {
                throw error;
            }

            // Set default preferences
            const { error: preferencesError } = await supabase
            .from('preferences')
            .upsert({
                id: userId,
                max_rent: 20000,
                bedrooms: 0,
                bathrooms: 0
            }, { onConflict: ['id'] });

            if (preferencesError) {
                throw preferencesError;
            }

            // Fetch the newly created user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                throw profileError;
            }

            // const role = profile.role;
            setUser({ id: userId });  // Set user data in context

            // Alert.alert('Profile updated successfully!');
            navigation.navigate('Main', { userId });
        } catch (error) {
            Alert.alert('Error saving user information:', error.message);
        } finally {
            setIsSubmitting(false);
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
            <NameInput name={name} setName={setName} />
            <SchoolInput school={school} setSchool={setSchool} schoolOptions={schoolOptions} />
            {/* <TouchableOpacity
                onPress={() => handleRolePress('subletter')}
                style={activeRole === 'subletter' ? styles.letactiveButton : styles.subletContainer}
            >
                <Text style={styles.buttonText}>Find a Sublet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleRolePress('sublessor')}
                style={activeRole === 'sublessor' ? styles.lesactiveButton : styles.sublesContainer}
            >
                <Text style={styles.buttonText}>List a Sublet</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
                onPress={handleSaveDetails}
                style={styles.buttonContainer}
                disabled={isSubmitting}
            >
                <Text style={styles.nextText}>{isSubmitting ? 'Saving...' : 'Save Details'}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default CreateAccount;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141414',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profPicStyle: {
        width: 140,
        height: 140,
        bottom: 170,
        resizeMode: 'cover',
        borderRadius: 250,
        borderWidth: 2,
        borderColor: 'black',
    },
    insertProfStyle: {
        width: 140,
        height: 140,
        bottom: 170,
        borderWidth: 2,
        borderColor: 'black',
        resizeMode: 'contain',
        borderRadius: 250,
        backgroundColor: 'grey'
    },
    nameInputBox: {
        position: 'absolute',
        height: 60,
        width: 360,
        borderColor: 'black',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        top: 325,
        fontSize: 16,
    },
    pickerContainer: {
        height: 60,
        width: 360,
        borderColor: 'black',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        justifyContent: 'center',
        bottom: 53,
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
    inputText: {
        color: 'black',
        fontSize: 16,
    },
    placeholderStyle: {
        color: 'black',
        fontSize: 16,
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
        bottom: 38
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    },
    nextText: {
        fontSize: 16,
        color: 'black'
    },
    logo: {
        width: 135,
        height: 135,
        top: 15,
        left: 5,
        resizeMode: 'contain',
        position: 'absolute'
    },
    cancelContainer: {
        backgroundColor: 'white', // Background color of the cancel button
        borderRadius: 10, // Border radius of the cancel button (adjust this value as needed)
        padding: 10, // Padding inside the cancel button
    },
    optionContainer: {
        backgroundColor: 'white', // Background color of the options menu
        borderRadius: 10, // Border radius of the options menu
        padding: 5
    },
    optionText: {
        fontSize: 16, // Font size of the options text
        color: 'black', // Color of the options text
        alignSelf: 'flex-start'
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
