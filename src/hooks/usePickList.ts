import { useState, useEffect } from 'react'

// ─── 교체 지점 ────────────────────────────────────────────────────────────────
// 실제 API 연동 시 _ids 초기값을 getPickList() fetch로, toggle/remove를
// addToPick()/removeFromPick() API 호출로 교체하면 됩니다.
// ─────────────────────────────────────────────────────────────────────────────

let _ids: string[] = []
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach((l) => l())
}

export function usePickList() {
  const [ids, setIds] = useState(() => [..._ids])

  useEffect(() => {
    const update = () => setIds([..._ids])
    _listeners.add(update)
    return () => { _listeners.delete(update) }
  }, [])

  const toggle = (dropId: string) => {
    _ids = _ids.includes(dropId)
      ? _ids.filter((id) => id !== dropId)
      : [..._ids, dropId]
    notify()
  }

  const remove = (dropId: string) => {
    _ids = _ids.filter((id) => id !== dropId)
    notify()
  }

  return { ids, toggle, remove }
}
