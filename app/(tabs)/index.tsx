import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const BADGES = [
  { giorni: 1, emoji: '🌱', titolo: 'Primo giorno', desc: 'Hai iniziato. È tutto.' },
  { giorni: 3, emoji: '🔥', titolo: 'Tre giorni', desc: 'Il più difficile è passato.' },
  { giorni: 7, emoji: '⭐', titolo: 'Una settimana', desc: 'Sette giorni di forza vera.' },
  { giorni: 14, emoji: '🌙', titolo: 'Due settimane', desc: 'Stai costruendo qualcosa di reale.' },
  { giorni: 21, emoji: '💫', titolo: 'Tre settimane', desc: '21 giorni. Le abitudini cambiano.' },
  { giorni: 30, emoji: '🏆', titolo: 'Un mese', desc: 'Un mese intero. Sei incredibile.' },
  { giorni: 60, emoji: '💎', titolo: 'Due mesi', desc: 'Hai cambiato la tua vita.' },
  { giorni: 100, emoji: '🚀', titolo: '100 giorni', desc: 'Cento giorni. Nessuno te li toglie.' },
];

const FRASI_GIORNI: Record<number, string> = {
  0: 'Sei qui. È già qualcosa.',
  1: 'Un giorno. Il tuo cervello inizia già a cambiare.',
  2: 'Due giorni. Stai dimostrando qualcosa a te stesso.',
  3: 'Tre giorni. I più difficili. Li hai superati.',
  4: 'Quattro giorni. La strada si vede.',
  5: 'Cinque giorni. Sei più forte di quello che pensi.',
  6: 'Sei giorni. Domani è una settimana.',
  7: 'Una settimana. Sai quanti non arrivano qui? Tu sì.',
  14: 'Due settimane. Le abitudini iniziano a cambiare.',
  21: '21 giorni. La scienza dice che basta. Ci sei.',
  30: 'Un mese. Non è poco. È tantissimo.',
  60: 'Due mesi. Hai cambiato qualcosa di profondo.',
  100: 'Cento giorni. Nessuno te li toglie. Mai.',
};

const FRASI_DOPO_RICADUTA: Record<string, string> = {
  alta: 'Hai già fatto tantissimo. Quella forza è ancora tua.',
  media: 'Sai già come si fa. Ricominci con qualcosa in più.',
  bassa: 'Ci vuole coraggio a ricominciare. Sei ancora qui.',
  zero: 'Sei qui. È già qualcosa.',
};

const getFraseGiorni = (giorni: number, ultimaRicaduta: number | null): string => {
  if (giorni === 0 && ultimaRicaduta !== null) {
    if (ultimaRicaduta >= 30) return FRASI_DOPO_RICADUTA.alta;
    if (ultimaRicaduta >= 7) return FRASI_DOPO_RICADUTA.media;
    if (ultimaRicaduta >= 1) return FRASI_DOPO_RICADUTA.bassa;
    return FRASI_DOPO_RICADUTA.zero;
  }
  if (FRASI_GIORNI[giorni]) return FRASI_GIORNI[giorni];
  if (giorni > 100) return `${giorni} giorni. Sei un esempio per tutti.`;
  if (giorni > 60) return `${giorni} giorni. Stai costruendo una vita nuova.`;
  if (giorni > 30) return `${giorni} giorni. Un mese e più. Continua.`;
  if (giorni > 21) return `${giorni} giorni. Sei nel periodo più importante.`;
  if (giorni > 14) return `${giorni} giorni. Ogni giorno conta.`;
  if (giorni > 7) return `${giorni} giorni. Stai resistendo davvero.`;
  return `${giorni} giorni. Sei ancora qui.`;
};

const getProssimoBadge = (giorni: number) => BADGES.find(b => b.giorni > giorni) || null;

const getProgressoPerc = (giorni: number): number => {
  const prossimo = getProssimoBadge(giorni);
  if (!prossimo) return 1;
  const precedente = [...BADGES].reverse().find(b => b.giorni <= giorni);
  const base = precedente ? precedente.giorni : 0;
  return Math.min((giorni - base) / (prossimo.giorni - base), 1);
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
  const [displayGiorni, setDisplayGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [spesaGiornaliera, setSpesaGiornaliera] = useState(30);
  const [perche, setPerche] = useState('');
  const [nomeUtente, setNomeUtente] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [moodSelezionato, setMoodSelezionato] = useState('');
  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [checkinModal, setCheckinModal] = useState(false);
  const [checkinRisposta, setCheckinRisposta] = useState('');
  const [domandaOggi, setDomandaOggi] = useState('');
  const [settimana, setSettimana] = useState<boolean[]>(Array(7).fill(false));
  const [oggiResistito, setOggiResistito] = useState(false);
  const [ultimaRicaduta, setUltimaRicaduta] = useState<number | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const animaBadge = useRef(new Animated.Value(0)).current;
  const animaSos = useRef(new Animated.Value(1)).current;
  const animaSosPulse = useRef(new Animated.Value(1)).current;
  const animaProgresso = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    setLoaded(false);
    animaProgresso.setValue(0);
    caricaDati();
    caricaOnline();
    caricaMood();
  }, []));

  useEffect(() => { avviaPulseSos(); }, []);

  useEffect(() => {
    if (giorni >= 0 && loaded) {
      let current = 0;
      const target = giorni;
      const steps = 40;
      const stepTime = 1200 / steps;
      const stepVal = Math.max(target / steps, 0.1);
      const timer = setInterval(() => {
        current = Math.min(current + stepVal, target);
        setDisplayGiorni(Math.round(current));
        if (current >= target) clearInterval(timer);
      }, stepTime);

      const perc = getProgressoPerc(giorni);
      setProgresso(perc);

      setTimeout(() => {
        Animated.timing(animaProgresso, { toValue: perc, duration: 1600, useNativeDriver: false }).start();
      }, 300);

      if (giorni >= 1) controllaCheckin();
      return () => clearInterval(timer);
    }
  }, [giorni, loaded]);

  const avviaPulseSos = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animaSosPulse, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(animaSosPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();
  };

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      if (!dataInizio) { router.replace('/(tabs)/onboarding' as any); return; }
      const percheStr = await AsyncStorageLib.getItem('perche');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      const nomeStr = await AsyncStorageLib.getItem('nomeUtente');
      const ultimoCheckin = await AsyncStorageLib.getItem('ultimoCheckin');
      const ricadutaStr = await AsyncStorageLib.getItem('ultimaRicadutaGiorni');
      const inizio = new Date(dataInizio);
      const oggi = new Date();
      const diff = Math.floor((oggi.getTime() - inizio.getTime()) / (1000 * 60 * 60 * 24));
      const spesaNum = spesa ? parseFloat(spesa) : 30;
      setGiorni(diff);
      setPerche(percheStr || '');
      setNomeUtente(nomeStr || '');
      setSpesaGiornaliera(spesaNum);
      setOggiResistito(ultimoCheckin === oggi.toDateString());
      setRisparmi(diff * spesaNum);
      if (diff === 0 && ricadutaStr) {
        setUltimaRicaduta(parseInt(ricadutaStr));
      } else {
        setUltimaRicaduta(null);
        if (diff > 0) await AsyncStorageLib.removeItem('ultimaRicadutaGiorni');
      }
      controllaBadge(diff);
      const giornoOggi = oggi.getDay() === 0 ? 6 : oggi.getDay() - 1;
      const nuovaSettimana = Array(7).fill(false).map((_, i) => {
        const giorniDaOggi = giornoOggi - i;
        return giorniDaOggi >= 0 && giorniDaOggi < diff;
      });
      setSettimana(nuovaSettimana.reverse());
      setLoaded(true);
    } catch (e) { setLoaded(true); }
  };

  const controllaCheckin = async () => {
    try {
      const oggi = new Date().toDateString();
      const ultimoCheckin = await AsyncStorageLib.getItem('ultimoCheckin');
      if (ultimoCheckin !== oggi) {
        const indice = new Date().getDay() % DOMANDE.length;
        setDomandaOggi(DOMANDE[indice]);
        setTimeout(() => setCheckinModal(true), 4000);
      }
    } catch (e) {}
  };

  const salvaCheckin = async () => {
    try {
      await AsyncStorageLib.setItem('ultimoCheckin', new Date().toDateString());
      setOggiResistito(true);
      if (checkinRisposta.trim()) {
        const impulsiStr = await AsyncStorageLib.getItem('impulsi');
        const impulsi = impulsiStr ? JSON.parse(impulsiStr) : [];
        const nuovo = {
          id: Date.now(), trigger: 'Check-in', nota: checkinRisposta.trim(), resistito: true,
          ora: new Date().getHours(),
          oraLabel: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          data: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        };
        await AsyncStorageLib.setItem('impulsi', JSON.stringify([nuovo, ...impulsi]));
      }
      setCheckinModal(false);
      setCheckinRisposta('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      const { count } = await supabase.from('voci').select('*', { count: 'exact', head: true }).gte('created_at', ieri);
      setOnlineCount(count || 0);
    } catch (e) {}
  };

  const selezionaMood = async (mood: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoodSelezionato(mood);
    await AsyncStorageLib.setItem('moodOggi', mood);
  };

  const controllaBadge = async (diff: number) => {
    const badge = BADGES.find(b => b.giorni === diff);
    if (badge) {
      const key = `badge_${badge.giorni}`;
      const già = await AsyncStorageLib.getItem(key);
      if (!già) {
        await AsyncStorageLib.setItem(key, 'true');
        setBadgeModal(badge);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.spring(animaBadge, { toValue: 1, useNativeDriver: true }).start();
      }
    }
  };

  const condividiMilestone = async () => {
    if (!badgeModal) return;
    try {
      await Share.share({ message: `${badgeModal.emoji} Ho raggiunto "${badgeModal.titolo}" con Ancora Qui.\n\n${badgeModal.desc}\n\nAnche tu puoi farcela. Sei ancora qui. 🤝` });
    } catch (e) {}
  };

  const premiSos = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(animaSos, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(animaSos, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => router.push('/(tabs)/sos' as any));
  };

  const prossimoBadge = getProssimoBadge(giorni);
  const giorniSettimana = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  const moods = [
    { emoji: '😴', label: 'Stanco' },
    { emoji: '😔', label: 'Solo' },
    { emoji: '😤', label: 'Nervoso' },
    { emoji: '💪', label: 'Ok' },
  ];

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: '#07090f' }} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.logoSub}>benvenuto</Text>
          <Text style={styles.logo}>Ancora Qui</Text>
        </View>
        <View style={styles.headerRight}>
          {onlineCount > 0 && (
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{onlineCount} oggi</Text>
            </View>
          )}
          <TouchableOpacity style={styles.avatar} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/profilo' as any); }}>
            <Text style={styles.avatarText}>{nomeUtente ? nomeUtente[0].toUpperCase() : '👤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.ringNum}>{displayGiorni}</Text>
            <Text style={styles.ringLbl}>giorni</Text>
          </View>
          <View style={styles.ringDecorativo}>
            {Array(12).fill(0).map((_, i) => {
              const angolo = (i / 12) * 360;
              const attivo = i < Math.round(progresso * 12);
              return (
                <View
                  key={i}
                  style={[
                    styles.ringSegmento,
                    {
                      transform: [{ rotate: `${angolo}deg` }, { translateY: -72 }],
                      backgroundColor: attivo ? '#10b981' : '#1f2937',
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>

        <Text style={styles.fraseMotivazione}>{getFraseGiorni(giorni, ultimaRicaduta)}</Text>

        {prossimoBadge && (
          <View style={styles.progressoWrapper}>
            <View style={styles.progressoBar}>
              <Animated.View style={[styles.progressoFill, {
                width: animaProgresso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
              }]} />
            </View>
            <Text style={styles.progressoLabel}>
              {prossimoBadge.emoji} {prossimoBadge.giorni - giorni} giorni al badge "{prossimoBadge.titolo}"
            </Text>
          </View>
        )}

        <View style={styles.weekRow}>
          {giorniSettimana.map((g, i) => (
            <View key={i} style={styles.weekDay}>
              <View style={[
                styles.weekDot,
                settimana[i] && styles.weekDotOn,
                i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) && !settimana[i] && styles.weekDotOggi,
              ]} />
              <Text style={styles.weekLbl}>{g}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.percheRow}>
          <Text style={styles.percheIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLbl}>IL TUO PERCHÉ</Text>
            <Text style={styles.percheVal}>"{perche}"</Text>
          </View>
        </View>
        {giorni >= 2 && (
          <>
            <View style={styles.separatore} />
            <View style={styles.oggiRow}>
              <View style={[styles.oggiDot, oggiResistito && styles.oggiDotOn]} />
              <Text style={styles.oggiText}>
                {oggiResistito ? 'Oggi hai resistito ✓' : 'Oggi non ancora registrato'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLbl}>COME STAI OGGI?</Text>
        <View style={styles.pills}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              style={[styles.pill, moodSelezionato === mood.label && styles.pillOn]}
              onPress={() => selezionaMood(mood.label)}
            >
              <Text style={styles.pillEmoji}>{mood.emoji}</Text>
              <Text style={[styles.pillText, moodSelezionato === mood.label && styles.pillTextOn]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {moodSelezionato ? <Text style={styles.moodConfirm}>✓ Notifica di stasera personalizzata</Text> : null}
      </View>

      <View style={styles.card}>
        {giorni < 3 ? (
          <>
            <Text style={styles.cardLbl}>COSA PUOI RISPARMIARE</Text>
            <View style={styles.proiezioneRow}>
              <View style={styles.proiezioneItem}>
                <Text style={styles.proiezioneNum}>€{(spesaGiornaliera * 7).toFixed(0)}</Text>
                <Text style={styles.proiezioneLbl}>7 giorni</Text>
              </View>
              <View style={styles.proiezioneDivider} />
              <View style={styles.proiezioneItem}>
                <Text style={styles.proiezioneNum}>€{(spesaGiornaliera * 30).toFixed(0)}</Text>
                <Text style={styles.proiezioneLbl}>30 giorni</Text>
              </View>
              <View style={styles.proiezioneDivider} />
              <View style={styles.proiezioneItem}>
                <Text style={styles.proiezioneNum}>€{(spesaGiornaliera * 100).toFixed(0)}</Text>
                <Text style={styles.proiezioneLbl}>100 giorni</Text>
              </View>
            </View>
            <Text style={styles.proiezioneSub}>Ogni giorno che passa, questi numeri diventano reali. 🌱</Text>
          </>
        ) : (
          <>
            <View style={styles.moneyRow}>
              <Text style={styles.cardLbl}>HAI GIÀ RISPARMIATO</Text>
              <Text style={styles.moneyVal}>€{risparmi.toFixed(0)}</Text>
            </View>
            {risparmi >= 10 && <Text style={styles.moneyItem}>🍕  {Math.floor(risparmi / 10)} pizze</Text>}
            {risparmi >= 235 && <Text style={styles.moneyItem}>🛒  {Math.floor(risparmi / 235)} mesi di spesa</Text>}
            {risparmi >= 500 && <Text style={styles.moneyItem}>👶  primo corredino raggiunto ✓</Text>}
          </>
        )}
      </View>

      <View style={styles.linkGrid}>
        <TouchableOpacity style={styles.linkCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/diario' as any); }}>
          <Text style={styles.linkEmoji}>📓</Text>
          <Text style={styles.linkText}>Diario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/soldi' as any); }}>
          <Text style={styles.linkEmoji}>💶</Text>
          <Text style={styles.linkText}>Soldi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/ricaduta' as any); }}>
          <Text style={styles.linkEmoji}>🤲</Text>
          <Text style={styles.linkText}>Ricaduta</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[{ marginHorizontal: 20, marginBottom: 50 }, { transform: [{ scale: animaSos }] }]}>
        <Animated.View style={{ transform: [{ scale: animaSosPulse }] }}>
          <TouchableOpacity style={styles.sos} onPress={premiSos}>
            <View style={styles.sosDot} />
            <Text style={styles.sosText}>Ho bisogno di aiuto ora</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Modal visible={!!badgeModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: animaBadge }] }]}>
            <Text style={styles.modalEmoji}>{badgeModal?.emoji}</Text>
            <Text style={styles.modalTitolo}>{badgeModal?.titolo}</Text>
            <Text style={styles.modalDesc}>{badgeModal?.desc}</Text>
            <TouchableOpacity style={styles.modalBtnCondividi} onPress={condividiMilestone}>
              <Text style={styles.modalBtnCondividiText}>📤  Condividi questo momento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setBadgeModal(null)}>
              <Text style={styles.modalBtnText}>Grazie 🙏</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={checkinModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.checkinCard}>
            <Text style={styles.checkinEmoji}>💬</Text>
            <Text style={styles.checkinDomanda}>{domandaOggi}</Text>
            <TextInput
              style={styles.checkinInput}
              placeholder="Scrivi qualcosa... oppure chiudi"
              placeholderTextColor="#6b7280"
              value={checkinRisposta}
              onChangeText={setCheckinRisposta}
              multiline
            />
            <View style={styles.checkinBtns}>
              <TouchableOpacity style={styles.checkinSkip} onPress={async () => { await AsyncStorageLib.setItem('ultimoCheckin', new Date().toDateString()); setCheckinModal(false); }}>
                <Text style={styles.checkinSkipText}>Non ora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkinSave} onPress={salvaCheckin}>
                <Text style={styles.checkinSaveText}>Salva →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  logoSub: { fontSize: 10, color: '#6b7280', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 },
  logo: { fontSize: 26, color: '#d4a853', fontFamily: 'Lora_400Regular_Italic' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  onlineDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#3b82f6' },
  onlineText: { fontSize: 10, color: '#3b82f6', fontWeight: '600' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d4a853', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#07090f' },
  heroSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  ringOuter: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ringInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  ringNum: { fontSize: 58, fontWeight: '700', color: '#f9fafb', fontFamily: 'Lora_700Bold', lineHeight: 64 },
  ringLbl: { fontSize: 12, color: '#6b7280', letterSpacing: 1, textAlign: 'center' },
  ringDecorativo: { position: 'absolute', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  ringSegmento: { position: 'absolute', width: 6, height: 16, borderRadius: 3 },
  fraseMotivazione: { fontSize: 15, color: '#9ca3af', textAlign: 'center', lineHeight: 24, fontStyle: 'italic', marginBottom: 20, paddingHorizontal: 8 },
  progressoWrapper: { width: '100%', marginBottom: 20 },
  progressoBar: { height: 3, backgroundColor: '#1f2937', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressoFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 2 },
  progressoLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  weekDay: { alignItems: 'center', gap: 5, flex: 1 },
  weekDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  weekDotOn: { backgroundColor: '#10b981', borderColor: '#10b981' },
  weekDotOggi: { borderColor: '#d4a853', borderWidth: 2 },
  weekLbl: { fontSize: 9, color: '#6b7280' },
  card: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1f2937', borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 9, color: '#6b7280', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  percheRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  percheIcon: { fontSize: 16, marginTop: 2 },
  percheVal: { fontFamily: 'Lora_400Regular_Italic', fontSize: 14, color: '#f9fafb', lineHeight: 22, flex: 1 },
  separatore: { height: 1, backgroundColor: '#1f2937', marginVertical: 14 },
  oggiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  oggiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  oggiDotOn: { backgroundColor: '#10b981' },
  oggiText: { fontSize: 13, color: '#9ca3af' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#1f2937', backgroundColor: '#111827' },
  pillOn: { borderColor: 'rgba(212,168,83,0.4)', backgroundColor: 'rgba(212,168,83,0.08)' },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 12, color: '#6b7280' },
  pillTextOn: { color: '#d4a853' },
  moodConfirm: { fontSize: 10, color: '#10b981', marginTop: 10 },
  moneyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moneyVal: { fontSize: 24, color: '#d4a853', fontWeight: '700', fontFamily: 'Lora_700Bold' },
  moneyItem: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  proiezioneRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  proiezioneItem: { flex: 1, alignItems: 'center' },
  proiezioneNum: { fontSize: 20, fontWeight: '700', color: '#10b981', fontFamily: 'Lora_700Bold', marginBottom: 4 },
  proiezioneLbl: { fontSize: 10, color: '#6b7280' },
  proiezioneDivider: { width: 1, backgroundColor: '#1f2937' },
  proiezioneSub: { fontSize: 11, color: '#6b7280', textAlign: 'center', fontStyle: 'italic' },
  linkGrid: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 10 },
  linkCard: { flex: 1, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1f2937', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8 },
  linkEmoji: { fontSize: 24 },
  linkText: { fontSize: 11, color: '#6b7280' },
  sos: { backgroundColor: '#130808', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.35)', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  sosDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  sosText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1f2937', borderRadius: 28, padding: 32, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 60, marginBottom: 16 },
  modalTitolo: { fontSize: 24, fontWeight: '700', color: '#f9fafb', marginBottom: 8, textAlign: 'center', fontFamily: 'Lora_700Bold' },
  modalDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtnCondividi: { backgroundColor: 'rgba(212,168,83,0.08)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.25)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnCondividiText: { color: '#d4a853', fontSize: 14, fontWeight: '600' },
  modalBtn: { backgroundColor: '#d4a853', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  modalBtnText: { color: '#07090f', fontSize: 14, fontWeight: '700' },
  checkinCard: { backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1f2937', borderRadius: 28, padding: 24, width: '100%' },
  checkinEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  checkinDomanda: { fontSize: 18, fontWeight: '700', color: '#f9fafb', textAlign: 'center', lineHeight: 26, marginBottom: 16, fontFamily: 'Lora_700Bold' },
  checkinInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 14, padding: 14, color: '#f9fafb', fontSize: 14, minHeight: 80, marginBottom: 16 },
  checkinBtns: { flexDirection: 'row', gap: 10 },
  checkinSkip: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#111827', alignItems: 'center' },
  checkinSkipText: { fontSize: 14, color: '#6b7280' },
  checkinSave: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#d4a853', alignItems: 'center' },
  checkinSaveText: { fontSize: 14, color: '#07090f', fontWeight: '700' },
});