import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Dimensions, Vibration } from 'react-native';
import { useCapturaDeSonido } from '../../src/hooks/useCapturaDeSonido';

const { height, width } = Dimensions.get('window');

// --- CONSTANTES ---
const UMBRAL_COLAPSO_DB = -15;
const UMBRAL_INTENTA_DB = -35;
const UMBRAL_SUSURRO_DB = -50;
const TIEMPO_EVALUACION_MS = 1500;
const DURACION_ANIMACION_MS = 500;

export default function PantallaPrincipal() {
  const { nivelDeRuido, estaIniciada, iniciarMonitoreo } = useCapturaDeSonido();
  
  const [faseActual, setFaseActual] = useState('SILENCIO_TOTAL');
  const [faseAnterior, setFaseAnterior] = useState('SILENCIO_TOTAL');
  const picoRuidoRef = useRef(-160);

  // EFECTO 8: Transición de Color Reactiva
  const colorInterpolado = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (nivelDeRuido > picoRuidoRef.current) picoRuidoRef.current = nivelDeRuido;
  }, [nivelDeRuido]);

  useEffect(() => {
    const reloj = setInterval(() => {
      let faseObjetivo = 'SILENCIO_TOTAL';
      let valorColor = 0; // 0: Paz (Oscuro)
      
      if (picoRuidoRef.current > UMBRAL_COLAPSO_DB) {
        faseObjetivo = 'COLAPSO';
        valorColor = 2; // 2: Caos (Rojizo Tóxico)
      } else if (picoRuidoRef.current > UMBRAL_INTENTA_DB) {
        faseObjetivo = 'INTENTA';
        valorColor = 1; // 1: Intento (Violeta Medio)
      } else if (picoRuidoRef.current > UMBRAL_SUSURRO_DB) {
        faseObjetivo = '1 2 ..';
        valorColor = 0.5;
      }

      if (faseObjetivo !== faseActual) {
        setFaseAnterior(faseActual);
        setFaseActual(faseObjetivo);
        
        // Animamos el fondo
        Animated.timing(colorInterpolado, {
          toValue: valorColor,
          duration: 800,
          useNativeDriver: false // El color no soporta native driver
        }).start();
      }
      picoRuidoRef.current = -160;
    }, TIEMPO_EVALUACION_MS);

    return () => clearInterval(reloj);
  }, [faseActual, colorInterpolado]);

  // Motor de Vibración
  useEffect(() => {
    Vibration.cancel();
    if (faseActual === 'COLAPSO') Vibration.vibrate([0, 50, 100, 50, 100, 50, 200], true);
    else if (faseActual === 'INTENTA') Vibration.vibrate([0, 200, 300, 200, 800], true);
    else if (faseActual === 'SILENCIO_TOTAL') Vibration.vibrate(800);
    return () => Vibration.cancel();
  }, [faseActual]);

  const backgroundColor = colorInterpolado.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#05000a', '#1a002a', '#2a000d'] // Del abismo oscuro al rojo tóxico
  });

  return (
    <Animated.View style={[styles.contenedorPrincipal, { backgroundColor }]}>
      {!estaIniciada ? (
        <BotonParaIniciar alPresionar={iniciarMonitoreo} />
      ) : (
        <>
          <MotorEfectosDeFondo fase={faseActual} />
          <ContenedorAnimadoVertical faseActual={faseActual} faseAnterior={faseAnterior} />
        </>
      )}
    </Animated.View>
  );
}

// ============================================================================
// MOTORES DE EFECTOS VISUALES (1, 2, 4, 6, 10)
// ============================================================================

function MotorEfectosDeFondo({ fase }: { fase: string }) {
  // EFECTO 4: Viñeta Cinematográfica (Se cierra en el caos)
  const opacidadVineta = fase === 'SILENCIO_TOTAL' ? 0 : (fase === 'COLAPSO' ? 0.8 : 0.4);
  
  // EFECTO 2: Manchas de Tinta Blackwork
  const escalaTinta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(escalaTinta, {
      toValue: fase === 'COLAPSO' ? 25 : 0, // Crece masivamente
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fase, escalaTinta]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* EFECTO 10: Matrix (Lluvia de caracteres) */}
      {fase === 'COLAPSO' && <LluviaMatrix />}

      {/* EFECTO 2: Tinta (Círculos que se expanden desde las esquinas) */}
      <Animated.View style={[styles.manchaTinta, { top: -50, left: -50, transform: [{ scale: escalaTinta }] }]} />
      <Animated.View style={[styles.manchaTinta, { bottom: -50, right: -50, transform: [{ scale: escalaTinta }] }]} />

      {/* EFECTO 1: Ruido de Estática */}
      {fase === 'COLAPSO' && <EstaticaTV />}

      {/* EFECTO 4: Viñeta */}
      <View style={[styles.vinetaOverlay, { opacity: opacidadVineta }]} />
    </View>
  );
}

function EstaticaTV() {
  const opacidad = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 0.15, duration: 30, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.05, duration: 40, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.2, duration: 20, useNativeDriver: true }),
      ])
    ).start();
  }, [opacidad]);
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: opacidad }]} />;
}

function LluviaMatrix() {
  const scrollY = useRef(new Animated.Value(-height)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollY, { toValue: height, duration: 1500, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [scrollY]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.2, transform: [{ translateY: scrollY }] }]}>
      <Text style={styles.textoMatrix}>{"0 1 x 8 % 4 c a o s \n".repeat(40)}</Text>
    </Animated.View>
  );
}

function TextoNeonParpadeante({ children, estilo }: any) {
  // EFECTO 6: Neón Roto (Flicker)
  const opacidad = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.3, duration: 50, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.8, duration: 50, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.delay(400) // Queda prendido un rato y vuelve a fallar
      ])
    ).start();
  }, [opacidad]);
  return <Animated.View style={{ opacity: opacidad }}><Text style={estilo}>{children}</Text></Animated.View>;
}

// ============================================================================
// CORE ANIMADO (EFECTO 7: ESTELA FANTASMA Y SCROLL)
// ============================================================================

function ContenedorAnimadoVertical({ faseActual, faseAnterior }: any) {
  // Posiciones del texto principal
  const posYActual = useRef(new Animated.Value(height)).current; 
  const posYAnterior = useRef(new Animated.Value(0)).current; 
  
  // EFECTO 7: Posiciones de la Estela Fantasma (Motion Blur simulado)
  const posYFantasmaActual = useRef(new Animated.Value(height)).current; 
  const posYFantasmaAnterior = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    posYActual.setValue(height); 
    posYAnterior.setValue(0); 
    posYFantasmaActual.setValue(height);
    posYFantasmaAnterior.setValue(0);

    Animated.parallel([
      // Mensaje Viejo se va
      Animated.timing(posYAnterior, { toValue: -height, duration: DURACION_ANIMACION_MS, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      // Fantasma Viejo lo persigue con delay
      Animated.timing(posYFantasmaAnterior, { toValue: -height, duration: DURACION_ANIMACION_MS + 100, delay: 50, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      
      // Mensaje Nuevo entra
      Animated.timing(posYActual, { toValue: 0, duration: DURACION_ANIMACION_MS, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      // Fantasma Nuevo lo persigue con delay
      Animated.timing(posYFantasmaActual, { toValue: 0, duration: DURACION_ANIMACION_MS + 150, delay: 80, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true })
    ]).start();

  }, [faseActual]);

  return (
    <View style={styles.contenedorMente}>
      {/* Capas Fantasmas (Atrás, con menos opacidad) */}
      <CapaDeMensaje fase={faseAnterior} estiloAnimado={{ transform: [{ translateY: posYFantasmaAnterior }], opacity: 0.15 }} />
      <CapaDeMensaje fase={faseActual} estiloAnimado={{ transform: [{ translateY: posYFantasmaActual }], opacity: 0.15 }} />
      
      {/* Capas Principales (Adelante, sólidas) */}
      <CapaDeMensaje fase={faseAnterior} estiloAnimado={{ transform: [{ translateY: posYAnterior }] }} />
      <CapaDeMensaje fase={faseActual} estiloAnimado={{ transform: [{ translateY: posYActual }] }} />
    </View>
  );
}

// ============================================================================
// RENDERIZADO DE MENSAJES (EFECTO 5: TIPOGRAFÍA VARIABLE)
// ============================================================================

function CapaDeMensaje({ fase, estiloAnimado }: any) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.centro, estiloAnimado]}>
      {(() => {
        switch (fase) {
          case 'COLAPSO':
            return (
              <View style={styles.centro}>
                {/* EFECTO 5: Tipografía pesada (900) */}
                <Text style={[styles.textoCaos, { fontSize: 50, color: '#ff003c', fontWeight: '900' }]}>Desconexion</Text>
                <Text style={[styles.textoSubCaos, { fontWeight: '900' }]}>ESCAPA</Text>
              </View>
            );
          case 'INTENTA':
            return (
              <View style={styles.centro}>
                {/* EFECTO 6: Neón Roto aplicado acá */}
                <TextoNeonParpadeante estilo={[styles.textoCaos, { color: '#b052ff', fontWeight: '500' }]}>
                  GUARDAR LA CALMA
                </TextoNeonParpadeante>
                <Text style={styles.textoSubCaos}>aislate</Text>
              </View>
            );
          case '1 2 ..':
            return (
              <View style={styles.centro}>
                <Text style={[styles.textoPaz, { fontSize: 25, opacity: 0.5, fontWeight: '300' }]}>1... 2... 3...</Text>
              </View>
            );
          default: 
            return (
              <View style={styles.centro}>
                {/* EFECTO 5: Tipografía ultra ligera (100/200) */}
                <Text style={[styles.textoPaz, { fontWeight: '200' }]}>Respira la paz.</Text>
              </View>
            );
        }
      })()}
    </Animated.View>
  );
}

function BotonParaIniciar({ alPresionar }: { alPresionar: () => void }) {
  return (
    <TouchableOpacity style={styles.botonAccion} onPress={alPresionar}>
      <Text style={styles.textoBoton}>ENTRAR EN EL SILENCIO</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenedorMente: { flex: 1, width: '100%', position: 'relative' },
  centro: { alignItems: 'center', justifyContent: 'center' },
  
  // Estilos Base Textos
  textoCaos: { textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 },
  textoSubCaos: { color: '#b3b3b3', fontSize: 16, textAlign: 'center', marginTop: 10, letterSpacing: 4 },
  textoPaz: { color: '#fff', fontSize: 45, letterSpacing: 8, textAlign: 'center' },
  
  // Boton
  botonAccion: { backgroundColor: '#fff', padding: 20, borderRadius: 30, elevation: 5 },
  textoBoton: { color: '#000', fontWeight: 'bold', letterSpacing: 1 },
  
  // Estilos de Efectos
  vinetaOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.85)',
    borderRadius: 20 // Para redondear un poco la sombra interna
  },
  manchaTinta: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000', // Negro absoluto
  },
  textoMatrix: {
    color: '#8a2be2',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 35
  }
});