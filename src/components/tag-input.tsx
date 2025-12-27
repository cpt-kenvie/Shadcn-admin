import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = '输入标签后按回车添加',
  className,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredSuggestions = Array.isArray(suggestions)
    ? suggestions.filter((s) => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()))
    : []

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
      setOpen(false)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <Popover open={open && filteredSuggestions.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-1 focus-within:ring-ring',
            className
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((tag) => (
            <Badge key={tag} variant='secondary' className='gap-1 pr-1'>
              {tag}
              <button
                type='button'
                className='rounded-full hover:bg-muted-foreground/20'
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
              >
                <X className='size-3' />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            className='flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]'
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
        <Command>
          <CommandList>
            <CommandEmpty>无匹配标签</CommandEmpty>
            <CommandGroup>
              {filteredSuggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  onSelect={() => {
                    addTag(suggestion)
                    setOpen(false)
                  }}
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
