/**
 * Sound Manager - Rivers of Reckoning
 * 
 * Simple wrapper for playing game sounds and music.
 */

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private music: HTMLAudioElement | null = null
  private enabled: boolean = true

  loadSound(name: string, url: string) {
    const audio = new Audio(url)
    this.sounds.set(name, audio)
  }

  playSound(name: string) {
    if (!this.enabled) return
    const sound = this.sounds.get(name)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(e => console.warn(`Failed to play sound: ${name}`, e))
    }
  }

  playMusic(url: string) {
    if (!this.enabled) return
    if (this.music) {
      this.music.pause()
    }
    this.music = new Audio(url)
    this.music.loop = true
    this.music.play().catch(e => console.warn(`Failed to play music: ${url}`, e))
  }

  toggle(enabled: boolean) {
    this.enabled = enabled
    if (!enabled && this.music) {
      this.music.pause()
    } else if (enabled && this.music) {
      this.music.play()
    }
  }
}

export const soundManager = new SoundManager()
