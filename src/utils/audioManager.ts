/**
 * AudioManager - Simple Web Audio API based synthesizer for retro sounds
 * Falls back to loading files from /assets/sounds/ and /assets/music/
 */

class AudioManager {
  private ctx: AudioContext | null = null
  private musicBuffer: AudioBuffer | null = null
  private musicSource: AudioBufferSourceNode | null = null

  constructor() {
    // Audio context is initialized on first user interaction
  }

  private init() {
    if (this.ctx) return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      this.ctx = new AudioContextClass()
    }
  }

  // Synthesize a simple retro sound
  private playSynthSound(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration)

    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + duration)

    // Cleanup to prevent memory leaks
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }

  // Sound Effects
  playMove() {
    this.playSynthSound(150, 'square', 0.1, 0.05)
  }

  playDamage() {
    this.playSynthSound(100, 'sawtooth', 0.3, 0.2)
  }

  playPickup() {
    this.playSynthSound(600, 'sine', 0.2, 0.1)
    setTimeout(() => this.playSynthSound(800, 'sine', 0.2, 0.1), 100)
  }

  playClick() {
    this.playSynthSound(400, 'triangle', 0.05, 0.1)
  }

  // Music support (placeholders for now)
  async playMusic(url: string) {
    this.init()
    if (!this.ctx) return

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Music file not found')
      const arrayBuffer = await response.arrayBuffer()
      this.musicBuffer = await this.ctx.decodeAudioData(arrayBuffer)
      
      this.stopMusic()
      this.musicSource = this.ctx.createBufferSource()
      this.musicSource.buffer = this.musicBuffer
      this.musicSource.loop = true
      this.musicSource.connect(this.ctx.destination)
      this.musicSource.start()
    } catch (_e) {
      console.warn('Music playback failed, using synth fallback', _e)
      // No synth fallback for music yet
    }
  }

  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop()
      } catch (_e) {
        // Already stopped or not started
      }
      this.musicSource.disconnect()
      this.musicSource = null
    }
  }

  async resume() {
    this.init()
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
  }
}

export const audioManager = new AudioManager()
