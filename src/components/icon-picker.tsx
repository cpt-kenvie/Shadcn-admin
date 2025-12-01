import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ICON_MAP } from '@/components/layout/data/icon-map'

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function IconPicker({
  value,
  onChange,
  placeholder = '选择图标...',
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedIcon = value ? ICON_MAP[value] : null
  const SelectedIconComponent = selectedIcon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {value ? (
            <div className='flex items-center justify-center w-full'>
              {SelectedIconComponent ? (
                <SelectedIconComponent className='size-5' />
              ) : (
                <span>{value}</span>
              )}
            </div>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='搜索图标...' />
          <CommandList
            onWheel={(e) => {
              e.stopPropagation()
            }}
          >
            <CommandEmpty>未找到图标。</CommandEmpty>
            <CommandGroup>
              <div className='grid grid-cols-4 gap-2 p-2'>
                {Object.entries(ICON_MAP)
                  .filter(([name]) => !name.startsWith('Icon'))
                  .map(([name, Icon]) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? '' : currentValue)
                      setOpen(false)
                    }}
                    className='flex flex-col items-center justify-center gap-1 rounded-md border p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer'
                  >
                    <Icon className='size-6' />
                    <span className='text-[10px] w-full truncate text-center'>{name}</span>
                    {value === name && (
                      <div className='absolute top-1 right-1'>
                        <Check className='size-3 text-primary' />
                      </div>
                    )}
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
