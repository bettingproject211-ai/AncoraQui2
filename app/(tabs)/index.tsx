import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const BADGES = [
  { giorni: 1, emoji: '🌱', titolo: 'Primo giorno', desc: 'Hai iniziato. È tutto.' },
  { giorni: 3, emoji: '🔥', titolo: 'Tre giorni', desc: 'Il più difficile è passato.' },
  { giorni: 7, emoji: '⭐', titolo: 'Una settimana', desc: 'Sette giorni di forza vera.' },
  { giorni: 14, emoji: '🌙', titolo: 'Due settimane', desc: 'Stai costruendo qualcosa di reale.' },
  { giorni: 30, emoji: '🏆', titolo: 'Un mese', desc: 'Un mese intero. Sei incredibile.' },
  { giorni: 60, emoji: '💎', titolo: 'Due mesi', desc: 'Hai cambiato la tua vita.' },
  { giorni: 100, emoji: '🚀', titolo: '100 giorni', desc: 'Cento giorni. Nessuno te li toglie.' },
];

const NOTIFICHE: Record<string, string> = {
  'Stanco': 'Sei stanco — lo sappiamo. Non aprire quell\'altra app. Sei ancora qui.',
  'Solo': 'Stasera ti senti solo. Entra nelle Voci — ci sono persone che capiscono.',
  'Nervoso': 'Giornata pesante? Respira. Apri l\'app prima di fare altro.',
  'Ok': 'Stai bene stasera. Registra questo momento nel diario. 💪',
  'default': 'Come stai stasera? Sei ancora qui — e questo conta tutto.',
};

const DOMANDE = [
  'Come è andata oggi?',
  'C\'è qualcosa che ti ha dato fastidio oggi?',
  'Hai pensato al tuo perché oggi?',
  'Qual è stato il momento migliore di oggi?',
  'Come stai rispetto a ieri?',
  'C\'è qualcosa di cui sei orgoglioso oggi?',
  'Cosa ti ha aiutato a resistere oggi?',
];

export default function HomeScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [perche, setPerche] = useState('');
  const [nomeUtente, setNomeUtente] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [moodSelezionato, setMoodSelezionato] = useState('');
  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [checkinModal, setCheckinModal] = useState(false);
  const [checkinRisposta, setCheckinRisposta] = useState('');
  const [domandaOggi, setDomandaOggi] = useState('');
  const animaFade = useRef(new Animated.Value(0)).current;
  const animaBadge = useRef(new Animated.Value(0)).current;
  const animaSos = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    controllaOnboarding();
    richiediPermessi();
    caricaOnline();
    caricaMood();
    controllaCheckin();
  }, []);

  useEffect(() => {
    Animated.timing(animaFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [giorni]);

  const controllaCheckin = async () => {
    try {
      const oggi = new Date().toDateString();
      const ultimoCheckin = await AsyncStorageLib.getItem('ultimoCheckin');
      if (ultimoCheckin !== oggi) {
        const indice = new Date().getDay() % DOMANDE.length;
        setDomandaOggi(DOMANDE[indice]);
        setTimeout(() => setCheckinModal(true), 2000);
      }
    } catch (e) {}
  };

  const salvaCheckin = async () => {
    try {
      const oggi = new Date().toDateString();
      await AsyncStorageLib.setItem('ultimoCheckin', oggi);
      if (checkinRisposta.trim()) {
        const impulsiStr = await AsyncStorageLib.getItem('impulsi');
        const impulsi = impulsiStr ? JSON.parse(impulsiStr) : [];
        const nuovo = {
          id: Date.now(),
          trigger: 'Check-in',
          nota: checkinRisposta.trim(),
          resistito: true,
          ora: new Date().getHours(),
          oraLabel: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          data: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        };
        await AsyncStorageLib.setItem('impulsi', JSON.stringify([nuovo, ...impulsi]));
      }
      setCheckinModal(false);
      setCheckinRisposta('');
    } catch (e) {}
  };

  const caricaMood = async () => {
    try {
      const mood = await AsyncStorageLib.getItem('moodOggi');
      if (mood) setMoodSelezionato(mood);
    } catch (e) {}
  };

  const caricaOnline = async () => {
    try {
      const ieri = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('voci')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', ieri);
      setOnlineCount(count || 0);
    } catch (e) {}
  };

  const richiediPermessi = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') programmaNotificaSera();
    } catch (e) {}
  };

  const programmaNotificaSera = async (mood?: string) => {
    try {
      const moodSalvato = mood || await AsyncStorageLib.getItem('moodOggi') || 'default';
      const body = NOTIFICHE[moodSalvato] || NOTIFICHE['default'];
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Ancora Qui 🌙', body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
        },
      });
    } catch (e) {}
  };

  const selezionaMood = async (mood: string) => {
    setMoodSelezionato(mood);
    await AsyncStorageLib.setItem('moodOggi', mood);
    programmaNotificaSera(mood);
  };

  const controllaBadge = async (diff: number) => {
    const badge = BADGES.find(b => b.giorni === diff);
    if (badge) {
      const key = `badge_${badge.giorni}`;
      const già = await AsyncStorageLib.getItem(key);
      if (!già) {
        await AsyncStorageLib.setItem(key, 'true');
        setBadgeModal(badge);
        Animated.spring(animaBadge, { toValue: 1, useNativeDriver: true }).start();
      }
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
      const nomeStr = await AsyncStorageLib.getItem('nomeUtente');
      const inizio = new Date(dataInizio);
      const oggi = new Date();
      const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
      setGiorni(diff);
      setPerche(percheStr || '');
      setNomeUtente(nomeStr || '');
      const spesaNum = spesa ? parseFloat(spesa) : 30;
      setRisparmi(diff * spesaNum);
      controllaBadge(diff);
    } catch (e) {}
  };

  const premiSos = () => {
    Animated.sequence([
      Animated.timing(animaSos, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(animaSos, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => router.push('/(tabs)/sos' as any));
  };

  const badgeRaggunti = BADGES.filter(b => b.giorni <= giorni);
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
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profilo' as any)}>
          <Text style={styles.avatarText}>{nomeUtente ? nomeUtente[0].toUpperCase() : '?'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.onlinePill}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>{onlineCount} voci oggi</Text>
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
          <Text style={styles.streakNext}>
            {BADGES.find(b => b.giorni > giorni) ? `prossimo badge: ${BADGES.find(b => b.giorni > giorni)?.emoji} a ${BADGES.find(b => b.giorni > giorni)!.giorni - giorni} giorni` : '🏆 tutti i badge!'}
          </Text>
        </View>
        <Text style={styles.streakN}>{giorni}</Text>
        <Text style={styles.streakU}>giorni consecutivi</Text>
      </View>

      {badgeRaggunti.length > 0 && (
        <View style={styles.badgesRow}>
          <Text style={styles.badgesLbl}>I TUOI BADGE</Text>
          <View style={styles.badges}>
            {badgeRaggunti.map(b => (
              <View key={b.giorni} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeTitolo}>{b.titolo}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

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
              onPress={() => selezionaMood(mood.label)}
            >
              <Text style={moodSelezionato === mood.label ? styles.pillOnText : styles.pillText}>
                {mood.emoji} {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {moodSelezionato ? <Text style={styles.moodConfirm}>✓ Notifica di stasera aggiornata</Text> : null}
      </View>

      <View style={styles.linkGrid}>
        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(tabs)/diario' as any)}>
          <Text style={styles.linkEmoji}>📓</Text>
          <Text style={styles.linkText}>Diario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(tabs)/soldi' as any)}>
          <Text style={styles.linkEmoji}>💶</Text>
          <Text style={styles.linkText}>Soldi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(tabs)/ricaduta' as any)}>
          <Text style={styles.linkEmoji}>🤲</Text>
          <Text style={styles.linkText}>Ricaduta</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform: [{ scale: animaSos }] }}>
        <TouchableOpacity style={styles.sos} onPress={premiSos}>
          <Text style={styles.sosText}>🚨  Ho bisogno di aiuto ora</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* MODAL BADGE */}
      <Modal visible={!!badgeModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: animaBadge }] }]}>
            <Text style={styles.modalEmoji}>{badgeModal?.emoji}</Text>
            <Text style={styles.modalTitolo}>{badgeModal?.titolo}</Text>
            <Text style={styles.modalDesc}>{badgeModal?.desc}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setBadgeModal(null)}>
              <Text style={styles.modalBtnText}>Grazie 🙏</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* MODAL CHECK-IN */}
      <Modal visible={checkinModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.checkinCard}>
            <Text style={styles.checkinEmoji}>💬</Text>
            <Text style={styles.checkinDomanda}>{domandaOggi}</Text>
            <TextInput
              style={styles.checkinInput}
              placeholder="Scrivi qualcosa... oppure chiudi"
              placeholderTextColor="#5a5f72"
              value={checkinRisposta}
              onChangeText={setCheckinRisposta}
              multiline
              autoFocus
            />
            <View style={styles.checkinBtns}>
              <TouchableOpacity
                style={styles.checkinSkip}
                onPress={async () => {
                  await AsyncStorageLib.setItem('ultimoCheckin', new Date().toDateString());
                  setCheckinModal(false);
                }}
              >
                <Text style={styles.checkinSkipText}>Non ora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkinSave} onPress={salvaCheckin}>
                <Text style={styles.checkinSaveText}>Salva →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 4 },
  streakLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 1.5 },
  streakNext: { fontSize: 9, color: '#c9965a' },
  streakN: { fontSize: 60, fontWeight: '700', color: '#6aaa82', lineHeight: 64 },
  streakU: { fontSize: 12, color: '#5a5f72', marginBottom: 4 },
  badgesRow: { marginHorizontal: 20, marginBottom: 0, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  badgesLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 1.5, marginBottom: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { alignItems: 'center', backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.2)', borderRadius: 12, padding: 8, minWidth: 60 },
  badgeEmoji: { fontSize: 22, marginBottom: 4 },
  badgeTitolo: { fontSize: 9, color: '#c9965a', textAlign: 'center' },
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
  moodConfirm: { fontSize: 10, color: '#6aaa82', marginTop: 8 },
  linkGrid: { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, gap: 10 },
  linkCard: { flex: 1, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 14, alignItems: 'center', gap: 6 },
  linkEmoji: { fontSize: 22 },
  linkText: { fontSize: 11, color: '#5a5f72' },
  sos: { marginHorizontal: 20, marginTop: 14, backgroundColor: '#6e2020', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 40 },
  sosText: { color: 'white', fontSize: 14, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: 'rgba(201,150,90,0.3)', borderRadius: 24, padding: 32, alignItems: 'center', width: 280 },
  modalEmoji: { fontSize: 56, marginBottom: 16 },
  modalTitolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf', marginBottom: 8, textAlign: 'center' },
  modalDesc: { fontSize: 14, color: '#5a5f72', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtn: { backgroundColor: '#c9965a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  modalBtnText: { color: '#1a0f00', fontSize: 14, fontWeight: '700' },
  checkinCard: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: 'rgba(201,150,90,0.2)', borderRadius: 24, padding: 24, width: '100%' },
  checkinEmoji: { fontSize: 36, textAlign: 'center', marginBottom: 12 },
  checkinDomanda: { fontSize: 18, fontWeight: '700', color: '#ddd8cf', textAlign: 'center', lineHeight: 26, marginBottom: 16 },
  checkinInput: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 12, padding: 14, color: '#ddd8cf', fontSize: 14, minHeight: 80, marginBottom: 16 },
  checkinBtns: { flexDirection: 'row', gap: 10 },
  checkinSkip: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#111525', alignItems: 'center' },
  checkinSkipText: { fontSize: 14, color: '#5a5f72' },
  checkinSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#c9965a', alignItems: 'center' },
  checkinSaveText: { fontSize: 14, color: '#1a0f00', fontWeight: '700' },
});