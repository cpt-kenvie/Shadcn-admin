import { useEffect } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type MarkdownEditorProps = {
  value: string
  onValueChange: (value: string) => void
  height?: number
  containerClassName?: string
  disabled?: boolean
  placeholder?: string
}

type MarkdownStorage = {
  markdown?: { getMarkdown: () => string }
}

function getMarkdownFromEditor(editor: Editor) {
  const storage = editor.storage as unknown as MarkdownStorage
  return storage.markdown?.getMarkdown() ?? ''
}

function ToolbarButton({
  label,
  onClick,
  icon,
  active,
  disabled,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant={active ? 'secondary' : 'ghost'}
          size='icon'
          className='h-8 w-8'
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function EditorToolbar({ editor, disabled }: { editor: ReturnType<typeof useEditor>; disabled?: boolean }) {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('输入图片URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addLink = () => {
    const url = window.prompt('输入链接URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className='flex flex-wrap items-center gap-1 border-b bg-muted/20 px-2 py-1.5'>
        <ToolbarButton
          label='撤销'
          onClick={() => editor.chain().focus().undo().run()}
          icon={<Undo className='h-4 w-4' />}
          disabled={disabled || !editor.can().undo()}
        />
        <ToolbarButton
          label='重做'
          onClick={() => editor.chain().focus().redo().run()}
          icon={<Redo className='h-4 w-4' />}
          disabled={disabled || !editor.can().redo()}
        />
        <Separator orientation='vertical' className='mx-1 h-5' />
        <ToolbarButton
          label='一级标题'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={<Heading1 className='h-4 w-4' />}
          active={editor.isActive('heading', { level: 1 })}
          disabled={disabled}
        />
        <ToolbarButton
          label='二级标题'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={<Heading2 className='h-4 w-4' />}
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
        />
        <ToolbarButton
          label='三级标题'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={<Heading3 className='h-4 w-4' />}
          active={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
        />
        <Separator orientation='vertical' className='mx-1 h-5' />
        <ToolbarButton
          label='加粗'
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold className='h-4 w-4' />}
          active={editor.isActive('bold')}
          disabled={disabled}
        />
        <ToolbarButton
          label='斜体'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic className='h-4 w-4' />}
          active={editor.isActive('italic')}
          disabled={disabled}
        />
        <ToolbarButton
          label='删除线'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<Strikethrough className='h-4 w-4' />}
          active={editor.isActive('strike')}
          disabled={disabled}
        />
        <ToolbarButton
          label='行内代码'
          onClick={() => editor.chain().focus().toggleCode().run()}
          icon={<Code className='h-4 w-4' />}
          active={editor.isActive('code')}
          disabled={disabled}
        />
        <Separator orientation='vertical' className='mx-1 h-5' />
        <ToolbarButton label='链接' onClick={addLink} icon={<Link2 className='h-4 w-4' />} disabled={disabled} />
        <ToolbarButton label='图片' onClick={addImage} icon={<ImageIcon className='h-4 w-4' />} disabled={disabled} />
        <Separator orientation='vertical' className='mx-1 h-5' />
        <ToolbarButton
          label='引用'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<Quote className='h-4 w-4' />}
          active={editor.isActive('blockquote')}
          disabled={disabled}
        />
        <ToolbarButton
          label='无序列表'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List className='h-4 w-4' />}
          active={editor.isActive('bulletList')}
          disabled={disabled}
        />
        <ToolbarButton
          label='有序列表'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<ListOrdered className='h-4 w-4' />}
          active={editor.isActive('orderedList')}
          disabled={disabled}
        />
      </div>
    </TooltipProvider>
  )
}

export function MarkdownEditor({
  value,
  onValueChange,
  height = 420,
  containerClassName,
  disabled,
  placeholder = '输入内容...',
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onValueChange(getMarkdownFromEditor(editor))
    },
  })

  useEffect(() => {
    if (editor && value !== getMarkdownFromEditor(editor)) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  return (
    <div className={cn('rounded-md border bg-card', containerClassName)}>
      <EditorToolbar editor={editor} disabled={disabled} />
      <EditorContent
        editor={editor}
        className='p-4'
        style={{ minHeight: height }}
      />
    </div>
  )
}
