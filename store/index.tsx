import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────
export type ItemStatus = 'pendente' | 'ok' | 'divergencia';
export type ItemTipo   = 'qrcode' | 'ocr';

export interface Item {
  id: string;
  codigo: string;
  descricao: string;
  localizacao: string;
  tipo: ItemTipo;
  status: ItemStatus;
  confianca?: number;
  textoOriginal?: string;
  criadoEm: string;
}

export interface CreateItemDTO {
  codigo: string;
  descricao?: string;
  localizacao?: string;
  tipo: ItemTipo;
  status?: ItemStatus;
  confianca?: number;
  textoOriginal?: string;
}

// ─── Reducer ──────────────────────────────────────────────────
interface State { items: Item[]; loading: boolean }

type Action =
  | { type: 'LOAD'; payload: Item[] }
  | { type: 'ADD'; payload: Item }
  | { type: 'UPDATE_STATUS'; id: string; status: ItemStatus }
  | { type: 'DELETE'; id: string }
  | { type: 'CLEAR' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':   return { items: action.payload, loading: false };
    case 'ADD':    return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE_STATUS':
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, status: action.status } : i) };
    case 'DELETE': return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR':  return { ...state, items: [] };
    default:       return state;
  }
}

// ─── Context ──────────────────────────────────────────────────
interface StoreCtx {
  state: State;
  addItem: (dto: CreateItemDTO) => Item;
  updateStatus: (id: string, status: ItemStatus) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreCtx | null>(null);
const KEY = '@wms:items';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], loading: true });

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      dispatch({ type: 'LOAD', payload: raw ? JSON.parse(raw) : [] });
    });
  }, []);

  useEffect(() => {
    if (!state.loading) AsyncStorage.setItem(KEY, JSON.stringify(state.items));
  }, [state.items, state.loading]);

  function addItem(dto: CreateItemDTO): Item {
    const item: Item = {
      id: 'item-' + Date.now(),
      codigo: dto.codigo.trim(),
      descricao: dto.descricao?.trim() || '',
      localizacao: dto.localizacao?.trim() || '',
      tipo: dto.tipo,
      status: dto.status || 'pendente',
      confianca: dto.confianca,
      textoOriginal: dto.textoOriginal,
      criadoEm: new Date().toISOString(),
    };
    dispatch({ type: 'ADD', payload: item });
    return item;
  }

  return (
    <StoreContext.Provider value={{
      state,
      addItem,
      updateStatus: (id, status) => dispatch({ type: 'UPDATE_STATUS', id, status }),
      deleteItem: (id) => dispatch({ type: 'DELETE', id }),
      clearAll: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore fora do StoreProvider');
  return ctx;
}