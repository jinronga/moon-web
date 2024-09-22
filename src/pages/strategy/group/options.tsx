import { dictSelectList } from '@/api/dict'
import { DictType, Status } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import { DictItem, StrategyGroupItem } from '@/api/model-types'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import OverflowTooltip from '@/components/overflowTooltip'
import { Badge, Button, Space, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'

export type GroupEditModalFormData = {
  name: string
  remark: string
  status?: number
  categoriesIds: number[]
  teamId?: number
}

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '规则组名称',
        allowClear: true
      }
    }
  },
  {
    name: 'categoriesIds',
    label: '分类',
    dataProps: {
      type: 'select-fetch',
      itemProps: {
        selectProps: {
          placeholder: '请选择规则组分类',
          mode: 'multiple',
          maxTagCount: 'responsive'
        },
        handleFetch: (keyword: string) =>
          dictSelectList({
            keyword,
            pagination: { pageNum: 1, pageSize: 999 },
            status: Status.StatusEnable,
            dictType: DictType.DictTypeStrategyGroupCategory
          }).then(({ list }) => list),
        defaultOptions: []
      }
    }
  },
  {
    name: 'status',
    label: '状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '规则组状态',
        allowClear: true,
        options: Object.entries(StatusData).map(([key, value]) => {
          return {
            label: value.text,
            value: Number(key)
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: StrategyGroupItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<StrategyGroupItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: StrategyGroupItem): MoreMenuProps['items'] => [
    record.status === Status.StatusDisable
      ? {
          key: ActionKey.ENABLE,
          label: (
            <Button type='link' size='small'>
              启用
            </Button>
          )
        }
      : {
          key: ActionKey.DISABLE,
          label: (
            <Button type='link' size='small' danger>
              禁用
            </Button>
          )
        },
    {
      key: ActionKey.OPERATION_LOG,
      label: (
        <Button size='small' type='link'>
          操作日志
        </Button>
      )
    },
    {
      key: ActionKey.EDIT,
      label: (
        <Button size='small' type='link'>
          编辑
        </Button>
      )
    },
    {
      key: ActionKey.DELETE,
      label: (
        <Button type='link' size='small' danger>
          删除
        </Button>
      )
    }
  ]

  return [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 60,
      fixed: 'left',
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 200,
      render: (text: string) => {
        return (
          <Tooltip
            placement='top'
            title={() => {
              return <div>{text}</div>
            }}
          >
            <div>{text ? text : '-'}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'categories',
      key: 'categories',
      align: 'center',
      width: 160,
      render: (categories: DictItem[]) => {
        return (
          <Tooltip placement='top' title={<div>{categories.map((item) => item.name).join('，')}</div>}>
            <div>{categories.map((item) => item.name).join('，')}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 160,
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      // 策略数量
      title: '策略数量',
      // dataIndex: 'strategyCount',
      key: 'strategyCount',
      width: 120,
      align: 'center',
      render: (_, record: StrategyGroupItem) => {
        return (
          <b>
            <span style={{ color: '' }}>{record.enableStrategyCount}</span>
            {' / '}
            <span style={{ color: 'green' }}>{record.strategyCount}</span>
          </b>
        )
      }
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      width: 300,
      render: (text: string) => {
        return <OverflowTooltip content={text || '-'} maxWidth='300px' />
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      width: 180,
      render: (text: string) => {
        return (
          <Tooltip
            placement='top'
            title={() => {
              return <div>{text}</div>
            }}
          >
            <div>{text ? text : '-'}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: StrategyGroupItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems(record)}
              onClick={(key: ActionKey) => {
                onHandleMenuOnClick(record, key)
              }}
            />
          )}
        </Space>
      )
    }
  ]
}
