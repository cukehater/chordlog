import { describe, expect, it } from 'vitest'

import { withContentKeys } from './content-keys'

describe('withContentKeys', () => {
  it('반복되는 내용에 순번을 붙여 key가 겹치지 않는다', () => {
    const keys = withContentKeys(['E', 'A', 'D', 'G', 'B', 'E'], (n) => n).map((x) => x.key)
    expect(keys).toEqual(['E', 'A', 'D', 'G', 'B', 'E#1'])
  })

  it('원래 항목을 순서대로 돌려준다', () => {
    const items = [{ v: 1 }, { v: 2 }]
    expect(withContentKeys(items, () => 'same').map((x) => x.item)).toEqual(items)
  })
})
