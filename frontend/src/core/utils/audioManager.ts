/**
 * Audio Manager - Handle ringtones and notification sounds
 */

class AudioManager {
    private ringtoneAudio: HTMLAudioElement | null = null;
    private notificationAudio: HTMLAudioElement | null = null;

    constructor() {
        // Create audio elements
        this.ringtoneAudio = new Audio();
        this.ringtoneAudio.loop = true;
        this.ringtoneAudio.volume = 0.7;

        this.notificationAudio = new Audio();
        this.notificationAudio.volume = 0.5;
    }

    // Play ringtone for incoming/outgoing calls
    playRingtone() {
        if (!this.ringtoneAudio) return;

        // Use a data URL for a simple ringtone (beep pattern)
        this.ringtoneAudio.src = this.generateRingtone();
        this.ringtoneAudio.play().catch(e => console.warn('Ringtone play failed:', e));
    }

    // Stop ringtone
    stopRingtone() {
        if (this.ringtoneAudio) {
            this.ringtoneAudio.pause();
            this.ringtoneAudio.currentTime = 0;
        }
    }

    // Play notification sound for messages
    playNotification() {
        if (!this.notificationAudio) return;

        this.notificationAudio.src = this.generateNotificationSound();
        this.notificationAudio.play().catch(e => console.warn('Notification sound failed:', e));
    }

    // Generate ringtone using Web Audio API
    private generateRingtone(): string {
        // Simple beep pattern - returns data URL
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 1.5;
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        // Generate beep pattern (440Hz + 880Hz)
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            if (t < 0.3 || (t > 0.5 && t < 0.8)) {
                data[i] = Math.sin(2 * Math.PI * 440 * t) * 0.3 + Math.sin(2 * Math.PI * 880 * t) * 0.2;
            } else {
                data[i] = 0;
            }
        }

        // Convert to WAV data URL
        return this.bufferToWav(buffer);
    }

    // Generate notification sound
    private generateNotificationSound(): string {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 0.3;
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        // Quick notification beep (800Hz)
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.5;
        }

        return this.bufferToWav(buffer);
    }

    // Convert AudioBuffer to WAV data URL
    private bufferToWav(buffer: AudioBuffer): string {
        const length = buffer.length * buffer.numberOfChannels * 2;
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;

        // Write WAV header
        const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
        const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

        setUint32(0x46464952); // "RIFF"
        setUint32(36 + length); // file length
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16); // chunk size
        setUint16(1); // PCM
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
        setUint16(buffer.numberOfChannels * 2);
        setUint16(16); // bits per sample
        setUint32(0x61746164); // "data"
        setUint32(length);

        // Write audio data
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (pos < arrayBuffer.byteLength) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                const sample = Math.max(-1, Math.min(1, channels[i][offset]));
                view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                pos += 2;
            }
            offset++;
        }

        // Convert to base64 data URL
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }
}

export const audioManager = new AudioManager();
