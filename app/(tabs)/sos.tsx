import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

const FASI = [
  { testo: 'Inspira...', durata: 4000, colore: '#5d8fa8' },
  { testo: 'Trattieni...', durata: 4000, colore: '#c9965a' },
  { testo: 'Espira lentamente...', durata: 6000, colore: '#6aaa82' },
];

export default function SosScreen() {
  const [perche, setPerche] = useState('');
  const [contatto, setContatto] = useState('');
  const [nomeContatto, setNomeContatto] = useState('');
  const [respirandoAttivo, setRespirandoAttivo] = useState(false);
  const [faseCorrente, setFaseCorrente] = useState(0);
  const [testoFase, setTestoFase] = useState('Tocca per iniziare');
  const [coloreAnello, setColoreAnello] = useState('#5d8fa8');

  const scalaAnello = useRef(new Animated.Value(1)).current;
  const opacitaAnello = useRef(new Animated.Value(0.6)).current;
  const animazioneRef = useRef<any>(null);
  const faseRef = useRef(0);
  const attivoRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
      return () => {
        fermaRespiro();
      };
    }, [])
  );

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

  const fermaRespiro = () => {
    attivoRef.current = false;
    setRespirandoAttivo(false);
    setFaseCorrente(0);
    setTestoFase('Tocca per iniziare');
    setColoreAnello('#5d8fa8');
    if (animazioneRef.current) {
      animazioneRef.current.stop();
    }
    scalaAnello.setValue(1);
    opacitaAnello.setValue(0.6);
  };

  const eseguiFase = (indice: number) => {
    if (!attivoRef.current) return;
    const fase = FASI[indice % FASI.length];
    faseRef.current = indice % FASI.length;
    setFaseCorrente(indice % FASI.length);
    setTestoFase(fase.testo);
    setColoreAnello(fase.colore);

    Vibration.vibrate(100);

    const isInspira = indice % 3 === 0;
    const isEspira = indice % 3 === 2;

    animazioneRef.current = Animated.parallel([
      Animated.timing(scalaAnello, {
        toValue: isInspira ? 1.3 : isEspira ? 0.85 : 1.1,
        duration: fase.durata,
        useNativeDriver: true,
      }),
      Animated.timing(opacitaAnello, {
        toValue: isInspira ? 1 : isEspira ? 0.5 : 0.8,
        duration: fase.durata,
        useNativeDriver: true,
      }),
    ]);

    animazioneRef.current.start(({ finished }: { finished: boolean }) => {
      if (finished && attivoRef.current) {
        eseguiFase(indice + 1);
      }
    });
  };

  const toggleRespiro = () => {
    if (respirandoAttivo) {
      fermaRespiro();
    } else {
      attivoRef.current = true;
      setRespirandoAttivo(true);
      setTestoFase('Inspira...');
      eseguiFase(0);
    }
  };

  const chiamaContatto = () => {
    if (contatto) Linking.openURL(`tel:${contatto}`);
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.momento}>MOMENTO DIFFICILE</Text>
        <Text style={styles.titolo}>Sei ancora qui.{'\n'}Questo è tutto.</Text>
        <Text style={styles.sub}>Non devi fare niente adesso.{'\n'}Solo restare qui un momento.</Text>
      </View>

      {/* PERCHÉ — subito visibile senza scrollare */}
      <View style={styles.perche}>
        <Text style={styles.percheLbl}>IL TUO PERCHÉ</Text>
        <Text style={styles.percheVal}>"{perche}"</Text>
      </View>

      {/* CERCHIO RESPIRO INTERATTIVO */}
      <View style={styles.respiroContainer}>
        <Text style={styles.respiroTitolo}>
          {respirandoAttivo ? 'Respira con me' : 'Esercizio di respiro'}
        </Text>

        <TouchableOpacity onPress={toggleRespiro} activeOpacity={0.9}>
          <View style={styles.ringWrapper}>
            {/* Anello esterno fisso */}
            <View style={[styles.ringEsterno, { borderColor: coloreAnello + '30' }]} />
            {/* Anello animato */}
            <Animated.View style={[
              styles.ringAnimato,
              {
                borderColor: coloreAnello,
                transform: [{ scale: scalaAnello }],
                opacity: opacitaAnello,
              }
            ]}>
              <Text style={styles.ringEmoji}>🌬️</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.faseTesto, { color: coloreAnello }]}>{testoFase}</Text>

        {respirandoAttivo && (
          <View style={styles.fasiIndicatori}>
            {FASI.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.fasiDot,
                  faseCorrente === i && { backgroundColor: coloreAnello }
                ]}
              />
            ))}
          </View>
        )}

        <Text style={styles.respiroSub}>
          {respirandoAttivo ? 'Tocca per fermare' : '4 sec inspira · 4 trattieni · 6 espira'}
        </Text>
      </View>

      {/* PRESENZA */}
      <View style={styles.presenza}>
        <Text style={styles.presenzaText}>
          <Text style={styles.presenzaBold}>Non devi essere forte adesso.{'\n'}</Text>
          Solo non aprire quell'altra app per i prossimi 10 minuti.
        </Text>
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
  perche: { marginHorizontal: 20, marginTop: 20, backgroundColor: 'rgba(201,150,90,0.07)', borderWidth: 1, borderColor: 'rgba(201,150,90,0.14)', borderRadius: 18, padding: 16, alignItems: 'center' },
  percheLbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 8 },
  percheVal: { fontSize: 16, fontStyle: 'italic', color: '#ddd8cf', textAlign: 'center', lineHeight: 24 },
  respiroContainer: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 24, padding: 24, alignItems: 'center' },
  respiroTitolo: { fontSize: 11, color: '#5a5f72', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
  ringWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ringEsterno: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1 },
  ringAnimato: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(93,143,168,0.05)' },
  ringEmoji: { fontSize: 32 },
  faseTesto: { fontSize: 18, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 },
  fasiIndicatori: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  fasiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1e2336' },
  respiroSub: { fontSize: 11, color: '#5a5f72', textAlign: 'center' },
  presenza: { marginHorizontal: 20, marginTop: 14, marginBottom: 0, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 16 },
  presenzaText: { fontSize: 13, color: '#5a5f72', lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  presenzaBold: { color: '#a8a29a', fontStyle: 'normal', fontWeight: '500' },
  contattoBtn: { marginHorizontal: 20, marginTop: 14, backgroundColor: 'rgba(93,143,168,0.08)', borderWidth: 1, borderColor: 'rgba(93,143,168,0.25)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contattoIcon: { fontSize: 24 },
  contattoLbl: { fontSize: 9, color: '#5d8fa8', letterSpacing: 1, marginBottom: 4 },
  contattoNome: { fontSize: 16, fontWeight: '600', color: '#ddd8cf' },
  serd: { marginHorizontal: 20, marginTop: 14, marginBottom: 40, backgroundColor: 'rgba(184,92,92,0.08)', borderWidth: 1, borderColor: 'rgba(184,92,92,0.25)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  serdIcon: { fontSize: 24 },
  serdLbl: { fontSize: 9, color: '#b85c5c', letterSpacing: 1, marginBottom: 4 },
  serdNum: { fontSize: 16, fontWeight: '600', color: '#ddd8cf' },
});