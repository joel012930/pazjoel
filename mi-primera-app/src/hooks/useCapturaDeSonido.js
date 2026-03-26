import { useState } from 'react';
import { Audio } from 'expo-av';

export function useCapturaDeSonido() {
  const [nivelDeRuido, setNivelDeRuido] = useState(-160);
  const [estaIniciada, setEstaIniciada] = useState(false);

  async function iniciarMonitoreo() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;

    setEstaIniciada(true);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    
    await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (estado) => {
        if (estado.metering) setNivelDeRuido(estado.metering);
      },
      100
    );
  }

  return { nivelDeRuido, estaIniciada, iniciarMonitoreo };
}