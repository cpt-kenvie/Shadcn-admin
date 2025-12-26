import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { NewsItem } from '@/api/news'

type NewsDialogType = 'delete'

interface NewsContextType {
  open: NewsDialogType | null
  setOpen: (str: NewsDialogType | null) => void
  currentRow: NewsItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<NewsItem | null>>
}

const NewsContext = React.createContext<NewsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function NewsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<NewsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<NewsItem | null>(null)

  return (
    <NewsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </NewsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNews = () => {
  const newsContext = React.useContext(NewsContext)

  if (!newsContext) {
    throw new Error('useNews has to be used within <NewsContext>')
  }

  return newsContext
}
