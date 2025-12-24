import { EventType, RandomEvent } from '../types/game'

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'divine_blessing',
    title: 'Divine Blessing',
    description: 'A mysterious light shines upon you, restoring your health.',
    type: EventType.BOON,
    onTrigger: (store) => {
      store.healPlayer(50)
    },
  },
  {
    id: 'bandits_ambush',
    title: 'Bandit Ambush',
    description: 'A group of bandits attacks you! You lose some gold.',
    type: EventType.BANE,
    onTrigger: (store) => {
      store.addGold(-20)
    },
  },
  {
    id: 'hidden_treasure',
    title: 'Hidden Treasure',
    description: 'You found a chest buried in the ground!',
    type: EventType.TREASURE,
    onTrigger: (store) => {
      store.addGold(100)
    },
  },
]

export const triggerRandomEvent = (store: any) => {
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]
  event.onTrigger(store)
  return event
}
