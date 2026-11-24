import Link from 'next/link'

import { splitName } from '@/shared/config'

export const Wordmark = () => {
  const [head, tail] = splitName()
  return (
    <Link
      className="no-underline text-ink font-display text-[22px] font-semibold tracking-[-0.03em]"
      href="/songs"
    >
      {head}
      {tail ? <span className="font-medium italic text-accent">{tail}</span> : null}
    </Link>
  )
}
