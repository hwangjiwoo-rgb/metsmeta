import { useMemo } from 'react'
import type { NoticeItem } from '../types/board'

type Props = {
  open: boolean
  onClose: () => void
  notices: NoticeItem[]
}

function parseDate(str: string) {
  const [y, m, d] = str.split('.').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function BoardOverlay({ open, onClose, notices }: Props) {
  const sorted = useMemo(
    () => [...notices].sort((a, b) => parseDate(b.date) - parseDate(a.date)),
    [notices]
  )

  if (!open) return null

  return (
    <div className="board-overlay" role="dialog" aria-modal="true" aria-labelledby="board-overlay-title">
      <button type="button" className="board-overlay-backdrop" aria-label="닫기" onClick={onClose} />
      <div className="board-overlay-panel">
        <div className="board-card">
          <header className="board-card-header">
            <h2 id="board-overlay-title">공지사항</h2>
            <button type="button" className="board-close-btn" onClick={onClose} aria-label="닫기">
              ×
            </button>
          </header>
          <p className="board-hint">Three.js 씬의 보라색 보드 클릭으로 열 수 있습니다. (기존 localStorage와 동일 키)</p>
          <ul className="board-list">
            {sorted.slice(0, 12).map((n) => (
              <li key={n.id} className="board-list-item">
                <span className="board-list-title">{n.title}</span>
                <span className="board-list-date">{n.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
