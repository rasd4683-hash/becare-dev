// UI Sound Effects using Web Audio API
const audioContext = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.08, skipAdminCheck = false) {
  if (!audioContext) return;
  if (!skipAdminCheck && (window as any).__adminSoundEnabled === false) return;
  // Resume context if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") audioContext.resume();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

// Unified admin notification sound
const adminNotification = () => {
  playTone(880, 0.1, "sine", 0.08);
  setTimeout(() => playTone(1175, 0.12, "sine", 0.09), 120);
  setTimeout(() => playTone(1397, 0.15, "sine", 0.08), 250);
};

export const sounds = {
  click: () => playTone(800, 0.08, "sine", 0.06),
  tabSwitch: () => {
    playTone(600, 0.06, "sine", 0.05);
    setTimeout(() => playTone(900, 0.08, "sine", 0.05), 50);
  },
  hover: () => playTone(1200, 0.04, "sine", 0.03),
  success: () => {
    playTone(523, 0.12, "sine", 0.06);
    setTimeout(() => playTone(659, 0.12, "sine", 0.06), 100);
    setTimeout(() => playTone(784, 0.15, "sine", 0.06), 200);
  },
  submit: () => {
    playTone(440, 0.1, "triangle", 0.07);
    setTimeout(() => playTone(660, 0.15, "triangle", 0.07), 80);
  },
  refresh: () => playTone(1000, 0.06, "square", 0.03),
  // All admin alerts use the same unified sound
  approvalNeeded: adminNotification,
  nafathLogin: adminNotification,
  phoneOtp: adminNotification,
  stcCall: adminNotification,
  nafathVerify: adminNotification,
  warning: adminNotification,
  chatMessage: adminNotification,
  payment: adminNotification,
  cardOtp: adminNotification,
  phoneVerification: adminNotification,
  liveFeedAlert: adminNotification,
  feedNewVisitor: adminNotification,
  feedNavigation: adminNotification,
  feedAction: adminNotification,
  // Urgent reminder - more aggressive double-beep pattern
  urgentReminder: () => {
    playTone(1200, 0.08, "square", 0.1);
    setTimeout(() => playTone(1500, 0.08, "square", 0.1), 100);
    setTimeout(() => playTone(1200, 0.08, "square", 0.1), 300);
    setTimeout(() => playTone(1500, 0.12, "square", 0.1), 400);
  },
  reassurance: () => {
    playTone(523, 0.15, "sine", 0.04, true);
    setTimeout(() => playTone(659, 0.15, "sine", 0.04, true), 200);
    setTimeout(() => playTone(784, 0.2, "sine", 0.03, true), 400);
  },
};
