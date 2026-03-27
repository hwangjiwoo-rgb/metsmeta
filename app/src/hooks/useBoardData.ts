import { useCallback, useEffect, useState } from 'react'
import type { BoardStorage, FreePost, NoticeItem } from '../types/board'

const STORAGE_KEY = 'metsmeta_board'

const defaultNotices: NoticeItem[] = [
  { id: 1, title: '회의실 예약 방법', content: '회의실 예약은 메타버스에서 가능합니다.', date: '2026.03.09', pinned: true },
  { id: 2, title: '법인카드 비용 신청 방법', content: '법인카드는 재무팀 승인 후 발급됩니다.', date: '2026.03.09', pinned: true },
  { id: 3, title: '사내 사이트 접근 권한 신청 방법', content: 'IT팀에 요청하세요.', date: '2026.03.09', pinned: true },
]

const defaultFree: FreePost[] = [
  { id: 101, title: '점심 메뉴 추천', content: '오늘 점심 뭐 드실래요?', date: '2026.03.09' },
]

function load(): BoardStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as Partial<BoardStorage>
      return {
        notices: Array.isArray(data.notices) ? data.notices : [...defaultNotices],
        freePosts: Array.isArray(data.freePosts) ? data.freePosts : [...defaultFree],
        nextNoticeId: typeof data.nextNoticeId === 'number' ? data.nextNoticeId : 10,
        nextFreeId: typeof data.nextFreeId === 'number' ? data.nextFreeId : 200,
      }
    }
  } catch {
    /* ignore */
  }
  return {
    notices: [...defaultNotices],
    freePosts: [...defaultFree],
    nextNoticeId: 10,
    nextFreeId: 200,
  }
}

function save(data: BoardStorage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function useBoardData() {
  const [state, setState] = useState<BoardStorage>(() => load())

  useEffect(() => {
    save(state)
  }, [state])

  const refresh = useCallback(() => setState(load()), [])

  return { notices: state.notices, freePosts: state.freePosts, state, setState, refresh }
}
