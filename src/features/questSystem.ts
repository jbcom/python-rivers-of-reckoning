import { Quest, QuestType } from '../types/game'

export const generateQuest = (level: number, seed: number): Quest => {
  const types = [QuestType.SLAY, QuestType.EXPLORE]
  const type = types[seed % types.length]
  
  const id = `quest_${seed}_${Date.now()}`
  
  if (type === QuestType.SLAY) {
    const target = 5 + Math.floor(level * 1.5)
    return {
      id,
      title: 'Monster Hunter',
      description: `Defeat ${target} enemies in the wilderness.`,
      type,
      target,
      progress: 0,
      rewardGold: 50 * level,
      rewardExp: 100 * level,
      isCompleted: false,
    }
  } else {
    const target = 500 + level * 200
    return {
      id,
      title: 'Pathfinder',
      description: `Explore the world for ${target} meters.`,
      type,
      target,
      progress: 0,
      rewardGold: 40 * level,
      rewardExp: 80 * level,
      isCompleted: false,
    }
  }
}
