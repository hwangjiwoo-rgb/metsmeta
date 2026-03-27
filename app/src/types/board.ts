export type NoticeItem = {
  id: number
  title: string
  content: string
  date: string
  pinned: boolean
}

export type FreePost = {
  id: number
  title: string
  content: string
  date: string
}

export type BoardStorage = {
  notices: NoticeItem[]
  freePosts: FreePost[]
  nextNoticeId: number
  nextFreeId: number
}
