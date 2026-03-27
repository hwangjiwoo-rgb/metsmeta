import { useCallback, useEffect, useState } from 'react'
import { BoardOverlay } from './components/BoardOverlay'
import { MetaScene } from './components/MetaScene'
import { useBoardData } from './hooks/useBoardData'
import './App.css'

function shouldOpenBoardFromUrl() {
  if (window.location.hash.toLowerCase() === '#board') return true
  const q = new URLSearchParams(window.location.search)
  return q.get('board') === '1' || q.get('board') === 'true' || q.get('view') === 'board'
}

export default function App() {
  const { notices } = useBoardData()
  const [boardOpen, setBoardOpen] = useState(false)

  const openBoard = useCallback(() => setBoardOpen(true), [])
  const closeBoard = useCallback(() => {
    setBoardOpen(false)
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    params.delete('board')
    params.delete('view')
    const qs = params.toString()
    const base = qs ? `${path}?${qs}` : path
    window.history.replaceState(null, '', base)
    if (window.location.hash) window.history.replaceState(null, '', base)
  }, [])

  useEffect(() => {
    if (shouldOpenBoardFromUrl()) setBoardOpen(true)
  }, [])

  useEffect(() => {
    const onHash = () => {
      if (shouldOpenBoardFromUrl()) setBoardOpen(true)
      else setBoardOpen(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="app-root">
      <MetaScene onOpenBoard={openBoard} />
      <BoardOverlay open={boardOpen} onClose={closeBoard} notices={notices} />
      <div className="app-hud">
        <button type="button" className="hud-open-board" onClick={openBoard}>
          게시판 열기 (테스트)
        </button>
      </div>
    </div>
  )
}
