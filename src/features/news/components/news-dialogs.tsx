import { useNews } from '../context/news-context'
import { NewsDeleteDialog } from './news-delete-dialog'

export function NewsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useNews()

  return (
    currentRow ? (
      <NewsDeleteDialog
        key={`news-delete-${currentRow.id}`}
        open={open === 'delete'}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 500)
          }
        }}
        current={currentRow}
      />
    ) : null
  )
}
