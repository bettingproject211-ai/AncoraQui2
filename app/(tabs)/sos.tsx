import AsyncStorageLib from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

const FASI_RESPIRO = [
  { label: 'Inspira', durata: 4000, colore: '#10b981', scala: 1.3 },
  { label: 'Tieni', durata: 2000, colore: '#d4a853', scala: 1.3 },
  { label: 'Espira', durata: 6000, colore: '#3b82f6', scala: 1.0 },
];

export default function SosScreen() {
  const [perche, setPerche] = useState('');
  const [contattoNome, setContattoNome] = useState('');
  const [contattoNumero, setContattoNumero] = useState('');
  const [faseCorrente, setFaseCorrente] = useState(0);
  const [respiroAttivo, setRespiroAttivo] = useState(false);
  const [secondiTimer, setSecondiTimer] = useState(15 * 60);
  const [timerAttivo, setTimerAttivo] = useState(false);
  const [timerFinito, setTimerFinito] = useState(false);

  const animaScala = useRef(new Animated.Value(1)).current;
  const animaOpacity = useRef(new Animated.Value(0)).current;
  const animaTimer = useRef(new Animated.Value(0)).current;
  const animaPulse = useRef(new Animated.Value(1)).current;
  const intervalloRef = useRef<any>(null);
  const respiroRef = useRef<any>(null);

  useFocusEffect(useCallback(() => {
    caricaDati();
    animaOpacity.setValue(0);
    Animated.timing(animaOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    avviaPulse();
    return () => {
      if (intervalloRef.current) clearInterval(intervalloRef.current);
      if (respiroRef.current) respiroRef.current.stop();
    };
  }, []));

  const avviaPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animaPulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(animaPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();
  };

  const caricaDati = async () => {
    try {
      const p = await AsyncStorageLib.getItem('perche');
      const cn = await AsyncStorageLib.getItem('contattoNome');
      const cnum = await AsyncStorageLib.getItem('contattoNumero');
      setPerche(p || '');
      setContattoNome(cn || '');
      setContattoNumero(cnum || '');
    } catch (e) {}
  };

  // Timer 15 minuti
  const avviaTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerAttivo(true);
    setTimerFinito(false);
    setSecondiTimer(15 * 60);
    animaTimer.setValue(0);
    Animated.timing(animaTimer, {
      toValue: 1, duration: 15 * 60 * 1000, useNativeDriver: false, easing: Easing.linear,
    }).start();
    intervalloRef.current = setInterval(() => {
      setSecondiTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalloRef.current);
          setTimerAttivo(false);
          setTimerFinito(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    if (intervalloRef.current) clearInterval(intervalloRef.current);
    animaTimer.stopAnimation();
    setTimerAttivo(false);
    setTimerFinito(false);
    setSecondiTimer(15 * 60);
    animaTimer.setValue(0);
  };

  const formatTimer = (secondi: number) => {
    const m = Math.floor(secondi / 60);
    const s = secondi % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Respiro
  const avviaRespiro = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRespiroAttivo(true);
    animaFase(0);
  };

  const animaFase = (indice: number) => {
    const fase = FASI_RESPIRO[indice];
    Animated.timing(animaScala, {
      toValue: fase.scala, duration: fase.durata, useNativeDriver: true, easing: Easing.inOut(Easing.ease),
    }).start(({ finished }) => {
      if (finished) {
        const prossimo = (indice + 1) % FASI_RESPIRO.length;
        setFaseCorrente(prossimo);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animaFase(prossimo);
      }
    });
  };

  const fermaRespiro = () => {
    animaScala.stopAnimation();
    Animated.timing(animaScala, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setRespiroAttivo(false);
    setFaseCorrente(0);
  };

  const faseAttuale = FASI_RESPIRO[faseCorrente];
  const timerCirc = 2 * Math.PI * 54;
  const timerOffset = animaTimer.interpolate({
    inputRange: [0, 1], outputRange: [timerCirc, 0],
  });

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: animaOpacity }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>sei al sicuro</Text>
        <Text style={styles.headerTitolo}>Ancora Qui</Text>
      </View>

      {/* PERCHÉ — sempre visibile subito */}
      {perche ? (
        <View style={styles.percheCard}>
          <Text style={styles.percheLbl}>RICORDA PERCHÉ SEI QUI</Text>
          <Text style={styles.percheVal}>"{perche}"</Text>
          <Text style={styles.percheSub}>Questo è più forte di qualsiasi impulso.</Text>
        </View>
      ) : null}

      {/* TIMER 15 MINUTI */}
      <View style={styles.timerSection}>
        <Text style={styles.sectionLbl}>L'IMPULSO PASSA</Text>
        <Text style={styles.timerDesc}>
          Aspetta 15 minuti. La ricerca dimostra che{'\n'}l'impulso si riduce da solo. Aspetta e basta.
        </Text>

        <View style={styles.timerWrapper}>
          <Animated.View style={[styles.timerRing]}>
            <Text style={[
              styles.timerNum,
              timerFinito && { color: '#10b981' }
            ]}>
              {timerFinito ? '✓' : formatTimer(secondiTimer)}
            </Text>
            {!timerFinito && (
              <Text style={styles.timerLabel}>
                {timerAttivo ? 'aspetta...' : '15 minuti'}
              </Text>
            )}
            {timerFinito && (
              <Text style={styles.timerLabel}>ce l'hai fatta</Text>
            )}
          </Animated.View>
        </View>

        {!timerAttivo && !timerFinito ? (
          <TouchableOpacity style={styles.timerBtn} onPress={avviaTimer} activeOpacity={0.8}>
            <Text style={styles.timerBtnText}>Avvia il timer</Text>
          </TouchableOpacity>
        ) : timerAttivo ? (
          <TouchableOpacity style={styles.timerBtnSecondario} onPress={resetTimer} activeOpacity={0.8}>
            <Text style={styles.timerBtnSecondarioText}>Annulla</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerFintoCard}>
            <Text style={styles.timerFintoTesto}>
              Hai aspettato. L'impulso è passato.{'\n'}Sei ancora qui. 💙
            </Text>
            <TouchableOpacity onPress={resetTimer}>
              <Text style={styles.timerReset}>Ricomincia</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* RESPIRO */}
      <View style={styles.respiroSection}>
        <Text style={styles.sectionLbl}>ESERCIZIO DI RESPIRO</Text>
        <Text style={styles.respiroDesc}>
          4 secondi inspira · 2 tieni · 6 espira{'\n'}
          Attiva il sistema nervoso parasimpatico.
        </Text>

        <View style={styles.respiroWrapper}>
          <Animated.View style={[
            styles.respiroCerchio,
            {
              transform: [{ scale: animaScala }],
              backgroundColor: respiroAttivo ? faseAttuale.colore + '18' : 'rgba(255,255,255,0.03)',
              borderColor: respiroAttivo ? faseAttuale.colore + '50' : '#1a2030',
            }
          ]}>
            <Text style={[styles.respiroLabel, respiroAttivo && { color: faseAttuale.colore }]}>
              {respiroAttivo ? faseAttuale.label : '●'}
            </Text>
          </Animated.View>
        </View>

        {!respiroAttivo ? (
          <TouchableOpacity style={styles.respiroBtn} onPress={avviaRespiro} activeOpacity={0.8}>
            <Text style={styles.respiroBtnText}>Inizia a respirare</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.respiroBtnStop} onPress={fermaRespiro} activeOpacity={0.8}>
            <Text style={styles.respiroBtnStopText}>Ferma</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTATTI EMERGENZA */}
      <View style={styles.contattiSection}>
        <Text style={styles.sectionLbl}>CHIAMA QUALCUNO</Text>

        {contattoNumero ? (
          <TouchableOpacity
            style={styles.contattoCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); Linking.openURL(`tel:${contattoNumero}`); }}
            activeOpacity={0.8}
          >
            <View style={styles.contattoIcon}>
              <Text style={styles.contattoIconText}>💙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contattoNome}>{contattoNome || 'La tua persona di fiducia'}</Text>
              <Text style={styles.contattoNum}>{contattoNumero}</Text>
            </View>
            <Text style={styles.contattoChiama}>Chiama →</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.contattoCardVerde}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Linking.openURL('tel:800274274'); }}
          activeOpacity={0.8}
        >
          <View style={styles.contattoIcon}>
            <Text style={styles.contattoIconText}>📞</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contattoNome}>SerD — Numero Verde</Text>
            <Text style={styles.contattoNum}>800 274 274</Text>
          </View>
          <Text style={styles.contattoChiamaVerde}>Chiama →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contattoCardRosso}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); Linking.openURL('tel:112'); }}
          activeOpacity={0.8}
        >
          <View style={styles.contattoIcon}>
            <Text style={styles.contattoIconText}>🚨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contattoNome}>Emergenza</Text>
            <Text style={styles.contattoNum}>112</Text>
          </View>
          <Text style={styles.contattoChiamaRosso}>Chiama →</Text>
        </TouchableOpacity>
      </View>

      {/* MESSAGGIO FINALE */}
      <View style={styles.messaggioFinale}>
        <Text style={styles.messaggioTesto}>
          Non sei solo.{'\n'}
          Milioni di persone stanno attraversando{'\n'}
          la stessa cosa in questo momento.{'\n\n'}
          Sei ancora qui. È tutto quello che conta.
        </Text>
      </View>

    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080b12' },

  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  headerSub: { fontSize: 10, color: '#4b5563', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 },
  headerTitolo: { fontSize: 26, fontWeight: '700', color: '#d4a853', letterSpacing: 1 },

  percheCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(212,168,83,0.06)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.15)', borderRadius: 20, padding: 18 },
  percheLbl: { fontSize: 9, color: '#d4a853', letterSpacing: 2.5, marginBottom: 10, textTransform: 'uppercase' },
  percheVal: { fontSize: 18, color: '#f9fafb', fontFamily: 'Lora_400Regular_Italic', lineHeight: 28, marginBottom: 8 },
  percheSub: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },

  timerSection: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 20, alignItems: 'center' },
  sectionLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2.5, marginBottom: 8, textTransform: 'uppercase', alignSelf: 'flex-start' },
  timerDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  timerWrapper: { marginBottom: 20 },
  timerRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 2, borderColor: 'rgba(16,185,129,0.2)', alignItems: 'center', justifyContent: 'center' },
  timerNum: { fontSize: 36, fontWeight: '700', color: '#f9fafb', fontFamily: 'Lora_700Bold' },
  timerLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, letterSpacing: 0.5 },
  timerBtn: { backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  timerBtnText: { color: '#080b12', fontSize: 15, fontWeight: '700' },
  timerBtnSecondario: { borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  timerBtnSecondarioText: { color: '#6b7280', fontSize: 14 },
  timerFintoCard: { backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center' },
  timerFintoTesto: { fontSize: 14, color: '#10b981', textAlign: 'center', lineHeight: 22, marginBottom: 10 },
  timerReset: { fontSize: 12, color: '#4b5563', textDecorationLine: 'underline' },

  respiroSection: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 20, alignItems: 'center' },
  respiroDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  respiroWrapper: { marginBottom: 20 },
  respiroCerchio: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  respiroLabel: { fontSize: 16, fontWeight: '600', color: '#6b7280', letterSpacing: 0.5 },
  respiroBtn: { backgroundColor: '#3b82f6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  respiroBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  respiroBtnStop: { borderWidth: 1, borderColor: '#1a2030', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  respiroBtnStopText: { color: '#6b7280', fontSize: 14 },

  contattiSection: { marginHorizontal: 20, marginBottom: 16 },
  contattoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 16, padding: 16, marginBottom: 10 },
  contattoCardVerde: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(16,185,129,0.05)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)', borderRadius: 16, padding: 16, marginBottom: 10 },
  contattoCardRosso: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 16, padding: 16 },
  contattoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  contattoIconText: { fontSize: 18 },
  contattoNome: { fontSize: 14, fontWeight: '600', color: '#f9fafb', marginBottom: 2 },
  contattoNum: { fontSize: 12, color: '#6b7280' },
  contattoChiama: { fontSize: 12, color: '#d4a853', fontWeight: '600' },
  contattoChiamaVerde: { fontSize: 12, color: '#10b981', fontWeight: '600' },
  contattoChiamaRosso: { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  messaggioFinale: { marginHorizontal: 20, marginTop: 4, padding: 20, alignItems: 'center' },
  messaggioTesto: { fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
});