import { StatusBar } from 'expo-status-bar';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const images = {
  man: 'https://images.pexels.com/photos/3147528/pexels-photo-3147528.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  women:
    'https://images.pexels.com/photos/2552130/pexels-photo-2552130.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  kids: 'https://images.pexels.com/photos/5080167/pexels-photo-5080167.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  skullcandy:
    'https://images.pexels.com/photos/5602879/pexels-photo-5602879.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  help: 'https://images.pexels.com/photos/2552130/pexels-photo-2552130.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
};

type ImageData = {
  key: string;
  title: string;
  image: string;
  ref: React.RefObject<View>;
};

const data: ImageData[] = Object.keys(images).map((i) => ({
  key: i,
  title: i,
  image: images[i as keyof typeof images],
  ref: createRef(),
}));

const { width, height } = Dimensions.get('screen');

interface TabProps {
  item: ImageData;
  onPress: () => void;
}

const Tab = React.forwardRef<View, TabProps>(({ item, onPress }, ref) => (
  <TouchableOpacity onPress={onPress}>
    <View ref={ref}>
      <Text
        style={{
          color: 'white',
          fontSize: 84 / data.length,
          fontWeight: '800',
          textTransform: 'uppercase',
        }}>
        {item.title}
      </Text>
    </View>
  </TouchableOpacity>
));

interface IndicatorProps {
  measures: Measure[];
  scrollX: SharedValue<number>;
}

const Indicator = ({ measures, scrollX }: IndicatorProps) => {
  const inputRange = data.map((_, i) => width * i);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      height: 4,
      width: interpolate(
        scrollX.value,
        inputRange,
        measures.map((measure) => measure.width)
      ),
      left: 0,
      backgroundColor: 'white',
      bottom: -10,
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            inputRange,
            measures.map((measure) => measure.x)
          ),
        },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
};

type Measure = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TabsProps = {
  data: ImageData[];
  scrollX: SharedValue<number>;
  onItemPress: (index: number) => void;
};

const Tabs = ({ data, scrollX, onItemPress }: TabsProps) => {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const containerRef = useRef<any>();

  useEffect(() => {
    const m: Measure[] = [];
    data.forEach((item) => {
      item.ref.current?.measureLayout(containerRef.current, (x, y, width, height) => {
        m.push({ x, y, width, height });

        if (m.length === data.length) {
          setMeasures(m);
        }
      });
    });
  }, [containerRef]);

  return (
    <View style={{ position: 'absolute', top: 50, width }}>
      <View
        ref={containerRef}
        style={{
          justifyContent: 'space-evenly',
          flex: 1,
          flexDirection: 'row',
        }}>
        {data.map((item, index) => {
          return (
            <Tab key={item.key} ref={item.ref} {...{ item }} onPress={() => onItemPress(index)} />
          );
        })}
        {measures.length > 0 ? <Indicator {...{ measures, scrollX }} /> : null}
      </View>
    </View>
  );
};

export default function AnimatedIndicator() {
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const ref = useRef<FlatList>(null);
  const onItemPress = (index: number) => {
    ref.current?.scrollToOffset({
      offset: index * width,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Animated.FlatList
        ref={ref}
        data={data}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={scrollHandler}
        bounces={false}
        renderItem={({ item }) => {
          return (
            <View style={{ width, height }}>
              <Image source={{ uri: item.image }} style={{ flex: 1, resizeMode: 'cover' }} />
              <View
                style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              />
            </View>
          );
        }}
      />

      <Tabs {...{ data, scrollX, onItemPress }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
