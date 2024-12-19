import { dictSelectList } from '@/api/dict'
import { DictType } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { RealtimeAlarmItem, StrategyMetricLevelItem } from '@/api/model-types'
import { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Button, Space, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '模糊查询',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '根据告警内容模糊查询',
        allowClear: true,
        autoComplete: 'off'
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: RealtimeAlarmItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<RealtimeAlarmItem> => {
  const { onHandleMenuOnClick } = props
  const tableOperationItems = (): MoreMenuProps['items'] => [
    {
      key: ActionKey.CHART,
      label: (
        <Button size='small' type='link'>
          事件图表
        </Button>
      )
    },

    {
      key: ActionKey.DELETE,
      label: (
        <Button type='link' size='small' danger disabled>
          删除
        </Button>
      )
    }
  ]

  return [
    {
      title: '告警等级',
      dataIndex: 'metricLevel',
      key: 'metricLevel',
      width: 80,
      render: (level: StrategyMetricLevelItem) => {
        return level?.level?.label || '-'
      }
    },
    {
      title: '告警时间',
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 200
    },
    {
      title: '持续时间',
      key: 'duration',
      dataIndex: 'duration',
      width: 100
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      width: 400
    },
    {
      title: '明细',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => {
        return text || '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: RealtimeAlarmItem) => (
        <Space size={20} className='w-full'>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          <MoreMenu
            items={tableOperationItems()}
            onClick={(key: ActionKey) => {
              onHandleMenuOnClick(record, key)
            }}
          />
        </Space>
      )
    }
  ]
}

export const addPagesFormItems: (DataFromItem | DataFromItem[])[] = [
  {
    name: 'alarmPageIds',
    label: '告警页面',
    type: 'select-fetch',
    props: {
      selectProps: {
        mode: 'multiple',
        placeholder: '请选择告警页面'
      },
      async handleFetch(value) {
        return dictSelectList({
          dictType: DictType.DictTypeAlarmPage,
          pagination: { pageNum: 1, pageSize: 999 },
          keyword: value
        }).then(({ list }) => {
          return list.map((item) => ({
            value: item.value,
            label: (
              <Tag bordered={false} color={item.extend?.color}>
                {item.label}
              </Tag>
            )
          }))
        })
      }
    }
  }
]
