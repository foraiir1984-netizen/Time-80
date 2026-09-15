import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { createActivity, getActivities, setActivityArchived, updateActivity } from '../db/database';
import { Activity } from '../types/models';

const ICONS = [
  '📚','✏️','🧠','💻','💼','👨‍👩‍👦','❤️','🏃','🏋️','🚶','🧘','😴','☕','🍽️','🚗','🚌','🎮','🎬','🎵','📱','🌿','🛁','🧹','🛒','☎️','🩺','🎓','📝','🧑‍🤝‍🧑','🌙','☀️','💡','🎯','💰','📦','🛠️'
];

type Props = { onChanged: () => void };

export function ActivitiesScreen({ onChanged }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setActivities(await getActivities(true));
  }, []);

  useEffect(() => { load().catch(console.error); }, [load]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setIcon('✨');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (activity: Activity) => {
    setEditing(activity);
    setName(activity.name);
    setIcon(activity.icon);
    setError('');
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) {
      setError('نام فعالیت را وارد کن.');
      return;
    }
    if (editing) await updateActivity(editing.id, name, icon);
    else await createActivity(name, icon);
    setModalOpen(false);
    await load();
    onChanged();
  };

  const toggleArchive = (activity: Activity) => {
    const willArchive = !activity.is_archived;
    const action = async () => {
      await setActivityArchived(activity.id, willArchive);
      await load();
      onChanged();
    };

    if (!willArchive) {
      action().catch(console.error);
      return;
    }

    Alert.alert(
      'حذف از فهرست فعال؟',
      'فعالیت از انتخاب‌های روزانه حذف می‌شود، اما سابقه زمانی آن پاک نخواهد شد.',
      [
        { text: 'انصراف', style: 'cancel' },
        { text: 'حذف از فهرست', style: 'destructive', onPress: () => action().catch(console.error) },
      ],
    );
  };

  return (
    <>
      <ScreenShell title="فعالیت‌ها" subtitle="فعالیت‌ها را اضافه، ویرایش یا از فهرست فعال حذف کن. سابقه قبلی همیشه حفظ می‌شود.">
        <Pressable onPress={openNew} style={styles.addButton} accessibilityRole="button">
          <Text style={styles.addButtonText}>＋ افزودن فعالیت</Text>
        </Pressable>

        <View style={styles.list}>
          {activities.map((activity) => (
            <View key={activity.id} style={[styles.row, activity.is_archived ? styles.archivedRow : undefined]}>
              <Pressable onPress={() => toggleArchive(activity)} style={styles.archiveButton} accessibilityRole="button">
                <Text style={styles.archiveText}>{activity.is_archived ? 'بازگردانی' : 'حذف'}</Text>
              </Pressable>
              <Pressable onPress={() => openEdit(activity)} style={styles.mainRow} accessibilityRole="button">
                <Text style={styles.icon}>{activity.icon}</Text>
                <View style={styles.nameWrap}>
                  <Text style={styles.name}>{activity.name}</Text>
                  {activity.is_archived ? <Text style={styles.archivedLabel}>آرشیو شده</Text> : null}
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </ScreenShell>

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'ویرایش فعالیت' : 'فعالیت جدید'}</Text>
            <Text style={styles.fieldLabel}>نام فعالیت</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="مثلاً مطالعه"
              style={styles.input}
              textAlign="right"
              maxLength={40}
              autoFocus
            />

            <Text style={styles.fieldLabel}>آیکون</Text>
            <ScrollView style={styles.iconScroll} contentContainerStyle={styles.iconGrid}>
              {ICONS.map((candidate) => (
                <Pressable
                  key={candidate}
                  onPress={() => setIcon(candidate)}
                  style={[styles.iconChoice, candidate === icon && styles.iconChoiceSelected]}
                >
                  <Text style={styles.iconChoiceText}>{candidate}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalOpen(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>انصراف</Text>
              </Pressable>
              <Pressable onPress={() => save().catch(console.error)} style={styles.primaryButton}>
                <Text style={styles.primaryText}>ذخیره</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#171A20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  list: { gap: 8 },
  row: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4E9',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  archivedRow: { opacity: 0.55 },
  mainRow: { flex: 1, minHeight: 54, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  icon: { fontSize: 29 },
  nameWrap: { flex: 1 },
  name: { textAlign: 'right', color: '#16181C', fontSize: 15, fontWeight: '700' },
  archivedLabel: { textAlign: 'right', color: '#7C838D', fontSize: 12, marginTop: 3 },
  archiveButton: { minWidth: 65, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  archiveText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#F8F9FB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 34,
  },
  modalTitle: { textAlign: 'right', fontSize: 23, fontWeight: '900', color: '#14171B', marginBottom: 20 },
  fieldLabel: { textAlign: 'right', fontSize: 13, fontWeight: '700', color: '#4D5560', marginBottom: 7, marginTop: 6 },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: '#D7DBE1', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 16 },
  iconScroll: { maxHeight: 230 },
  iconGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 9, paddingVertical: 6 },
  iconChoice: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E3E7' },
  iconChoiceSelected: { borderColor: '#171A20', borderWidth: 2 },
  iconChoiceText: { fontSize: 25 },
  error: { color: '#B42318', textAlign: 'right', marginTop: 8 },
  modalActions: { marginTop: 18, flexDirection: 'row', gap: 10 },
  primaryButton: { flex: 1, minHeight: 50, borderRadius: 15, backgroundColor: '#171A20', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryButton: { flex: 1, minHeight: 50, borderRadius: 15, backgroundColor: '#E9ECF0', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#3C424A', fontWeight: '800' },
});
