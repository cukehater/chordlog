/** 내용으로 React key를 만든다. 같은 내용이 반복되면 `#1`, `#2`를 붙여 겹치지 않게 한다. */
export const withContentKeys = <T>(items: readonly T[], toKey: (item: T) => string) => {
  const seen = new Map<string, number>()
  return items.map((item) => {
    const base = toKey(item)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return { item, key: count ? `${base}#${count}` : base }
  })
}
