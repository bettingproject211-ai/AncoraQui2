import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SoldiScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lbl}>I TUOI SOLDI REALI</Text>
        <Text style={styles.titolo}>Non sono numeri.</Text>
        <Text style={styles.sub}>€20 non è poco. È una cena. Eccoli tradotti in vita vera.</Text>
      </View>
      <View style={styles.bigN}>
        <Text style={styles.bigVal}>€1.410</Text>
        <Text style={styles.bigSub}>risparmiati in 47 giorni</Text>
        <View style={styles.barWrap}>
          <View style={styles.barFill} />
        </View>
        <View style={styles.barGoals}>
          <Text style={styles.barGoalText}>€0</Text>
          <Text style={styles.barGoalText}>Obiettivo: €3.000 🏠</Text>
        </View>
      </View>
      <View style={styles.traduzioni}>
        <Text style={styles.trHead}>COSA SIGNIFICANO DAVVERO</Text>
        <View style={styles.trItem}>
          <Text style={styles.trIcon}>🛒</Text>
          <View style={styles.trDesc}>
            <Text style={styles.trTitle}>Spesa alimentare</Text>
            <Text style={styles.trSub}>6 mesi per due</Text>
          </View>
          <Text style={styles.trOk}>✓</Text>
        </View>
        <View style={styles.trItem}>
          <Text style={styles.trIcon}>🏠</Text>
          <View style={styles.trDesc}>
            <Text style={styles.trTitle}>Affitto</Text>
            <Text style={styles.trSub}>3 mesi coperti</Text>
          </View>
          <Text style={styles.trOk}>✓</Text>
        </View>
        <View style={styles.trItem}>
          <Text style={styles.trIcon}>👶</Text>
          <View style={styles.trDesc}>
            <Text style={styles.trTitle}>Primo corredino</Text>
            <Text style={styles.trSub}>Tutto quello che serve</Text>
          </View>
          <Text style={styles.trOk}>✓</Text>
        </View>
        <View style={styles.trItem}>
          <Text style={styles.trIcon}>✈️</Text>
          <View style={styles.trDesc}>
            <Text style={styles.trTitle}>Vacanza per due</Text>
            <Text style={styles.trSub}>Una settimana al mare</Text>
          </View>
          <Text style={styles.trNo}>○</Text>
        </View>
      </View>
      <View style={styles.notifica}>
        <Text style={styles.notifIcon}>🌙</Text>
        <View>
          <Text style={styles.notifT}>Notifica sera intelligente</Text>
          <Text style={styles.notifS}>Hai segnato "stanco" — l'app arriva prima dell'impulso.</Text>
          <Text style={styles.notifTime}>Ogni sera quando serve — mai quando non serve</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  header: { padding: 20, paddingTop: 60, alignItems: 'center' },
  lbl: { fontSize: 9, color: '#c9965a', letterSpacing: 2, marginBottom: 6 },
  titolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf', marginBottom: 6 },
  sub: { fontSize: 12, color: '#5a5f72', textAlign: 'center', lineHeight: 18 },
  bigN: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, padding: 20, alignItems: 'center' },
  bigVal: { fontSize: 52, fontWeight: '700', color: '#c9965a', lineHeight: 56 },
  bigSub: { fontSize: 12, color: '#5a5f72', marginBottom: 14 },
  barWrap: { width: '100%', height: 4, backgroundColor: '#181c2a', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  barFill: { width: '47%', height: '100%', backgroundColor: '#c9965a', borderRadius: 2 },
  barGoals: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  barGoalText: { fontSize: 10, color: '#5a5f72' },
  traduzioni: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 20, overflow: 'hidden' },
  trHead: { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#181c2a', fontSize: 9, color: '#5a5f72', letterSpacing: 1.5 },
  trItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#181c2a' },
  trIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  trDesc: { flex: 1 },
  trTitle: { fontSize: 13, color: '#ddd8cf', fontWeight: '500', marginBottom: 2 },
  trSub: { fontSize: 11, color: '#5a5f72' },
  trOk: { fontSize: 16, color: '#6aaa82' },
  trNo: { fontSize: 16, color: '#5a5f72', opacity: 0.3 },
  notifica: { marginHorizontal: 20, marginBottom: 40, backgroundColor: 'rgba(93,143,168,0.05)', borderWidth: 1, borderColor: 'rgba(93,143,168,0.14)', borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12 },
  notifIcon: { fontSize: 20, marginTop: 2 },
  notifT: { fontSize: 12, color: '#5d8fa8', fontWeight: '600', marginBottom: 4 },
  notifS: { fontSize: 11, color: '#5a5f72', lineHeight: 16, marginBottom: 4 },
  notifTime: { fontSize: 10, color: '#5a5f72', opacity: 0.6 },
});