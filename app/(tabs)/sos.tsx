import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ESERCIZI = [
  {
    emoji: '🌬️',
    titolo: 'Respiro 4-4-4',
    desc: 'Inspira 4 secondi, trattieni 4, espira 4. Ripeti 4 volte.',
    durata: 48,
  },
  {
    emoji: '👁️',
    titolo: '5 cose che vedi',
    desc: 'Guarda intorno. Nomina 5 cose che vedi. Poi 4 che tocchi. Poi 3 che senti.',
    durata: 60,
  },
  {
    emoji: '💧',
    titolo: 'Acqua fredda',
    desc: 'Vai al rubinetto. Metti le mani sotto l\'acqua fredda per 30 secondi. Senti solo quello.',
    durata: 30,
  },
];

export default function SosScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const [perche, setPerche] = useState('');
  const [contatto, setContatto] = useState('');
  const [nomeContatto, setNomeContatto] = useState('');
  const [esercizioCurrent, setEsercizioCurrent] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerAttivo, setTimerAttivo] = useState(false);
  const [timer10, setTimer10] = useState(600);
  const [timer10Attivo, setTimer10Attivo] = useState(false);
  const timerRef = useRef<any>(null);
  const timer10Ref = useRef<any>(null);

  useEffect(() => {
    caricaDati();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timer10Ref.current) clearInterval(timer10Ref.current);
    };
  }, []);

  const caricaDati = async () => {
    try {
      const p = await AsyncStorageLib.getItem('perche');
      const c = await AsyncStorageLib.getItem('contattoNumero');
      const n = await AsyncStorageLib.getItem('contattoNome');
      setPerche(p || '');
      setContatto(c || '');
      setNomeContatto(n || '');
    } catch (e) {}
  };

  const iniziaEsercizio = (index: number) => {
    setEsercizioCurrent(index);
    setTimer(ESERCIZI[index].durata);
    setTimerAttivo(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimerAttivo(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const iniziaTimer10 = () => {
    setTimer10(600);
    setTimer10Attivo(true);
    if (timer10Ref.current) clearInterval(timer10Ref.current);
    timer10Ref.current = setInterval(() => {
      setTimer10(t => {
        if (t <= 1) {
          clearInterval(timer10Ref.current);
          setTimer10Attivo(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const chiamaContatto = () => {
    if (contatto) Linking.openURL(`tel:${contatto}`);
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.momento}>MOMENTO DIFFICILE</Text>
        <Text style={styles.titolo}>Sei ancora qui.{'\n'}Questo è tutto.</Text>
        <Text style={styles.sub}>Non devi fare niente adesso.{'\n'}Solo restare qui un momento.</Text>
      </View>

      {/* PERCHÉ */}
      <View style={styles.perche}>
        <Text style={styles.percheLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.percheVal}>"{perche}"</Text>
      </View>

      {/* TIMER 10 MINUTI */}
      <View style={styles.timer10Card}>
        <Text style={styles.timer10Lbl}>LA SFIDA DEI 10 MINUTI</Text>
        <Text style={styles.timer10Desc}>L'impulso passa. Resisti solo 10 minuti — poi vediamo.</Text>
        {timer10Attivo ? (
          <View style={styles.timer10Running}>
            <Text style={styles.timer10Num}>{formatTimer(timer10)}</Text>
            <Text style={styles.timer10Sub}>
              {timer10 === 0 ? '🎉 Ce l\'hai fatta!' : 'Stai resistendo...'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.timer10Btn} onPress={iniziaTimer10}>
            <Text style={styles.timer10BtnText}>▶ Inizia i 10 minuti</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ESERCIZI MINDFULNESS */}
      <View style={styles.section}>
        <Text style={styles.sectionLbl}>ESERCIZI — scegli uno</Text>
        {ESERCIZI.map((e, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.esercizio, esercizioCurrent === i && styles.esercizioOn]}
            onPress={() => iniziaEsercizio(i)}
          >
            <Text style={styles.esercizioEmoji}>{e.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.esercizioTitolo}>{e.titolo}</Text>
              <Text style={styles.esercizioDesc}>{e.desc}</Text>
              {esercizioCurrent === i && timerAttivo && (
                <View style={styles.esercizioTimer}>
                  <Text style={styles.esercizioTimerText}>{timer}s</Text>
                </View>
              )}
              {esercizioCurrent === i && !timerAttivo && timer === 0 && (
                <Text style={styles.esercizioFatto}>✓ Fatto!</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* RESPIRO ANIMATO */}
      <View style={styles.respiro}>
        <Animated.View style={[styles.ring, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.ringEmoji}>🌬️</Text>
        </Animated.View>
        <Text style={styles.respiroLbl}>RESPIRA CON ME</Text>
        <Text style={styles.respiroSub}>4 secondi dentro · 4 fuori</Text>
      </View>

      {/* CONTATTO */}
      {contatto ? (
        <TouchableOpacity style={styles.contattoBtn} onPress={chiamaContatto}>
          <Text style={styles.contattoIcon}>💙</Text>
          <View>
            <Text style={styles.contattoLbl}>CHIAMA LA TUA PERSONA DI FIDUCIA</Text>
            <Text style={styles.contattoNome}>{nomeContatto || 'Il tuo contatto'}</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* SERD */}
      <TouchableOpacity style={styles.serd} onPress={() => Linking.openURL('tel:800274274')}>
        <Text style={styles.serdIcon}>📞</Text>
        <View>
          <Text style={styles.serdLbl}>PARLA CON QUALCUNO ORA</Text>
          <Text style={styles.serdNum}>800 274 274 — SerD</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  header: { padding: 28, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#181c2a', backgroundColor: 'rgba(184,92,92,0.07)' },
  momento: { fontSize: 10, color: '#b85c5c', letterSpacing: 2, marginBottom: 10 },
  titolo: { fontSize: 26, fontWeight: '700', color: '#ddd8cf', lineHeight: 32, marginBottom: 10 },
  sub: { fontSize: 13, color: '#5a5f72', lineHeight: 22 },
  perche: { marginHorizontal: 20, marginTop: 20, marginBottom: 0, backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.14)', borderRadius: 18, padding: 16, alignItems: 'center' },
  percheLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 8 },
  percheVal: { fontSize: 16, fontStyle: 'italic', color: '#ddd8cf', textAlign: 'center', lineHeight: 24 },
  timer10Card: { marginHorizontal: 20, marginTop: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 18 },
  timer10Lbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 6 },
  timer10Desc: { fontSize: 12, color: '#5a5f72', lineHeight: 18, marginBottom: 14 },
  timer10Running: { alignItems: 'center', paddingVertical: 10 },
  timer10Num: { fontSize: 48, fontWeight: '700', color: '#6aaa82', lineHeight: 52 },
  timer10Sub: { fontSize: 12, color: '#5a5f72', marginTop: 4 },
  timer10Btn: { backgroundColor: 'rgba(201,150,90,0.1)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.2)', borderRadius: 12, padding: 14, alignItems: 'center' },
  timer10BtnText: { fontSize: 14, color: '#c9965a', fontWeight: '600' },
  section: { marginHorizontal: 20, marginTop: 14 },
  sectionLbl: { fontSize: 9, color: '#5a5f72', letterSpacing: 2, marginBottom: 10 },
  esercizio: { backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, marginBottom: 8 },
  esercizioOn: { borderColor: 'rgba(93,143,168,0.4)', backgroundColor: 'rgba(93,143,168,0.05)' },
  esercizioEmoji: { fontSize: 24, marginTop: 2 },
  esercizioTitolo: { fontSize: 13, fontWeight: '600', color: '#ddd8cf', marginBottom: 4 },
  esercizioDesc: { fontSize: 12, color: '#5a5f72', lineHeight: 18 },
  esercizioTimer: { marginTop: 8, backgroundColor: 'rgba(93,143,168,0.1)', borderRadius: 8, padding: 6, alignSelf: 'flex-start' },
  esercizioTimerText: { fontSize: 14, color: '#5d8fa8', fontWeight: '700' },
  esercizioFatto: { marginTop: 8, fontSize: 12, color: '#6aaa82', fontWeight: '600' },
  respiro: { margin: 20, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 20, alignItems: 'center' },
  ring: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: '#5d8fa8', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ringEmoji: { fontSize: 28 },
  respiroLbl: { fontSize: 11, color: '#5d8fa8', letterSpacing: 2, marginBottom: 4 },
  respiroSub: { fontSize: 11, color: '#5a5f72' },
  contattoBtn: { marginHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(93,143,168,0.08)', borderWidth: 1, borderColor: 'rgba(93,143,168,0.25)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contattoIcon: { fontSize: 24 },
  contattoLbl: { fontSize: 9, color: '#5d8fa8', letterSpacing: 1, marginBottom: 4 },
  contattoNome: { fontSize: 16, fontWeight: '600', color: '#ddd8cf' },
  serd: { marginHorizontal: 20, marginBottom: 40, backgroundColor: 'rgba(184,92,92,0.08)', borderWidth: 1, borderColor: 'rgba(184,92,92,0.25)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  serdIcon: { fontSize: 24 },
  serdLbl: { fontSize: 9, color: '#b85c5c', letterSpacing: 1, marginBottom: 4 },
  serdNum: { fontSize: 16, fontWeight: '600', color: '#ddd8cf' },
});