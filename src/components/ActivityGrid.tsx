import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Activity } from '../types/models';

type Props = {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
};

export function ActivityGrid({ activities, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {activities.map((activity) => (
        <Pressable
          key={activity.id}
          accessibilityRole="button"
          accessibilityLabel={`ثبت ${activity.name}`}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          onPress={() => onSelect(activity)}
        >
          <Text style={styles.icon}>{activity.icon}</Text>
          <Text numberOfLines={2} style={styles.label}>{activity.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '30.5%',
    minHeight: 94,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: 30,
    marginBottom: 7,
  },
  label: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
    color: '#16181C',
  },
});
