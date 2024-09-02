import React, { useEffect, useState } from 'react';
import { Button, Platform, View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import supabase from './supabaseClient';
import { useUser } from './UserContext'; // Import the UserContext
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // Import GooglePlacesAutocomplete

const AddressInput = ({ setAddress }) => (
    <View style={styles.inputWrapper}>
        <GooglePlacesAutocomplete
            disableScroll={true}
            placeholder='Enter your address'
            onPress={(data, details = null) => {
                const location = details.geometry.location;
                setAddress(data.description);
            }}
            query={{
                key: 'AIzaSyDVIGSrjBq35Kwj-0gKPYeRF2rheWHny-M',
                language: 'en',
            }}
            fetchDetails={true}
            styles={{
                textInputContainer: styles.textInputContainer,
                textInput: styles.addressInputBox,
                listView: styles.listView,
            }}
        />
    </View>
);

const RentInput = ({ rent, setRent }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={styles.minInputBox}
            keyboardType="numeric"
            placeholder="Rent $"
            autoCapitalize="none"
            autoCorrect={false}
            value={rent}
            onChangeText={setRent}
        />
    </View>
);

const BedInput = ({ numBed, setNumBed }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={styles.bedInputBox}
            keyboardType="numeric"
            placeholder="Bedrooms"
            autoCapitalize="none"
            autoCorrect={false}
            value={numBed}
            onChangeText={setNumBed}
        />
    </View>
);

const BathInput = ({ numBath, setNumBath }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={styles.bathInputBox}
            keyboardType="numeric"
            placeholder="Bathrooms"
            autoCapitalize="none"
            autoCorrect={false}
            value={numBath}
            onChangeText={setNumBath}
        />
    </View>
);

const DescriptionInput = ({ description, setDescription }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={styles.descriptionInputBox}
            keyboardType="default"
            placeholder="Description"
            autoCapitalize="sentences"
            autoCorrect={false}
            value={description}
            onChangeText={setDescription}
            multiline={true}
        />
    </View>
);

const CreateProfile = ({ navigation }) => {
    const [address, setAddress] = useState('');
    const [rent, setRent] = useState('');
    const [numBed, setNumBed] = useState('');
    const [numBath, setNumBath] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState(Array(9).fill(null));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser(); // Get the user from context

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (libraryStatus.status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }

                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus.status !== 'granted') {
                    alert('Sorry, we need camera permissions to make this work!');
                }
            }
        })();
    }, []);

    const pickImage = async (index) => {
        if (images[index] === null) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const newImages = [...images];

                // Find the first empty spot in the grid
                const emptyIndex = newImages.findIndex(image => image === null);

                // Place the image in the first empty spot or the selected spot if no empty spot is found
                if (emptyIndex !== -1) {
                    newImages[emptyIndex] = uri;
                } else {
                    newImages[index] = uri;
                }

                setImages(newImages);
            }
        } else {
            Alert.alert(
                'Remove?',
                '',
                [
                    {
                        text: 'Remove',
                        onPress: () => {
                            const newImages = [...images];
                            newImages[index] = null;

                            // Move up images to fill the first spots
                            const filteredImages = newImages.filter(image => image !== null);
                            while (filteredImages.length < newImages.length) {
                                filteredImages.push(null);
                            }

                            setImages(filteredImages);
                        },
                        style: 'destructive'
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ],
                { cancelable: true }
            );
        }
    };

    const handleSaveDetails = async () => {
        if (!address || !rent || !numBed || !numBath || !description) {
            Alert.alert("Please fill in all fields");
            return;
        }
    
        // if (!user) {
        //     Alert.alert("User not authenticated");
        //     return;
        // }
    
        setIsSubmitting(true);
    
        try {
            // Fetch user's school information
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('school, houses')
                .eq('id', user.id)
                .single();
    
            if (profileError) {
                throw profileError;
            }
    
            const { school, houses } = profileData;
    
            // Filter out null images
            const validImages = images.filter(image => image !== null);
    
            // Insert house details and get the generated UUID
            const { data: houseData, error: houseError } = await supabase
                .from('houses')
                .insert([
                    {
                        renter_id: user.id, // Set renter_id to user.id
                        address,
                        rent,
                        bedrooms: numBed,
                        bathrooms: numBath,
                        description,
                        images: validImages, // Use the filtered images array
                        school,
                        likes: 0,
                        swipes: 0,
                        chats: 0
                    }
                ])
                .select('id')
                .single();
    
            if (houseError) {
                throw houseError;
            }
    
            const newHouseId = houseData.id;
    
            // Update user's houses array
            const updatedHouses = houses ? [...houses, newHouseId] : [newHouseId];
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ houses: updatedHouses })
                .eq('id', user.id);
    
            if (updateError) {
                throw updateError;
            }
    
            Alert.alert('House information saved successfully!');
            navigation.navigate('Main');
        } catch (error) {
            Alert.alert('Error saving house information:', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.wholeContainer}>
            <View style={styles.topBanner}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                     <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
             </TouchableOpacity>
             < Text style={styles.titleText}>Add Listing</Text>
            </View>
            <ScrollView
            showsVerticalScrollIndicator={false} 
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container} style={styles.scrollView}>
             {/* <Image source={require('./assets/LogoWords.png')} style={styles.logo} /> */}
             <View style={styles.container}>
                <Text style={styles.photoText}>Photos</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {images.map((image, index) => (
            <TouchableOpacity 
                key={index} 
                onPress={() => pickImage(index)} 
                style={styles.imageContainer}
        >
            <Image 
                source={image ? { uri: image } : require('./assets/RenterHousePhotos.png')} 
                style={styles.photoStyle} 
            />
        </TouchableOpacity>
             ))}
        </View>

            <View style={styles.container}>
                <Text style={styles.addressText}>Address</Text>
            </View>
            <AddressInput setAddress={setAddress} />
            <View style={styles.container}>
                <Text style={styles.rentText}>Monthly Rent</Text>
            </View>
            <RentInput rent={rent} setRent={setRent} />
            <View style={styles.container}>
                <Text style={styles.bedText}>Bedrooms</Text>
            </View>
            <BedInput numBed={numBed} setNumBed={setNumBed} />
            <View style={styles.container}>
                <Text style={styles.bathText}>Bathrooms</Text>
            </View>
            <BathInput numBath={numBath} setNumBath={setNumBath} />
            <View style={styles.container}>
                <Text style={styles.descriptionText}>Description</Text>
            </View>
            <DescriptionInput description={description} setDescription={setDescription} />
            <TouchableOpacity onPress={handleSaveDetails} style={styles.buttonContainer} disabled={isSubmitting}>
                <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Done'}</Text>
            </TouchableOpacity>
        </ScrollView>
        </View>
    );
};

export default CreateProfile;

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#161236',
    },
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wholeContainer: {
        backgroundColor: '#00274C',
        justifyContent: 'center',
        alignItems: 'center',
      },
      topBanner: {
        position: 'absolute',
        width: '100%',
        height: 95,
        flexDirection: 'row', // Corrected typo
        justifyContent: 'center',
        alignContent: 'center',
        top: 0,
        zIndex: 1,
        padding: 10,
        backgroundColor: '#00274C',
        borderBottomWidth: 1,
        borderBottomColor: 'gold',
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
    imageContainer: {
        width: '32%',
        height: 150,
        padding: 2,
        left: 8,
        overflow: 'hidden',
    },
    photoStyle: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 10,
    },
    buttonContainer: {
        backgroundColor: "gold",
        //width: 360,
        width: "100%",
        height: 45,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 150,
      },
      buttonText: {
        color: 'black',
        fontSize: 16,
      },
    // logo: {
    //     width: 135,
    //     height: 135,
    //     top: 0,
    //     left: 0,
    //     resizeMode: 'contain',
    //     position: 'absolute',
    // },
    photoText: {
        right: 135,
        fontSize: 16,
        color: 'white',
        top: 65,
        marginBottom: 50,
    },
    addressText: {
        right: 130,
        fontSize: 16,
        color: 'white',
        bottom: 5,
    },
    rentText: {
        right: 110,
        fontSize: 16,
        color: 'white',
        bottom: 20,
    },
    dashtxt: {
        right: 45,
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        bottom: 135,
    },
    bedText: {
        right: 123,
        fontSize: 16,
        color: 'white',
        bottom: 60,
    },
    bathText: {
        right: 117,
        fontSize: 16,
        color: 'white',
        bottom: 105,
    },
    descriptionText: {
        bottom: 150,
        right: 115,
        fontSize: 16,
        color: 'white',
    },
    textInputContainer: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        height: 50,
        width: "100%",
        borderColor: 'gray',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: -10,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignContent: 'center'
    },
    addressInputBox: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        right: 10,
        top: 7,
        height: 30,
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignContent: 'center'
    },
    listView: {
        backgroundColor: 'white',
    },
    minInputBox: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        height: 50,
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        bottom: 30,
    },
    bedInputBox: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        height: 50,
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        bottom: 75,
    },
    bathInputBox: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        height: 50,
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        bottom: 120
    },
    descriptionInputBox: {
        flex: 1, // Added flex: 1 to ensure it doesn't expand beyond its container
        height: 200,
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        bottom: 165,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 20,
        flexDirection: 'row', // Added flexDirection: row to manage layout
    },
});
