/**
 * Combat Event System
 * 
 * Clean pub/sub pattern to replace window global pollution.
 * Enables decoupled communication between Combat and Enemy systems.
 */

type DamageHandler = (enemyId: number, damage: number) => void
type AttackHandler = (position: { x: number; y: number; z: number }, range: number, damage: number) => void

class CombatEventBus {
  private damageHandlers: Set<DamageHandler> = new Set()
  private attackHandlers: Set<AttackHandler> = new Set()

  // Enemy system subscribes to receive damage events
  onDamageEnemy(handler: DamageHandler): () => void {
    this.damageHandlers.add(handler)
    return () => this.damageHandlers.delete(handler)
  }

  // Combat system publishes attack events
  onPlayerAttack(handler: AttackHandler): () => void {
    this.attackHandlers.add(handler)
    return () => this.attackHandlers.delete(handler)
  }

  // Called by combat system when player attacks
  emitPlayerAttack(position: { x: number; y: number; z: number }, range: number, damage: number): void {
    this.attackHandlers.forEach(handler => handler(position, range, damage))
  }

  // Called to damage a specific enemy
  emitDamageEnemy(enemyId: number, damage: number): void {
    this.damageHandlers.forEach(handler => handler(enemyId, damage))
  }

  // Cleanup all handlers
  clear(): void {
    this.damageHandlers.clear()
    this.attackHandlers.clear()
  }
}

// Singleton instance
export const combatEvents = new CombatEventBus()
