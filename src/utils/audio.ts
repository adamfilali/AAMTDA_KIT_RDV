/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Synthetic classic telephone "ring-ring" bell sound using Web Audio API
export function playPhoneRingSound() {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // We will simulate 2 sequential "ring-ring" bursts with rapid clapper impacts (bell pulses)
    const bursts = [0, 0.4]; // Start times of the two rings in the "ring-ring" cycle

    bursts.forEach((burstStart) => {
      const numPulses = 12; // Rapid strikes to sound like a metal bell
      for (let i = 0; i < numPulses; i++) {
        const pulseStart = now + burstStart + (i * 0.025);
        const pulseDuration = 0.015; // Fast metal strikes

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Standard classic telephone ring is dual-tone multi-frequency around 853Hz and 960Hz
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(853, pulseStart);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(960, pulseStart);

        gainNode.gain.setValueAtTime(0, pulseStart);
        gainNode.gain.linearRampToValueAtTime(0.08, pulseStart + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, pulseStart + pulseDuration);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(pulseStart);
        osc2.start(pulseStart);

        osc1.stop(pulseStart + pulseDuration);
        osc2.stop(pulseStart + pulseDuration);
      }
    });
  } catch (error) {
    console.warn("Web Audio API not supported or interaction block", error);
  }
}

// Synthetic modern premium double-ping "chime" sound using Web Audio API for WhatsApp hover
export function playPremiumChimeSound() {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First ping (higher frequency, short decay)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.50, now); // C6 note
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Second ping (slightly delayed, harmonized E6 note)
    const delay = 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + delay); // E6 note
    gain2.gain.setValueAtTime(0, now + delay);
    gain2.gain.linearRampToValueAtTime(0.04, now + delay + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.26);

  } catch (error) {
    console.warn("Web Audio API not supported or blocked", error);
  }
}

