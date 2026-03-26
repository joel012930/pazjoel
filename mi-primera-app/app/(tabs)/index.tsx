import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useCapturaDeSonido } from '../../src/hooks/useCapturaDeSonido';

const COLOR_FONDO_VIOLETA = '#0a001a';

// --- CONSTANTES DE NEGOCIO (Clean Code V2.0 - Punto 3.2) ---
const UMBRAL_COLAPSO_DB = -15;
const UMBRAL_INTENTA_DB = -35;
const UMBRAL_SUSURRO_DB = -50;

export default function PantallaPrincipal() {
  const { nivelDeRuido, estaIniciada, iniciarMonitoreo } = useCapturaDeSonido();

  let faseActual = 'SILENCIO_TOTAL'; 
  
  if (nivelDeRuido > UMBRAL_COLAPSO_DB) {
    faseActual = 'COLAPSO'; 
  } else if (nivelDeRuido > UMBRAL_INTENTA_DB) {
    faseActual = 'INTENTA';    
  } else if (nivelDeRuido > UMBRAL_SUSURRO_DB) {
    faseActual = '1 2 ..';      
  }

  return (
    <View style={styles.contenedorPrincipal}>
      {!estaIniciada ? (
        <BotonParaIniciar alPresionar={iniciarMonitoreo} />
      ) : (
        <ContenedorDeMensajes fase={faseActual} intensidad={nivelDeRuido} />
      )}
    </View>
  );
}

interface BotonProps {
  alPresionar: () => void;
}

interface ContenedorProps {
  fase: string;
  intensidad: number;
}

function BotonParaIniciar({ alPresionar }: BotonProps) {
  return (
    <TouchableOpacity style={styles.botonAccion} onPress={alPresionar}>
      <Text style={styles.textoBoton}>ENTRAR EN EL SILENCIO</Text>
    </TouchableOpacity>
  );
}

function ContenedorDeMensajes({ fase, intensidad }: ContenedorProps) {
  const opacidadDinamica = (intensidad + 160) / 100;

  switch (fase) {
    case 'COLAPSO':
      return (
        <View style={styles.centro}>
          <Text style={[styles.textoCaos, { fontSize: 50, color: '#ff003c' }]}>Desconexion</Text>
          <Text style={styles.textoSubCaos}>ESCAPA</Text>
        </View>
      );
    case 'INTENTA':
      return (
        <View style={[styles.centro, { opacity: opacidadDinamica }]}>
          <Text style={[styles.textoCaos, { color: '#8a2be2' }]}>GUARDAR LA CALMA</Text>
          <Text style={styles.textoSubCaos}>aislate</Text>
        </View>
      );
    case '1 2 ..':
      return (
        <View style={styles.centro}>
          {/* ACÁ ESTÁ EL CAMBIO: Ahora sí dice 1... 2... 3... */}
          <Text style={[styles.textoPaz, { fontSize: 25, opacity: 0.5 }]}>1... 2... 3...</Text>
        </View>
      );
    default: 
      return (
        <View style={styles.centro}>
          <Text style={styles.textoPaz}>Respira la paz.</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  contenedorPrincipal: { 
    flex: 1, 
    backgroundColor: COLOR_FONDO_VIOLETA, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  centro: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  botonAccion: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 30, 
    elevation: 5 
  },
  textoBoton: { 
    color: '#000', 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
  textoCaos: { 
    fontSize: 40, 
    fontWeight: '900', 
    textAlign: 'center', 
    textTransform: 'uppercase' 
  },
  textoSubCaos: { 
    color: '#b3b3b3', 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 10, 
    letterSpacing: 2 
  },
  textoPaz: { 
    color: '#fff', 
    fontSize: 45, 
    fontWeight: '200', 
    letterSpacing: 8, 
    textAlign: 'center' 
  }
});