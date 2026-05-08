import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [perche, setPerche] = useState('');
  const [moodSelezionato, setMoodSelezionato] = useState('');
  const [giorniReali, setGiorniReali] = useState(0);
  const animaFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    controllaOnboarding();
    richiediPermessi();
  }, []);

  useEffect(() => {
    Animated.timing(animaFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [giorniReali]);

  const richiediPermessi = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        programmaNotificaSera();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const programmaNotificaSera = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ancora Qui 🌙',
          body: 'Come stai stasera? Sei ancora qui — e questo conta tutto.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const testNotifica = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ancora Qui 🌙',
          body: 'Come stai stasera? Sei ancora qui — e questo conta tutto.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const controllaOnboarding = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      if (!dataInizio) {
        router.replace('/(tabs)/onboarding' as any);
        return;
      }
      const percheStr = await AsyncStorageLib.getItem('perche');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      const inizio = new Date(dataInizio);
      const oggi = new Date();
      const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
      setGiorni(diff);
      setGiorniReali(diff);
      setPerche(percheStr || '');
      const spesaNum = spesa ? parseFloat(spesa) : 30;
      setRisparmi(diff * spesaNum);
    } catch (e) {
      console.log(e);
    }
  };

  const moods = [
    { emoji: '😴', label: 'Stanco' },
    { emoji: '😔', label: 'Solo' },
    { emoji: '😤', label: 'Nervoso' },
    { emoji: '💪', label: 'Ok' },
  ];

  return (
    <Animated.ScrollView style={[styles.container, { opacity: animaFade }]}>

      <View style={styles.topbar}>
        <Text style={styles.logo}>Ancora Qui</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      </View>

      <View style={styles.onlinePill}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>23 persone qui stanotte</Text>
      </View>

      <View style={styles.perche}>
        <Text style={styles.percheIcon}>⭐</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.percheLbl}>IL TUO PERCHÉ</Text>
          <Text style={styles.percheVal}>"{perche}"</Text>
        </View>
      </View>

      <View style={styles.streak}>
        <View style={styles.streakTop}>
          <Text style={styles.streakLbl}>GIORNI LIBERO</Text>
        </View>
        <Text style={styles.streakN}>{giorni}</Text>
        <Text style={styles.streakU}>giorni consecutivi</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.moneyRow}>
          <Text style={styles.cardLbl}>RISPARMIATI</Text>
          <Text style={styles.moneyVal}>€{risparmi.toFixed(0)}</Text>
        </View>
        <Text style={styles.moneyItem}>🍕  = {Math.floor(risparmi / 235)} mesi di spesa alimentare</Text>
        <Text style={styles.moneyItem}>👶  = {risparmi >= 500 ? 'primo corredino raggiunto ✓' : `mancano €${(500 - risparmi).toFixed(0)} al corredino`}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLbl}>COME STAI STASERA?</Text>
        <View style={styles.pills}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              style={[styles.pill, moodSelezionato === mood.label && styles.pillOn]}
              onPress={() => setMoodSelezionato(mood.label)}
            >
              <Text style={moodSelezionato === mood.label ? styles.pillOnText : styles.pillText}>
                {mood.emoji} {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.reset}
        onPress={async () => {
          await AsyncStorageLib.clear();
          router.replace('/(tabs)/onboarding' as any);
        }}
      >
        <Text style={styles.resetText}>🔄 Reset per test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.reset} onPress={testNotifica}>
        <Text style={styles.resetText}>🔔 Test notifica</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sos} onPress={() => router.push('/(tabs)/sos' as any)}>
        <Text style={styles.sosText}>🚨  Ho bisogno di aiuto ora</Text>
      </TouchableOpacity>

    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  logo: { fontSize: 18, color: '#c9965a', fontStyle: 'italic' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#c9965a', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#1a0f00' },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, backgroundColor: 'rgba(93,143,168,0.06)', borderWidth: 1, borderColor: 'rgba(93,143,168,0.15)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5d8fa8' },
  onlineText: { fontSize: 11, color: '#5d8fa8' },
  perche: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 20, marginBottom: 0, backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.14)', borderRadius: 18, padding: 13 },
  percheIcon: { fontSize: 18 },
  percheLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 1.5, marginBottom: 3 },
  percheVal: { fontStyle: 'italic', fontSize: 13, color: '#ddd8cf' },
  streak: { margin: 20, marginBottom: 0, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 18 },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  streakLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 1.5 },
  streakN: { fontSize: 60, fontWeight: '700', color: '#6aaa82', lineHeight: 64 },
  streakU: { fontSize: 12, color: '#5a5f72', marginBottom: 4 },
  card: { margin: 20, marginBottom: 0, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  cardLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 1.5, marginBottom: 8 },
  moneyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  moneyVal: { fontSize: 22, color: '#c9965a', fontWeight: '700' },
  moneyItem: { fontSize: 11, color: '#a8a29a', marginBottom: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: '#1e2336' },
  pillOn: { borderColor: 'rgba(201,150,90,0.35)', backgroundColor: 'rgba(201,150,90,0.07)' },
  pillText: { fontSize: 11, color: '#5a5f72' },
  pillOnText: { fontSize: 11, color: '#c9965a' },
  reset: { marginHorizontal: 20, marginTop: 14, padding: 10, alignItems: 'center' },
  resetText: { fontSize: 11, color: '#5a5f72' },
  sos: { margin: 20, backgroundColor: '#6e2020', borderRadius: 16, padding: 16, alignItems: 'center' },
  sosText: { color: 'white', fontSize: 14, fontWeight: '600' },
});