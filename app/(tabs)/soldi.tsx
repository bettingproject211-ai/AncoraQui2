import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SoldiScreen() {
  const [giorni, setGiorni] = useState(0);
  const [risparmi, setRisparmi] = useState(0);
  const [spesaGiornaliera, setSpesaGiornaliera] = useState(30);

  useFocusEffect(useCallback(() => { caricaDati(); }, []));

  const caricaDati = async () => {
    try {
      const dataInizio = await AsyncStorageLib.getItem('dataInizio');
      const spesa = await AsyncStorageLib.getItem('spesaGiornaliera');
      if (dataInizio) {
        const diff = Math.floor((new Date().getTime() - new Date(dataInizio).getTime()) / (1000 * 60 * 60 * 24));
        const spesaNum = spesa ? parseFloat(spesa) : 30;
        setGiorni(diff);
        setSpesaGiornaliera(spesaNum);
        setRisparmi(diff * spesaNum);
      }
    } catch (e) {}
  };

  const obiettivo = 3000;
  const percentuale = Math.min((risparmi / obiettivo) * 100, 100);

  const traduzioni = [
    { icon: '🍕', titolo: 'Pizze con gli amici', sub: `${Math.floor(risparmi / 10)} pizze pagate`, raggiunto: risparmi >= 10 },
    { icon: '🛒', titolo: 'Spesa alimentare', sub: `${Math.floor(risparmi / 235)} mesi per due`, raggiunto: risparmi >= 235 },
    { icon: '👶', titolo: 'Primo corredino', sub: 'Tutto quello che serve', raggiunto: risparmi >= 500 },
    { icon: '✈️', titolo: 'Vacanza per due', sub: 'Una settimana al mare', raggiunto: risparmi >= 1000 },
    { icon: '🏠', titolo: 'Mesi di affitto', sub: `${Math.floor(risparmi / 600)} mesi coperti`, raggiunto: risparmi >= 600 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <StatusBar barStyle="light-content" backgroundColor="#080b12" />

      <View style={styles.header}>
        <Text style={styles.logoSub}>i tuoi soldi</Text>
        <Text style={styles.logo}>Ancora Qui</Text>
      </View>

      <View style={styles.heroBig}>
        <Text style={styles.heroLbl}>HAI GIÀ RISPARMIATO</Text>
        <Text style={styles.heroVal}>€{risparmi.toFixed(0)}</Text>
        <Text style={styles.heroSub}>in {giorni} giorni · €{spesaGiornaliera}/giorno</Text>

        <View style={styles.barWrap}>
          <View style={[styles.barFill, { width: `${percentuale}%` }]} />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.barLabel}>€0</Text>
          <Text style={styles.barLabelObj}>Obiettivo €{obiettivo} 🏠</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLbl}>COSA SIGNIFICANO DAVVERO</Text>
        {traduzioni.map((t) => (
          <View key={t.titolo} style={[styles.trItem, !t.raggiunto && { opacity: 0.35 }]}>
            <View style={styles.trIconWrap}>
              <Text style={styles.trIcon}>{t.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trTitle}>{t.titolo}</Text>
              <Text style={styles.trSub}>{t.sub}</Text>
            </View>
            <View style={[styles.trBadge, t.raggiunto && styles.trBadgeOn]}>
              <Text style={[styles.trBadgeText, t.raggiunto && styles.trBadgeTextOn]}>
                {t.raggiunto ? '✓' : '○'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.motivCard}>
        <Text style={styles.motivLbl}>OGNI GIORNO CHE PASSA</Text>
        <View style={styles.motivRow}>
          <View style={styles.motivItem}>
            <Text style={styles.motivNum}>€{spesaGiornaliera}</Text>
            <Text style={styles.motivSub}>oggi</Text>
          </View>
          <Text style={styles.motivArrow}>→</Text>
          <View style={styles.motivItem}>
            <Text style={styles.motivNum}>€{(spesaGiornaliera * 7).toFixed(0)}</Text>
            <Text style={styles.motivSub}>7 giorni</Text>
          </View>
          <Text style={styles.motivArrow}>→</Text>
          <View style={styles.motivItem}>
            <Text style={styles.motivNum}>€{(spesaGiornaliera * 30).toFixed(0)}</Text>
            <Text style={styles.motivSub}>30 giorni</Text>
          </View>
        </View>
        <Text style={styles.motivNote}>
          €{spesaGiornaliera} al giorno sembrano niente.{'\n'}In un anno sono €{(spesaGiornaliera * 365).toFixed(0)}.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080b12' },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  logoSub: { fontSize: 10, color: '#4b5563', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 },
  logo: { fontSize: 26, fontWeight: '700', color: '#d4a853', letterSpacing: 1 },
  heroBig: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 24, padding: 24, alignItems: 'center' },
  heroLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2.5, marginBottom: 8, textTransform: 'uppercase' },
  heroVal: { fontSize: 58, fontWeight: '700', color: '#d4a853', fontFamily: 'Lora_700Bold', lineHeight: 64, textShadowColor: 'rgba(212,168,83,0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  heroSub: { fontSize: 12, color: '#4b5563', marginBottom: 20 },
  barWrap: { width: '100%', height: 4, backgroundColor: '#1a2030', borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', backgroundColor: '#d4a853', borderRadius: 2 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  barLabel: { fontSize: 10, color: '#4b5563' },
  barLabelObj: { fontSize: 10, color: '#4b5563' },
  card: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#1a2030', borderRadius: 20, padding: 18 },
  cardLbl: { fontSize: 9, color: '#4b5563', letterSpacing: 2.5, marginBottom: 16, textTransform: 'uppercase' },
  trItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a2030' },
  trIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  trIcon: { fontSize: 20 },
  trTitle: { fontSize: 13, color: '#f9fafb', fontWeight: '600', marginBottom: 2 },
  trSub: { fontSize: 11, color: '#4b5563' },
  trBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1a2030' },
  trBadgeOn: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  trBadgeText: { fontSize: 12, color: '#374151' },
  trBadgeTextOn: { color: '#10b981' },
  motivCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(212,168,83,0.04)', borderWidth: 1, borderColor: 'rgba(212,168,83,0.1)', borderRadius: 20, padding: 18 },
  motivLbl: { fontSize: 9, color: '#d4a853', letterSpacing: 2.5, marginBottom: 16, textTransform: 'uppercase' },
  motivRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  motivItem: { alignItems: 'center', flex: 1 },
  motivNum: { fontSize: 18, fontWeight: '700', color: '#d4a853', fontFamily: 'Lora_700Bold', marginBottom: 4 },
  motivSub: { fontSize: 10, color: '#4b5563' },
  motivArrow: { fontSize: 16, color: '#1a2030' },
  motivNote: { fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },
});