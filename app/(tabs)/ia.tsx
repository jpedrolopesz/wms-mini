import { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useStore } from '@/store';
import { WMS } from '@/constants/theme';

interface Msg { role: 'user' | 'assistant'; content: string }

const ATALHOS = [
  'Analise o inventário e me dê um resumo',
  'Quais itens têm divergência?',
  'Sugira melhorias para esse inventário',
];

export default function IAScreen() {
  const { state } = useStore();
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content: 'Olá! Sou o agente de análise do WMS Mini. Posso analisar seu inventário, detectar divergências e responder perguntas. Como posso ajudar?',
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function enviar(texto?: string) {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const items = state.items;
    const ctx = {
      total: items.length,
      por_status: {
        ok:          items.filter(i => i.status === 'ok').length,
        pendente:    items.filter(i => i.status === 'pendente').length,
        divergencia: items.filter(i => i.status === 'divergencia').length,
      },
      por_tipo: {
        qrcode: items.filter(i => i.tipo === 'qrcode').length,
        ocr:    items.filter(i => i.tipo === 'ocr').length,
      },
      itens: items.slice(0, 20).map(i => ({
        codigo: i.codigo, descricao: i.descricao,
        localizacao: i.localizacao, tipo: i.tipo,
        status: i.status, confianca: i.confianca,
      })),
    };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `Você é um agente de análise de inventário do WMS Mini.\nResponda em português, de forma objetiva e prática.\nInventário atual:\n${JSON.stringify(ctx, null, 2)}`,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content?.[0]?.text || 'Erro na resposta.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro de conexão. Tente novamente.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={s.container}>

        {/* Atalhos */}
        <View style={s.atalhos}>
          {ATALHOS.map(a => (
            <TouchableOpacity key={a} style={s.atalhoChip} onPress={() => enviar(a)}>
              <Text style={s.atalhoText} numberOfLines={1}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat */}
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={s.chatContent}>
          {messages.map((m, i) => (
            <View key={i} style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleAI]}>
              <Text style={[s.bubbleName, { color: m.role === 'user' ? WMS.blue : WMS.teal }]}>
                {m.role === 'user' ? 'Você' : 'Agente IA'}
              </Text>
              <Text style={s.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[s.bubble, s.bubbleAI]}>
              <Text style={[s.bubbleName, { color: WMS.teal }]}>Agente IA</Text>
              <Text style={s.bubbleText}>Analisando inventário...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input} value={input} onChangeText={setInput}
            placeholder="Pergunte sobre o inventário..." placeholderTextColor={WMS.muted}
            multiline maxLength={400}
          />
          <TouchableOpacity
            onPress={() => enviar()}
            disabled={!input.trim() || loading}
            style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 }}>↑</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: WMS.bg },
  atalhos:    { padding: 12, gap: 8, backgroundColor: WMS.surface, borderBottomWidth: 1, borderBottomColor: WMS.border },
  atalhoChip: { backgroundColor: WMS.surface2, borderRadius: 8, borderWidth: 1, borderColor: WMS.border, paddingHorizontal: 12, paddingVertical: 8 },
  atalhoText: { fontSize: 12, color: WMS.muted },
  chatContent:{ padding: 14, gap: 12 },
  bubble:     { borderRadius: 12, padding: 14, maxWidth: '88%', borderWidth: 1 },
  bubbleAI:   { backgroundColor: WMS.surface, borderColor: WMS.border, alignSelf: 'flex-start', borderTopLeftRadius: 2 },
  bubbleUser: { backgroundColor: WMS.blueBg,  borderColor: WMS.blueBorder, alignSelf: 'flex-end', borderTopRightRadius: 2 },
  bubbleName: { fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: 0.3 },
  bubbleText: { fontSize: 14, color: '#ede9e3', lineHeight: 22 },
  inputBar:   { flexDirection: 'row', gap: 10, alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: WMS.border, backgroundColor: WMS.surface },
  input:      { flex: 1, backgroundColor: WMS.surface2, borderRadius: 10, borderWidth: 1, borderColor: WMS.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#ede9e3', maxHeight: 120 },
  sendBtn:    { width: 42, height: 42, borderRadius: 10, backgroundColor: WMS.teal, alignItems: 'center', justifyContent: 'center' },
});