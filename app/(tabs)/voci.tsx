import { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const SkeletonCard = () => {
  const opacita = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacita, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacita, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: opacita }]}>
      <View style={styles.skeletonTop}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonNome} />
          <View style={styles.skeletonTempo} />
        </View>
      </View>
      <View style={styles.skeletonTesto1} />
      <View style={styles.skeletonTesto2} />
    </Animated.View>
  );
};

export default function VociScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [testo, setTesto] = useState('');
  const [loading, setLoading] = useState(true);
  const [invio, setInvio] = useState(false);
  const [online, setOnline] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [errore, setErrore] = useState(false);

  useEffect(() => {
    caricaPosts();
    caricaOnline();
  }, []);

  const caricaOnline = async () => {
    try {
      const ieri = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('voci')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', ieri);
      setOnline(count || 0);
    } catch (e) {}
  };

  const caricaPosts = async () => {
    try {
      setErrore(false);
      const { data, error } = await supabase
        .from('voci')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      if (data) setPosts(data);
    } catch (e) {
      setErrore(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    caricaPosts();
    caricaOnline();
  };

  const inviaPost = async () => {
    if (!testo.trim()) return;
    setInvio(true);
    try {
      const emojis = ['🌊', '☀️', '🌱', '🦋', '🌙', '⭐', '🔥', '💧'];
      const nomi = ['Onda', 'Sole', 'Radice', 'Vento', 'Luna', 'Stella', 'Fiamma', 'Goccia'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const nome = nomi[Math.floor(Math.random() * nomi.length)] + '_' + Math.floor(Math.random() * 99);
      const { error } = await supabase.from('voci').insert({
        testo: testo.trim().slice(0, 500),
        emoji,
        nickname: nome,
        giorni: 0,
        created_at: new Date().toISOString(),
      });
      if (!error) {
        setTesto('');
        caricaPosts();
        caricaOnline();
      }
    } catch (e) {}
    finally { setInvio(false); }
  };

  const formatTempo = (created_at: string) => {
    const diff = Date.now() - new Date(created_at).getTime();
    const ore = Math.floor(diff / 3600000);
    if (ore < 1) return 'poco fa';
    if (ore < 24) return `${ore} ore fa`;
    return `${Math.floor(ore / 24)} giorni fa`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#c9965a"
          colors={['#c9965a']}
        />
      }
    >
      <View style={styles.topbar}>
        <Text style={styles.titolo}>Voci</Text>
        <View style={styles.online}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{online} voci oggi</Text>
        </View>
      </View>

      <View style={styles.anonNote}>
        <Text style={styles.anonText}>Nessun nome. Nessuna foto. Solo persone vere.</Text>
      </View>

      <View style={styles.newPost}>
        <TextInput
          style={styles.input}
          placeholder="Scrivi — nessuno sa chi sei..."
          placeholderTextColor="#5a5f72"
          value={testo}
          onChangeText={(t) => setTesto(t.slice(0, 500))}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={inviaPost} disabled={invio}>
          <Text style={styles.sendText}>{invio ? '...' : '→'}</Text>
        </TouchableOpacity>
      </View>

      {testo.length > 400 && (
        <Text style={styles.contatore}>{500 - testo.length} caratteri rimasti</Text>
      )}

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : errore ? (
        <View style={styles.erroreBox}>
          <Text style={styles.erroreEmoji}>📡</Text>
          <Text style={styles.erroreTitolo}>Connessione assente</Text>
          <Text style={styles.erroreSub}>Tira giù per riprovare</Text>
          <TouchableOpacity style={styles.erroreBtn} onPress={caricaPosts}>
            <Text style={styles.erroreBtnText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ancora nessuna voce.{'\n'}Sii il primo a scrivere.</Text>
        </View>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postTop}>
              <View style={styles.avatar}>
                <Text style={styles.avEmoji}>{post.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postName}>{post.nickname}</Text>
                <Text style={styles.postTime}>{formatTempo(post.created_at)}</Text>
              </View>
              {post.giorni > 0 && (
                <View style={styles.postDays}>
                  <Text style={styles.postDaysText}>🔥 {post.giorni} giorni</Text>
                </View>
              )}
            </View>
            <Text style={styles.postText}>{post.testo}</Text>
          </View>
        ))
      )}

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
  newPost: { marginHorizontal: 20, marginBottom: 8, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, color: '#ddd8cf', fontSize: 12, minHeight: 40 },
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#c9965a', alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#1a0f00', fontSize: 14, fontWeight: '700' },
  contatore: { marginHorizontal: 20, marginBottom: 8, fontSize: 10, color: '#b85c5c', textAlign: 'right' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#5a5f72', textAlign: 'center', lineHeight: 22 },
  erroreBox: { padding: 40, alignItems: 'center' },
  erroreEmoji: { fontSize: 40, marginBottom: 12 },
  erroreTitolo: { fontSize: 16, fontWeight: '600', color: '#ddd8cf', marginBottom: 6 },
  erroreSub: { fontSize: 13, color: '#5a5f72', marginBottom: 20 },
  erroreBtn: { backgroundColor: '#c9965a', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  erroreBtnText: { color: '#1a0f00', fontSize: 13, fontWeight: '700' },
  skeletonCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  skeletonTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  skeletonAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1e2336' },
  skeletonInfo: { flex: 1, gap: 6 },
  skeletonNome: { height: 10, backgroundColor: '#1e2336', borderRadius: 5, width: '40%' },
  skeletonTempo: { height: 8, backgroundColor: '#1e2336', borderRadius: 4, width: '25%' },
  skeletonTesto1: { height: 10, backgroundColor: '#1e2336', borderRadius: 5, width: '100%', marginBottom: 6 },
  skeletonTesto2: { height: 10, backgroundColor: '#1e2336', borderRadius: 5, width: '70%' },
  post: { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#0c0f1a', borderWidth: 1, borderColor: '#181c2a', borderRadius: 18, padding: 14 },
  postTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201,150,90,0.15)', alignItems: 'center', justifyContent: 'center' },
  avEmoji: { fontSize: 16 },
  postName: { fontSize: 12, fontWeight: '600', color: '#ddd8cf' },
  postTime: { fontSize: 10, color: '#5a5f72' },
  postDays: { marginLeft: 'auto', backgroundColor: 'rgba(106,170,130,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  postDaysText: { fontSize: 10, color: '#6aaa82' },
  postText: { fontSize: 12, color: '#ddd8cf', opacity: 0.85, lineHeight: 20 },
});