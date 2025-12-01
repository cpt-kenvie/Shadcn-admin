import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import * as rolesApi from '@/api/roles'
import { IconShield } from '@tabler/icons-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

/**
 * @description 用户列表工具栏组件
 * @param {Table} table - React Table 实例
 * @returns {JSX.Element} 工具栏组件
 */
export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // 从 API 动态获取角色列表
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getAllRoles()
      return response.data
    },
  })

  const roles = rolesData?.data || []

  // 根据实际 API 返回的状态枚举创建状态选项
  const statusOptions = [
    { label: '活跃', value: 'ACTIVE' },
    { label: '不活跃', value: 'INACTIVE' },
    { label: '邀请', value: 'INVITED' },
    { label: '暂停', value: 'SUSPENDED' },
  ]

  // 将角色数据转换为筛选器选项格式
  const roleOptions = roles.map((role) => ({
    label: role.displayName,
    value: role.name,
    icon: IconShield,
  }))

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='过滤用户...'
          value={
            (table.getColumn('username')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('username')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='状态'
              options={statusOptions}
            />
          )}
          {table.getColumn('role') && roleOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('role')}
              title='角色'
              options={roleOptions}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            重置
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
