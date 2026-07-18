// client-user/src/shared/components/common/RangeSlider.jsx
// Slider simple en JS puro (View + PanResponder), sin módulo nativo — evita
// depender de paquetes como @react-native-community/slider que pueden no
// venir incluidos en Expo Go y causar errores nativos al cargar el bundle.

import { useMemo, useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const RangeSlider = ({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  trackColor = '#00000022',
  fillColor = '#ef4444',
  thumbColor = '#ef4444',
  style,
}) => {
  const trackWidthRef = useRef(0);

  const range = maximumValue - minimumValue;

  const valueToRatio = (v) => (range === 0 ? 0 : (v - minimumValue) / range);
  const ratioToValue = (ratio) => {
    const raw = minimumValue + ratio * range;
    const stepped = Math.round(raw / step) * step;
    return clamp(stepped, minimumValue, maximumValue);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt) => {
          const width = trackWidthRef.current;
          if (!width) return;
          const x = clamp(evt.nativeEvent.locationX, 0, width);
          onValueChange?.(ratioToValue(x / width));
        },
        onPanResponderGrant: (evt) => {
          const width = trackWidthRef.current;
          if (!width) return;
          const x = clamp(evt.nativeEvent.locationX, 0, width);
          onValueChange?.(ratioToValue(x / width));
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minimumValue, maximumValue, step]
  );

  const ratio = clamp(valueToRatio(value), 0, 1);

  return (
    <View
      style={[styles.track, style]}
      onLayout={(e) => {
        trackWidthRef.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.trackBg, { backgroundColor: trackColor }]} />
      <View style={[styles.trackFill, { width: `${ratio * 100}%`, backgroundColor: fillColor }]} />
      <View style={[styles.thumb, { left: `${ratio * 100}%`, backgroundColor: thumbColor }]} />
    </View>
  );
};

export default RangeSlider;

const styles = StyleSheet.create({
  track: { height: 36, justifyContent: 'center' },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
