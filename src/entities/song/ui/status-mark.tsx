import { DOT } from '../lib/status-dot'
import { type SongStatusType, STATUS_LABEL } from '../model/types'

export const StatusMark = ({
  status,
  variant = 'row',
}: {
  status: SongStatusType
  variant?: 'row' | 'pill'
}) => {
  const dot = <span data-dot className={`w-[6px] h-[6px] rounded-full ${DOT[status]}`} />
  const text = STATUS_LABEL[status]

  if (variant === 'pill') {
    return (
      <span className="flex items-center gap-[7px] text-[12px] text-ink-2 border border-line-chip rounded-pill px-[11px] py-[4px]">
        {dot}
        {text}
      </span>
    )
  }
  return (
    <span
      className={`flex items-center gap-2 text-[12.5px] ${status === 'archived' ? 'text-ink-4' : 'text-ink-2'}`}
    >
      {dot}
      {text}
    </span>
  )
}
