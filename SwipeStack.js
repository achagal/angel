import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Like from './assets/LIKE.png';
import Nope from './assets/nope.png';

const ROTATION = 60;
const SWIPE_VELOCITY = 800;

const SwipeStack = ({ data, renderItem, onSwipeRight, onSwipeLeft }) => {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const currentProfile = data[currentIndex % data.length];
  const nextProfile = data[nextIndex % data.length];

  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;

  const translateX = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-hiddenTranslateX, 0, hiddenTranslateX], [-ROTATION, 0, ROTATION]) + 'deg';
    return {
      transform: [
        { translateX: translateX.value },
        { rotate },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(translateX.value, [-hiddenTranslateX, 0, hiddenTranslateX], [1, 0.8, 1]),
    }],
    opacity: interpolate(translateX.value, [-hiddenTranslateX, 0, hiddenTranslateX], [1, 0.5, 1]),
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, hiddenTranslateX / 5], [0, 1]),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -hiddenTranslateX / 5], [0, 1]),
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: event => {
      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(
          hiddenTranslateX * Math.sign(event.velocityX),
          {},
          () => {
            const newIndex = currentIndex + 1;
            runOnJS(setCurrentIndex)(newIndex);
            runOnJS(setNextIndex)(newIndex + 1);
          }
        );
        const onSwipe = event.velocityX > 0 ? onSwipeRight : onSwipeLeft;
        runOnJS(onSwipe)(currentProfile);
      }
    },
  });

  useEffect(() => {
    translateX.value = 0; // Reset position to center for new card
  }, [currentIndex, translateX]);

  return (
    <View style={styles.root}>
      {nextProfile && (
        <View style={styles.nextCardContainer}>
          <Animated.View style={[styles.animatedCard, nextCardStyle]}>
            {renderItem({item: nextProfile})}
          </Animated.View>
        </View>
      )}
      {currentProfile && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.animatedCard, cardStyle]}>
            <Animated.Image
              source={Like}
              style={[styles.like, {left: 10}, likeStyle]}
              resizeMode="contain"
            />
            <Animated.Image
              source={Nope}
              style={[styles.like, {right: 10}, nopeStyle]}
              resizeMode="contain"
            />
            {renderItem({item: currentProfile})}
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: 400,
    top: 30
  },
  animatedCard: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextCardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  like: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: -60,
    zIndex: 1,
  },
});

export default SwipeStack;
