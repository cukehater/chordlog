import type { BlockType } from '../model/types'

export const strumBlocks = (blocks: BlockType[]) => {
  return blocks.filter((b): b is Extract<BlockType, { k: 'strum' }> => b.k === 'strum')
}

export const patternName = (index: number): string => {
  return `패턴 ${String.fromCharCode(65 + index)}`
}
