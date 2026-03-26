import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useStore } from '@/store';
import { WMS } from '@/constants/theme';
import { Card, SectionLabel, Btn, Badge } from '@/components/wms/ui';

const EXEMPLOS = [
  { codigo: 'PROD-001', descricao: 'Caixa de parafusos M6', localizacao: 'Prateleira A3' },
  { codigo: 'PROD-042', descricao: 'Motor elétrico 2cv',    localizacao: 'Galpão B - Setor 2' },
  { codigo: 'MAT-007', descricao: 'Tubo de PVC 100mm',     localizacao: 'Corredor C5' },
  { codigo: 'EQ-155',  descricao: 'Sensor de temperatura',  localizacao: 'Depósito D1' },
];

export default function QRCodeScreen() {
  const { addItem } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned,  setScanned]  = useState(false);
  const [codigo,      setCodigo]      = useState('');
  const [descricao,   setDescricao]   = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [lastItem, setLastItem] = useState<ReturnType<typeof addItem> | null>(null);

  async function abrirCamera() {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Permissão necessária', 'Permita o acesso à câmera.'); return; }
    }
    setScanned(false);
    setScanning(true);
  }

  function handleScan({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    setScanning(false);
    setCodigo(data);
  }

  function exemplo() {
    const e = EXEMPLOS[Math.floor(Math.random() * EXEMPLOS.length)];
    setCodigo(e.codigo); setDescricao(e.descricao); setLocalizacao(e.localizacao);
  }

  function registrar() {
    if (!codigo.trim()) { Alert.alert('Código obrigatório'); return; }
    const item = addItem({ codigo, descricao, localizacao, tipo: 'qrcode' });
    setLastItem(item);
    setCodigo(''); setDescricao(''); setLocalizacao(''); setScanned(false);
  }

  if (scanning) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleScan}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'ean13'] }}
        />
        {/* Viewfinder corners */}
        <View style={s.vf}>
          <View style={[s.corner, s.tl]} /><View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} /><View style={[s.corner, s.br]} />
        </View>
        <View style={s.scanBottom}>
          <Text style={s.scanHint}>Aponte para um QR Code</Text>
          <TouchableOpacity onPress={() => setScanning(false)} style={s.cancelBtn}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Card>
        <SectionLabel>câmera</SectionLabel>
        <TouchableOpacity style={s.scanBox} onPress={abrirCamera} activeOpacity={0.8}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>⬛</Text>
          <Text style={{ fontSize: 13, color: WMS.muted, textAlign: 'center' }}>
            {scanned ? '✓ QR Code lido — confira os dados abaixo' : 'Toque para abrir a câmera'}
          </Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <SectionLabel>dados do item</SectionLabel>
        <Text style={s.label}>Código *</Text>
        <TextInput style={s.input} value={codigo} onChangeText={setCodigo} placeholder="ex: PROD-001" placeholderTextColor={WMS.muted} autoCapitalize="characters" />
        <Text style={s.label}>Descrição</Text>
        <TextInput style={s.input} value={descricao} onChangeText={setDescricao} placeholder="ex: Caixa de parafusos M6" placeholderTextColor={WMS.muted} />
        <Text style={s.label}>Localização</Text>
        <TextInput style={s.input} value={localizacao} onChangeText={setLocalizacao} placeholder="ex: Prateleira A3" placeholderTextColor={WMS.muted} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Btn label="Registrar" variant="primary" onPress={registrar} style={{ flex: 1 }} />
          <Btn label="Exemplo"   onPress={exemplo} />
        </View>
      </Card>

      {lastItem && (
        <Card style={{ borderColor: WMS.tealBorder }}>
          <SectionLabel>registrado</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <Badge value="qrcode"        type="tipo" />
            <Badge value={lastItem.status} type="status" />
          </View>
          <Text style={s.resCode}>{lastItem.codigo}</Text>
          {lastItem.descricao   ? <Text style={s.resDesc}>  {lastItem.descricao}</Text> : null}
          {lastItem.localizacao ? <Text style={s.resLocal}>📍 {lastItem.localizacao}</Text> : null}
        </Card>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: WMS.bg },
  content:   { padding: 16, paddingBottom: 40 },
  scanBox:   { backgroundColor: WMS.surface2, borderRadius: 10, borderWidth: 1, borderColor: WMS.border, borderStyle: 'dashed', padding: 32, alignItems: 'center' },
  label:     { fontSize: 12, color: WMS.muted, marginBottom: 6, marginTop: 10 },
  input:     { backgroundColor: WMS.surface2, borderRadius: 8, borderWidth: 1, borderColor: WMS.border, padding: 11, fontSize: 14, color: '#ede9e3' },
  // camera overlay
  vf:        { position: 'absolute', top: '30%', left: '20%', right: '20%', bottom: '30%' },
  corner:    { position: 'absolute', width: 24, height: 24 },
  tl:        { top: 0, left: 0,   borderTopWidth: 3, borderLeftWidth: 3,  borderColor: '#fff', borderRadius: 2 },
  tr:        { top: 0, right: 0,  borderTopWidth: 3, borderRightWidth: 3, borderColor: '#fff', borderRadius: 2 },
  bl:        { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3,  borderColor: '#fff', borderRadius: 2 },
  br:        { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#fff', borderRadius: 2 },
  scanBottom:{ position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', gap: 16 },
  scanHint:  { color: '#fff', fontSize: 15, fontWeight: '500' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  resCode:   { fontSize: 15, fontWeight: '600', color: '#ede9e3', marginBottom: 4 },
  resDesc:   { fontSize: 13, color: WMS.muted },
  resLocal:  { fontSize: 12, color: WMS.muted, marginTop: 2 },
});