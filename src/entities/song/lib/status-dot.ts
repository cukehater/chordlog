import type { SongStatusType } from '../model/types'

export const DOT: Record<SongStatusType, string> = {
  practicing: 'bg-accent',
  done: 'bg-done',
  archived: 'bg-archived',
}
