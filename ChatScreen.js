import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import supabase from './supabaseClient';
import { useUser } from './UserContext';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { format, isSameDay, parseISO } from 'date-fns';

const ChatScreen = ({ navigation, route }) => {
    const { user } = useUser();
    const { houseId, chatType, seekerId } = route.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [house, setHouse] = useState(null);
    const [match, setMatch] = useState(null);
    const [seekerName, setSeekerName] = useState(null); // New state for seeker name
    const [seekerPic, setSeekerPic] = useState(null); // New state for seeker profile picture
    const translateX = useSharedValue(0);

    const formatTime = (dateString) => {
        return format(parseISO(dateString), 'hh:mm aa');
    };

    const formatDate = (dateString) => {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    };

    const gestureHandler = (event) => {
        if (event.nativeEvent.translationX < 0 && event.nativeEvent.translationX > -80) {
            translateX.value = withSpring(event.nativeEvent.translationX);
        }
    };

    const gestureEndHandler = () => {
        translateX.value = withSpring(0);
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // Fetch house data
    useEffect(() => {
        const fetchHouse = async () => {
            try {
                const { data: houseData, error: houseError } = await supabase
                    .from('houses')
                    .select('*')
                    .eq('id', houseId)
                    .single();

                if (houseError) {
                    throw houseError;
                }

                setHouse(houseData);
            } catch (error) {
                // console.error('Error fetching house:', error.message);
            }
        };

        fetchHouse();
    }, [houseId]);

    // Fetch match data
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const { data: matchData, error: matchError } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('seeker_id', seekerId) // Use seekerId here
                    .eq('house_id', houseId)
                    .single();

                if (matchError) {
                    throw matchError;
                }

                setMatch(matchData);
            } catch (error) {
                // console.error('Error fetching match:', error.message);
            }
        };

        fetchMatch();
    }, [houseId, seekerId]);

    // Fetch seeker's name and profile picture
    useEffect(() => {
        const fetchSeekerInfo = async () => {
            if (seekerId !== user.id) {
                try {
                    const { data: seekerData, error: seekerError } = await supabase
                        .from('profiles')
                        .select('name, profile_pic')
                        .eq('id', seekerId)
                        .single();

                    if (seekerError) {
                        throw seekerError;
                    }

                    setSeekerName(seekerData.name);
                    setSeekerPic(seekerData.profile_pic);
                } catch (error) {
                    // console.error('Error fetching seeker info:', error.message);
                }
            }
        };

        fetchSeekerInfo();
    }, [seekerId]);

    // Fetch messages based on match data
    useEffect(() => {
        if (match) {
            const fetchMessages = async () => {
                try {
                    const { data: messagesData, error: messagesError } = await supabase
                        .from('messages')
                        .select('*')
                        .or(
                            `and(sender_id.eq.${match.seeker_id},recipient_id.eq.${houseId}),and(sender_id.eq.${houseId},recipient_id.eq.${match.seeker_id})`
                        )
                        .order('created_at', { ascending: true });

                    if (messagesError) {
                        throw messagesError;
                    }

                    setMessages(messagesData);
                } catch (error) {
                    // console.error('Error fetching messages:', error.message);
                }
            };

            fetchMessages();
        }
    }, [match, user.id, houseId]);

    // Send a new message
    const sendMessage = async () => {
        if (message.trim().length > 0) {
            const sender_id = user.id === match.seeker_id ? user.id : houseId;
            const recipient_id = user.id === match.seeker_id ? houseId : match.seeker_id;
            const newMessage = {
                sender_id: sender_id,
                recipient_id: recipient_id,
                message: message,
                created_at: new Date(),
            };

            try {
                const { data: messageData, error: messageError } = await supabase
                    .from('messages')
                    .insert(newMessage)
                    .select();

                if (messageError) {
                    throw messageError;
                }

                // Update local state with the new message
                setMessages([...messages, ...messageData]);
                setMessage('');

                if (messages.length === 0) { // Check if this is the first message
                    if (!match.chatted) { // Check if chatted is false
                        const { error: updateMatchError } = await supabase
                            .from('matches')
                            .update({ chatted: true })
                            .eq('id', match.id);

                        if (updateMatchError) {
                            throw updateMatchError;
                        }

                        setMatch({ ...match, chatted: true }); // Update local match state

                        // Increment the 'chats' field of the house
                        const { data: houseData, error: houseError } = await supabase
                            .from('houses')
                            .select('chats')
                            .eq('id', houseId)
                            .single();

                        if (houseError) {
                            throw houseError;
                        }

                        const updatedChats = houseData.chats + 1;

                        const { error: updateHouseError } = await supabase
                            .from('houses')
                            .update({ chats: updatedChats })
                            .eq('id', houseId);

                        if (updateHouseError) {
                            throw updateHouseError;
                        }

                        // Update local house state
                        setHouse({ ...house, chats: updatedChats });
                    }
                }
            } catch (error) {
                // console.error('Error sending message:', error.message);
            }
        }
    };

    // Render date separator
    const renderDateSeparator = (date) => (
        <View style={styles.dateSeparatorContainer}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
            <View style={styles.dateSeparatorLine} />
        </View>
    );

    // Render messages
    const renderItem = ({ item, index }) => {
        const isSentByCurrentUser = seekerId === user.id ? item.sender_id === user.id : item.sender_id === houseId;
        const showDateSeparator =
            index === 0 || !isSameDay(parseISO(item.created_at), parseISO(messages[index - 1].created_at));

        return (
            <>
                {showDateSeparator && renderDateSeparator(item.created_at)}
                <Animated.View style={[styles.messageContainer, animatedStyle, isSentByCurrentUser ? styles.sentContainer : styles.receivedContainer]}>
                    <View style={[styles.messageBubble, isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage]}>
                        <Text style={styles.messageText}>{item.message}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                    </View>
                </Animated.View>
            </>
        );
    };

    if (!house) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => {
                    if (seekerId === user.id) {
                        navigation.navigate('ProfielInformation', { house: house });
                    } else {
                        navigation.navigate('ProfileFriend', { userId: seekerId });
                    }
                }}
            >
                <Image source={{ uri: seekerId === user.id ? house.images[0] : seekerPic }} style={styles.profileImage} />
            </TouchableOpacity>
            <Text style={styles.addressText}>{seekerId === user.id ? house.address : seekerName}</Text>
            <PanGestureHandler onGestureEvent={gestureHandler} onEnded={gestureEndHandler}>
                <Animated.View style={{ flex: 1 }}>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesListContent}
                    />
                </Animated.View>
            </PanGestureHandler>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
            >
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    style={styles.messageInput}
                    placeholder="Message..."
                    placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Image source={require('./assets/SendMessage.png')} style={styles.sendMessageIcon} />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 20,
        borderColor: '#70349E',
        borderWidth: 3,
    },
    addressText: {
        color: 'white',
        fontSize: 20,
        marginTop: 10,
    },
    messagesList: {
        width: 400,
        flex: 1,
    },
    messagesListContent: {
        padding: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    sentContainer: {
        justifyContent: 'flex-end', // Align sent messages to the right
    },
    receivedContainer: {
        justifyContent: 'flex-start', // Align received messages to the left
    },
    messageBubble: {
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    sentMessage: {
        backgroundColor: 'lightgray',
    },
    receivedMessage: {
        backgroundColor: '#70349E',
    },
    messageText: {
        color: '#000',
    },
    keyboardView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#141414',
        top: 10,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 25,
        padding: 10,
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    sendButton: {
        backgroundColor: '#70349E',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginLeft: 10,
    },
    sendMessageIcon: {
        width: 20,
        height: 20,
        color: '#141414',
        fontWeight: 'bold',
    },
    timeContainer: {
        position: 'absolute',
        right: -80,
        width: 60,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderRadius: 5,
    },
    timeText: {
        color: 'white',
        fontSize: 12,
    },
    dateSeparatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    dateSeparatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'white',
        marginHorizontal: 10,
    },
    dateSeparatorText: {
        color: 'white',
        fontSize: 12,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        color: 'white',
        fontSize: 24,
        marginBottom: 20,
    },
    closeButton: {
        color: '#70349E',
        fontSize: 18,
    },
});

export default ChatScreen;
