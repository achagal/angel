import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert, TextInput, ScrollView, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import supabase from './supabaseClient';
import { useUser } from './UserContext';

const Chat = ({ navigation }) => {
    const { user } = useUser();
    const [matchedHouses, setMatchedHouses] = useState([]);
    const [chattedHouses, setChattedHouses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const flatListRef = useRef(null);

    const fetchMatches = async () => {
        if (user) {
            try {
                const { data: matchesData, error: matchesError } = await supabase
                    .from('matches')
                    .select('id, house_id, seeker_id, renter_id, chatted')
                    .or(`seeker_id.eq.${user.id},renter_id.eq.${user.id}`);

                if (matchesError) {
                    throw matchesError;
                }

                const houseIds = matchesData.map(match => match.house_id);
                const seekerIds = matchesData.map(match => match.seeker_id);

                const { data: housesData, error: housesError } = await supabase
                    .from('houses')
                    .select('id, address, images, bedrooms, bathrooms, rent')
                    .in('id', houseIds);

                if (housesError) {
                    throw housesError;
                }

                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, name, profile_pic')
                    .in('id', seekerIds);

                if (profilesError) {
                    throw profilesError;
                }

                const { data: messagesData, error: messagesError } = await supabase
                    .from('messages')
                    .select('recipient_id, sender_id, message, created_at')
                    .or(`recipient_id.in.(${houseIds.join(',')}),sender_id.in.(${houseIds.join(',')})`)
                    .order('created_at', { ascending: false });

                if (messagesError) {
                    throw messagesError;
                }

                const mostRecentMessages = matchesData.reduce((acc, match) => {
                    const message = messagesData
                        .filter(msg => 
                            (msg.recipient_id === match.house_id && msg.sender_id === match.seeker_id) ||
                            (msg.sender_id === match.house_id && msg.recipient_id === match.seeker_id)
                        )
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]; // Get the most recent message
                
                    if (message) {
                        acc[match.house_id] = acc[match.house_id] || {};
                        acc[match.house_id][match.seeker_id] = { 
                            message: message.message, 
                            created_at: message.created_at 
                        };
                    }
                    return acc;
                }, {});
                

                const matchedHousesWithSeekerId = matchesData.filter(match => !match.chatted).map(match => ({
                    ...housesData.find(house => house.id === match.house_id),
                    seeker_id: match.seeker_id,
                    seeker_name: profilesData.find(profile => profile.id === match.seeker_id)?.name,
                    seeker_pic: profilesData.find(profile => profile.id === match.seeker_id)?.profile_pic,
                    match_id: match.id, // Include match ID for uniqueness
                    chatted: match.chatted,
                    most_recent_message: null
                }));

                const chattedHousesWithSeekerId = matchesData.filter(match => match.chatted).map(match => ({
                    ...housesData.find(house => house.id === match.house_id),
                    seeker_id: match.seeker_id,
                    seeker_name: profilesData.find(profile => profile.id === match.seeker_id)?.name,
                    seeker_pic: profilesData.find(profile => profile.id === match.seeker_id)?.profile_pic,
                    match_id: match.id, // Include match ID for uniqueness
                    chatted: match.chatted,
                    most_recent_message: mostRecentMessages[match.house_id]?.[match.seeker_id]?.message || 'No messages yet',
                    created_at: mostRecentMessages[match.house_id]?.[match.seeker_id]?.created_at || new Date(0)
                }));
                

                // Sort chatted houses by the most recent message created_at timestamp in descending order
                chattedHousesWithSeekerId.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                setMatchedHouses(matchedHousesWithSeekerId);
                setChattedHouses(chattedHousesWithSeekerId);
            } catch (error) {
                console.error('Error fetching matches:', error.message);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMatches();
        }, [user])
    );

    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: false });
                }
            }, 100); // Delay the scroll by 100 milliseconds

            return () => clearTimeout(timeout); // Cleanup timeout on unmount or rerun
        }, [chattedHouses])
    );

    const confirmDeleteChat = (houseId) => {
        Alert.alert(
            "Delete chat?",
            "",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => deleteChat(houseId)
                }
            ],
            { cancelable: true }
        );
    };

    const deleteChat = async (houseId) => {
        try {
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('id')
                .or(`seeker_id.eq.${user.id},renter_id.eq.${user.id}`)
                .eq('house_id', houseId)
                .single();
    
            if (matchError) {
                throw matchError;
            }
    
            const { error: deleteError } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchData.id);
    
            if (deleteError) {
                throw deleteError;
            }
    
            setChattedHouses(prevHouses => prevHouses.filter(house => house.id !== houseId));
            fetchMatches();
        } catch (error) {
            console.error('Error deleting chat:', error.message);
        }
    };

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDeleteChat(data.item.id)}
            >
                <Image source={require('./assets/DeleteChat.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
        </View>
    );

    const buttons = [
        { icon: require('./assets/Plane.png'), target: "Flight" },
        { icon: require('./assets/Map.png'), target: "Map" },
        { icon: require('./assets/House.png'), target: "Main" },
        { icon: require('./assets/ChatFilled.png'), target: "Chat" },
        { icon: require('./assets/Profile.png'), target: "ProfileUser" }
    ];

    const filteredHouses = chattedHouses.filter(house => 
        house.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
        house.seeker_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSwipeListStyle = () => {
        if (filteredHouses.length === 1) {
            return styles.chatOne;
        } else if (filteredHouses.length === 2) {
            return styles.chatTwo;
        } else if (filteredHouses.length === 3) {
            return styles.chatThree;
        } else if (filteredHouses.length === 4) {
            return styles.chatFour;
        } else if (filteredHouses.length === 5) {
            return styles.chatFive;
        } else {
            return styles.fullChat;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('./assets/LogoWords.png')}
                style={styles.logo}
            />
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search chats"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Image source={require('./assets/clear_icon.png')} style={styles.clearIcon} />
                    </TouchableOpacity>
                ) : null}
            </View>
            {matchedHouses.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topRowImages}>
                    {matchedHouses.map(house => (
                        <TouchableOpacity 
                            key={house.match_id} // Use match_id for uniqueness
                            style={styles.imageContainer} 
                            onPress={() => navigation.navigate('ChatScreen', { houseId: house.id, chatType: 'SeekerChat', seekerId: house.seeker_id, onGoBack: fetchMatches })}
                        >
                            <Image source={{ uri: house.seeker_id === user.id ? house.images[0] : house.seeker_pic }} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
            {filteredHouses.length === 0 && matchedHouses.length === 0 && (
                <Image
                    style={styles.loading}
                    source={require('./assets/Loading.gif')}
                />
            )}
            <View style={getSwipeListStyle()}>
                <SwipeListView
                    showsVerticalScrollIndicator={false} 
                    listViewRef={(ref) => {
                        flatListRef.current = ref;
                    }}
                    data={filteredHouses}
                    keyExtractor={item => item.match_id} // Use match_id for uniqueness
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            activeOpacity={1}
                            style={styles.messageContainer} 
                            onPress={() => navigation.navigate('ChatScreen', { houseId: item.id, chatType: 'SeekerChat', seekerId: item.seeker_id, onGoBack: fetchMatches })}
                        >
                            <Image source={{ uri: item.seeker_id === user.id ? item.images[0] : item.seeker_pic }} style={styles.avatar} />
                            <View style={styles.textContainer}>
                                <Text style={styles.name}>{item.seeker_id === user.id ? item.address : item.seeker_name}</Text>
                                <Text style={styles.message} numberOfLines={1}>{item.most_recent_message}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    renderHiddenItem={renderHiddenItem}
                    rightOpenValue={-75}
                    inverted
                    bounces={false}
                    style={styles.swipeList}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
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
            <View style={styles.divider}/>
        </SafeAreaView>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#141414',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 20,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 310, // Adjust this value if needed
        backgroundColor: '#141414',
        alignItems: 'center',
      },
    loading: {
        position: 'absolute',
        width: 110,
        height: 110,
        resizeMode: 'contain',
        alignSelf: 'center',
        top: 375
    },    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#141414',
      },
    logo: {
        top: 15,
        left: 5,
        width: 135,
        height: 135,
        resizeMode: 'contain',
        position: 'absolute',
        zIndex: 1,
    },
    searchBarContainer: {
        flexDirection: 'row',
        position: 'absolute',
        width: 370,
        top: 120,
        left: 10,
        right: 20,
        zIndex: 2,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 25,
        backgroundColor: 'white',
        height: 45,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
    },
    clearButton: {
        padding: 5,
    },
    clearIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
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
        resizeMode: 'contain'
    },
    topRowImages: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'transparent',
        padding: 15,
        // borderBottomWidth: 1,
        // borderBottomColor: '#70349E',
        top: 0,
        zIndex: 1,
    },
    imageContainer: {
        width: 75,
        height: 75,
        marginLeft: 5,
        marginRight: 15,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#70349E',
        top: 120,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    messageContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: '#141414',
      alignItems: 'center',
      borderWidth: 2,
      height: 80,
      borderColor: '#141414',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
      color: 'white',
    },
    message: {
      color: '#adadad',
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#141414',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 15,
    },
    deleteButton: {
        width: 75,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        width: 75,
        height: '100%',
        left: 15,
        resizeMode: 'contain',
    },
    swipeList: {
        flex: 1,
        width: '100%',
        // top: 280,
    },
    divider: {
        height: 1,
        width: 375,
        backgroundColor: '#70349E',
        bottom: 530,
    },
    fullChat: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 50, 
    },
    chatOne: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 450, 
    },
    chatTwo: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 370, 
    },
    chatThree: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 290, 
    },
    chatFour: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 210, 
    },
    chatFive: {
        flexGrow: 1, 
        width: '100%', 
        height: 300,
        bottom: 130, 
    },
});
