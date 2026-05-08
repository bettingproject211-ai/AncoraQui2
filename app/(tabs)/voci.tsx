import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VociScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.titolo}>Voci</Text>
        <View style={styles.online}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>23 stanotte</Text>
        </View>
      </View>
      <View style={styles.anonNote}>
        <Text style={styles.anonText}>Nessun nome. Nessuna foto. Solo persone vere.</Text>
      </View>
      <View style={styles.post}>
        <View style={styles.postTop}>
          <View style={[styles.avatar, styles.av1]}>
            <Text style={styles.avEmoji}>🌊</Text>
          </View>
          <View>
            <Text style={styles.postName}>Onda_47</Text>
            <Text style={styles.postTime}>2 ore fa</Text>
          </View>
          <View style={styles.postDays}>
            <Text style={styles.postDaysText}>🔥 31 giorni</Text>
          </View>
        </View>
        <Text style={styles.postText}>Stasera era durissima. Sono rimasto sul divano a fissare il telefono. Ho aperto questa app invece. Sono ancora qui.</Text>
        <View style={styles.reactions}>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>🤝 24</Text></TouchableOpacity>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>💪 18</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.post}>
        <View style={styles.postTop}>
          <View style={[styles.avatar, styles.av2]}>
            <Text style={styles.avEmoji}>☀️</Text>
          </View>
          <View>
            <Text style={styles.postName}>Sole_180</Text>
            <Text style={styles.postTime}>ieri</Text>
          </View>
          <View style={styles.postDays}>
            <Text style={styles.postDaysText}>✨ 180 giorni</Text>
          </View>
        </View>
        <Text style={styles.postText}>6 mesi fa pensavo fosse impossibile. Non lo è. Un giorno alla volta. Sono qui se qualcuno ha bisogno.</Text>
        <View style={styles.reactions}>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>❤️ 67</Text></TouchableOpacity>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>🙏 41</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.post}>
        <View style={styles.postTop}>
          <View style={[styles.avatar, styles.av3]}>
            <Text style={styles.avEmoji}>🌱</Text>
          </View>
          <View>
            <Text style={styles.postName}>Radice_3</Text>
            <Text style={styles.postTime}>3 ore fa</Text>
          </View>
          <View style={styles.postDays}>
            <Text style={styles.postDaysText}>🌱 3 giorni</Text>
          </View>
        </View>
        <Text style={styles.postText}>Primo weekend senza. Non capisco ancora come ce la faccio ma sono ancora in piedi.</Text>
        <View style={styles.reactions}>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>🤝 33</Text></TouchableOpacity>
          <TouchableOpacity style={styles.reaction}><Text style={styles.reactionText}>💙 29</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.newPost}>
        <TextInput
          style={styles.input}
          placeholder="Scrivi — nessuno sa chi sei..."
          placeholderTextColor="#5a5f72"
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080f' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  titolo: { fontSize: 22, fontWeight: '700', color: '#ddd8cf' },
  online: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(106,170,130,0.08)', borderWidth: 1, borderColor: 'rgba(106,170,130,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6aaa82' },
  onlineText: { fontSize: 11, color: '#6aaa82' },
  anonNote: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 12, padding: 10 },
  anonText: { fontSize: 11, color: '#5a5f72', textAlign: 'center', fontStyle: 'italic' },
  post: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  postTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  av1: { backgroundColor: 'rgba(93,143,168,0.15)' },
  av2: { backgroundColor: 'rgba(201,150,90,0.15)' },
  av3: { backgroundColor: 'rgba(106,170,130,0.15)' },
  avEmoji: { fontSize: 16 },
  postName: { fontSize: 12, fontWeight: '600', color: '#ddd8cf' },
  postTime: { fontSize: 10, color: '#5a5f72' },
  postDays: { marginLeft: 'auto', backgroundColor: 'rgba(106,170,130,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  postDaysText: { fontSize: 10, color: '#6aaa82' },
  postText: { fontSize: 12, color: '#ddd8cf', opacity: 0.85, lineHeight: 20, marginBottom: 10 },
  reactions: { flexDirection: 'row', gap: 8 },
  reaction: { backgroundColor: '#111525', borderWidth: 1, borderColor: '#1e2336', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  reactionText: { fontSize: 11, color: '#5a5f72' },
  newPost: { marginHorizontal: 20, marginBottom: 40, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, color: '#5a5f72', fontSize: 12 },
  sendBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#c9965a', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#1a0f00', fontSize: 14, fontWeight: '700' },
});