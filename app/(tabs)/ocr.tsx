import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useStore } from '@/store';
import { WMS } from '@/constants/theme';
import { Card, SectionLabel, Btn, Badge } from '@/components/wms/ui';

const EXEMPLOS = [
  `ITEM: CX-042\nLOT: 2024-03\nQTD: 50un\nLOCAL: B2`,
  `PRODUTO: Motor DC 12V\nREF: MTR-089\nLOCAL: Galpão A`,
  `SKU: EMB-301\nDESC: Caixa papelão G\nQTD: 200\nLOCAL: F7`,
  `CODIGO: SENS-047\nFAB: 2024-01\nSTATUS: INSPECIONAR\nLOCAL: D1`,
];

function parsear(texto: string) {
  let codigo = '', descricao = '', localizacao = '';
  for (const linha of texto.split('\n').map(l => l.trim()).filter(Boolean)) {
    const idx = linha.indexOf(':');
    if (idx === -1) continue;
    const chave = linha.slice(0, idx).toUpperCase().trim();
    const valor = linha.slice(idx + 1).trim();
    if (['ITEM','CODIGO','SKU','REF'].includes(chave) && !codigo)     codigo = valor;
    if (['DESC','DESCRICAO','PRODUTO'].includes(chave) && !descricao) descricao = valor;
    if (['LOCAL','LOCALIZACAO'].includes(chave))                       localizacao = valor;
  }
  if (!codigo) codigo = 'OCR-' + Date.now().toString().slice(-5);
  return { codigo, descricao, localizacao };
}

export default function OCRScreen() {
  const { addItem } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [texto,     setTexto]     = useState('');
  const [confianca, setConfianca] = useState(92);
  const [parsed,    setParsed]    = useState<{ codigo: string; descricao: string; localizacao: string } | null>(null);
  const [lastItem,  setLastItem]  = useState<ReturnType<typeof addItem> | null>(null);

  async function abrirCamera() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Permissão necessária'); return; }
    }
    setCapturing(true);
  }

  function simularCaptura() {
    const conf = 75 + Math.floor(Math.random() * 24);
    setCapturing(false);
    setTexto(EXEMPLOS[Math.floor(Math.random() * EXEMPLOS.length)]);
    setConfianca(conf);
    Alert.alert('📷 Capturado', `GCP Vision API: ${conf}% de confiança`);
  }

  function processar() {
    if (!texto.trim()) { Alert.alert('Insira o texto'); return; }
    setParsed(parsear(texto));
  }

  function registrar() {
    if (!parsed) { Alert.alert('Processe o texto primeiro'); return; }
    const item = addItem({
      codigo: parsed.codigo,
      descricao: parsed.descricao,
      localizacao: parsed.localizacao,
      tipo: 'ocr',
      status: confianca >= 85 ? 'pendente' : 'divergencia',
      confianca,
      textoOriginal: texto,
    });
    setLastItem(item);
    setTexto(''); setParsed(null); setConfianca(92);
  }

  if (capturing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
        <View style={s.ocrOverlay}>
          <View style={s.ocrFrame}>
            <Text style={{ color: WMS.teal, fontSize: 12, fontWeight: '500' }}>Etiqueta</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 14, marginBottom: 24 }}>Enquadre a etiqueta</Text>
          <TouchableOpacity style={s.captureBtn} onPress={simularCaptura}>
            <View style={s.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCapturing(false)} style={{ marginTop: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      <Card>
        <SectionLabel>câmera do drone</SectionLabel>
        <TouchableOpacity style={s.scanBox} onPress={abrirCamera} activeOpacity={0.8}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📷</Text>
          <Text style={{ fontSize: 13, color: WMS.muted, textAlign: 'center' }}>Toque para capturar etiqueta</Text>
          <Text style={{ fontSize: 11, color: WMS.muted, marginTop: 4, textAlign: 'center' }}>simula envio para GCP Vision API</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <SectionLabel>texto extraído (GCP Vision API)</SectionLabel>
        <TextInput
          style={[s.input, { height: 110, textAlignVertical: 'top' }]}
          value={texto} onChangeText={t => { setTexto(t); setParsed(null); }}
          multiline placeholder={'ITEM: CX-042\nLOT: 2024-03\nLOCAL: B2'}
          placeholderTextColor={WMS.muted}
        />

        <Text style={[s.label, { marginTop: 12 }]}>Confiança da leitura</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {[70, 80, 90, 98].map(v => (
            <TouchableOpacity key={v} onPress={() => setConfianca(v)}
              style={[s.chip, confianca === v && { borderColor: WMS.teal, backgroundColor: WMS.tealBg }]}>
              <Text style={[{ fontSize: 12, color: WMS.muted }, confianca === v && { color: WMS.teal, fontWeight: '600' }]}>{v}%</Text>
            </TouchableOpacity>
          ))}
          <Text style={{ color: confianca >= 85 ? WMS.teal : WMS.red, fontWeight: '600', fontSize: 14, alignSelf: 'center', marginLeft: 'auto' }}>
            {confianca}%
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Processar" variant="teal" onPress={processar} style={{ flex: 1 }} />
          <Btn label="Exemplo" onPress={() => { setTexto(EXEMPLOS[Math.floor(Math.random() * EXEMPLOS.length)]); setParsed(null); }} />
        </View>
      </Card>

      {parsed && (
        <Card style={{ borderColor: WMS.blueBorder }}>
          <SectionLabel>resultado do parse</SectionLabel>
          {[
            { key: 'código',      val: parsed.codigo },
            { key: 'descrição',   val: parsed.descricao || '—' },
            { key: 'localização', val: parsed.localizacao || '—' },
          ].map(row => (
            <View key={row.key} style={s.parsedRow}>
              <Text style={s.parsedKey}>{row.key}</Text>
              <Text style={s.parsedVal}>{row.val}</Text>
            </View>
          ))}
          <View style={[s.parsedRow, { marginTop: 4 }]}>
            <Text style={s.parsedKey}>status automático</Text>
            <Badge value={confianca >= 85 ? 'pendente' : 'divergencia'} type="status" />
          </View>
          <Text style={{ fontSize: 11, color: WMS.muted, marginTop: 10 }}>
            {confianca < 85 ? '⚠️ Confiança baixa → marcado como divergência' : '✓ Confiança ok → pendente de confirmação'}
          </Text>
          <Btn label="Registrar no inventário" variant="primary" onPress={registrar} style={{ marginTop: 14 }} fullWidth />
        </Card>
      )}

      {lastItem && (
        <Card style={{ borderColor: WMS.tealBorder }}>
          <SectionLabel>registrado</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Badge value="ocr"           type="tipo" />
            <Badge value={lastItem.status} type="status" />
          </View>
          <Text style={s.resCode}>{lastItem.codigo}</Text>
          {lastItem.descricao   ? <Text style={{ fontSize: 13, color: WMS.muted }}>{lastItem.descricao}</Text> : null}
          {lastItem.localizacao ? <Text style={{ fontSize: 12, color: WMS.muted }}>📍 {lastItem.localizacao}</Text> : null}
          {lastItem.confianca   ? <Text style={{ fontSize: 12, color: WMS.muted, marginTop: 4 }}>confiança: {lastItem.confianca}%</Text> : null}
        </Card>
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: WMS.bg },
  content:   { padding: 16, paddingBottom: 40 },
  scanBox:   { backgroundColor: WMS.surface2, borderRadius: 10, borderWidth: 1, borderColor: WMS.border, borderStyle: 'dashed', padding: 28, alignItems: 'center' },
  label:     { fontSize: 12, color: WMS.muted, marginBottom: 6 },
  input:     { backgroundColor: WMS.surface2, borderRadius: 8, borderWidth: 1, borderColor: WMS.border, padding: 11, fontSize: 13, color: '#ede9e3', marginBottom: 4 },
  chip:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: WMS.border, backgroundColor: WMS.surface2 },
  parsedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: WMS.border },
  parsedKey: { fontSize: 12, color: WMS.muted },
  parsedVal: { fontSize: 13, fontWeight: '500', color: '#ede9e3' },
  ocrOverlay:{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 60 },
  ocrFrame:  { borderWidth: 2, borderColor: WMS.teal, borderRadius: 10, width: 260, height: 120, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, marginBottom: 20 },
  captureBtn:{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureInner:{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff' },
  resCode:   { fontSize: 15, fontWeight: '600', color: '#ede9e3', marginBottom: 4 },
});