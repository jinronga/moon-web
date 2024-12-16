import { Status, StrategyType } from '@/api/enum'
import { ActionKey, defaultPaginationReq, StrategyTypeData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import { deleteStrategy, listStrategy, ListStrategyRequest, pushStrategy, updateStrategyStatus } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import StrategyCharts from './charts-modal-metric'
import { StrategyDetailDomain } from './detail-modal-domain'
import { StrategyDetailEvent } from './detail-modal-event'
import { StrategyDetailHttp } from './detail-modal-http'
import { MetricDetail } from './detail-modal-metric'
import { StrategyDetailPort } from './detail-modal-port'
import { DomainEditModal } from './edit-modal-domain'
import EventEditModal from './edit-modal-event'
import { HTTPEditModal } from './edit-modal-http'
import MetricEditModal from './edit-modal-metric'
import { PortEditModal } from './edit-modal-port'
import StrategyTypeModal from './edit-modal-strategy-type'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListStrategyRequest = {
  pagination: defaultPaginationReq
}

const StrategyMetric: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<StrategyItem[]>([])
  const [searchParams, setSearchParams] = useState<ListStrategyRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openMetricEditModal, setOpenMetricEditModal] = useState(false)
  const [openEventEditModal, setOpenEventEditModal] = useState(false)
  const [openDomainEditModal, setOpenDomainEditModal] = useState(false)
  const [openPortEditModal, setOpenPortEditModal] = useState(false)
  const [openHttpEditModal, setOpenHttpEditModal] = useState(false)

  const [openMetricDetailModal, setOpenMetricDetailModal] = useState(false)
  const [openEventDetailModal, setOpenEventDetailModal] = useState(false)
  const [openDomainDetailModal, setOpenDomainDetailModal] = useState(false)
  const [openPortDetailModal, setOpenPortDetailModal] = useState(false)
  const [openHttpDetailModal, setOpenHttpDetailModal] = useState(false)

  const [detail, setDetail] = useState<StrategyItem>()

  const [openChartModal, setOpenChartModal] = useState(false)
  const [openStrategyTypeModal, setOpenStrategyTypeModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const handleOpenMetricEditModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenMetricEditModal(true)
  }

  const handleOpenEventEditModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenEventEditModal(true)
  }

  const handleOpenDomainEditModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenDomainEditModal(true)
  }

  const handleOpenPortEditModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenPortEditModal(true)
  }

  const handleOpenHttpEditModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenHttpEditModal(true)
  }

  const handleDetailModal = (item: StrategyItem) => {
    setDetail(item)
    switch (item.strategyType) {
      case StrategyType.StrategyTypeMetric:
        setOpenMetricDetailModal(true)
        break
      case StrategyType.StrategyTypeMQ:
        setOpenEventDetailModal(true)
        break
      case StrategyType.StrategyTypeDomainCertificate:
        setOpenDomainDetailModal(true)
        break
      case StrategyType.StrategyTypeDomainPort:
        setOpenPortDetailModal(true)
        break
      case StrategyType.StrategyTypeHTTP:
        setOpenHttpDetailModal(true)
        break
      default:
        setOpenMetricDetailModal(true)
        break
    }
  }

  const handleCloseDetailModal = () => {
    setDetail(undefined)
    setOpenMetricDetailModal(false)
    setOpenEventDetailModal(false)
    setOpenDomainDetailModal(false)
    setOpenPortDetailModal(false)
    setOpenHttpDetailModal(false)
  }

  const handleCloseMetricEditModal = () => {
    setOpenMetricEditModal(false)
    setDetail(undefined)
  }

  const handleCloseEventEditModal = () => {
    setOpenEventEditModal(false)
    setDetail(undefined)
  }

  const handleCloseDomainEditModal = () => {
    setOpenDomainEditModal(false)
    setDetail(undefined)
  }

  const handleClosePortEditModal = () => {
    setOpenPortEditModal(false)
    setDetail(undefined)
  }

  const handleCloseHttpEditModal = () => {
    setOpenHttpEditModal(false)
    setDetail(undefined)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const handleOpenChartModal = (item: StrategyItem) => {
    setOpenChartModal(true)
    setDetail(item)
  }

  const handleCloseChartModal = () => {
    setOpenChartModal(false)
    setDetail(undefined)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      try {
        const { list, pagination } = await listStrategy(params)
        setDatasource(list || [])
        setTotal(pagination?.total || 0)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    fetchData(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchParams, fetchData])

  const onSearch = (formData: ListStrategyRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams?.pagination?.pageSize
      }
    })
  }

  // 切换分页
  const handleTurnPage = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: {
        pageNum: page,
        pageSize: pageSize
      }
    })
  }

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const handleOpenEditModal = (item: StrategyItem) => {
    switch (item.strategyType) {
      case StrategyType.StrategyTypeMetric:
        handleOpenMetricEditModal(item)
        break
      case StrategyType.StrategyTypeMQ:
        handleOpenEventEditModal(item)
        break
      case StrategyType.StrategyTypeDomainCertificate:
        handleOpenDomainEditModal(item)
        break
      case StrategyType.StrategyTypeDomainPort:
        handleOpenPortEditModal(item)
        break
      case StrategyType.StrategyTypeHTTP:
        handleOpenHttpEditModal(item)
        break
      default:
        message.warning(`${StrategyTypeData[item.strategyType]}未开通`)
        break
    }
  }

  const onHandleMenuOnClick = (item: StrategyItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        updateStrategyStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleDetailModal(item)
        break
      case ActionKey.EDIT:
        handleOpenEditModal(item)
        break
      case ActionKey.CHART:
        handleOpenChartModal(item)
        break
      case ActionKey.IMMEDIATELY_PUSH:
        pushStrategy(item.id)
          .then(() => message.success('推送成功'))
          .catch(() => message.error('推送失败'))
        break
      case ActionKey.DELETE:
        confirm({
          title: `请确认是否删除该策略组?`,
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteStrategy({ id: item.id }).then(() => {
              message.success('删除成功')
              onRefresh()
            })
          },
          onCancel() {
            message.info('取消操作')
          }
        })
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  const handleOpenStrategyTypeModal = () => {
    setOpenStrategyTypeModal(true)
  }

  const handleStrategyTypeSubmit = (type: StrategyType) => {
    setOpenStrategyTypeModal(false)
    switch (type) {
      case StrategyType.StrategyTypeMetric:
        handleOpenMetricEditModal()
        break
      case StrategyType.StrategyTypeMQ:
        handleOpenEventEditModal()
        break
      case StrategyType.StrategyTypeDomainCertificate:
        handleOpenDomainEditModal()
        break
      case StrategyType.StrategyTypeDomainPort:
        handleOpenPortEditModal()
        break
      case StrategyType.StrategyTypeHTTP:
        handleOpenHttpEditModal()
        break
      default:
        message.warning(`${StrategyTypeData[type]}未开通`)
        break
    }
  }

  const handleStrategyTypeCancel = () => {
    setOpenStrategyTypeModal(false)
  }

  return (
    <div className='h-full flex flex-col gap-3 p-3'>
      <StrategyTypeModal
        title='选择策略类型'
        open={openStrategyTypeModal}
        onSubmit={handleStrategyTypeSubmit}
        onCancel={handleStrategyTypeCancel}
      />
      <MetricEditModal
        title='指标策略编辑'
        width='60%'
        strategyDetail={detail}
        open={openMetricEditModal}
        onCancel={handleCloseMetricEditModal}
      />
      <DomainEditModal
        title='证书策略编辑'
        width='60%'
        strategyDetail={detail}
        open={openDomainEditModal}
        onCancel={handleCloseDomainEditModal}
      />
      <PortEditModal
        title='端口策略编辑'
        width='60%'
        strategyDetail={detail}
        open={openPortEditModal}
        onCancel={handleClosePortEditModal}
      />
      <EventEditModal
        title='事件策略编辑'
        width='60%'
        eventStrategyDetail={detail}
        open={openEventEditModal}
        onCancel={handleCloseEventEditModal}
      />
      <HTTPEditModal
        title='HTTP策略编辑'
        width='60%'
        strategyDetail={detail}
        open={openHttpEditModal}
        onCancel={handleCloseHttpEditModal}
      />
      <StrategyCharts
        title='策略图表'
        width='60%'
        strategyID={detail?.id}
        open={openChartModal}
        onCancel={handleCloseChartModal}
      />
      <MetricDetail
        width='60%'
        strategyId={detail?.id}
        open={openMetricDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailEvent
        width='60%'
        strategyId={detail?.id}
        open={openEventDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailDomain
        width='60%'
        strategyId={detail?.id}
        open={openDomainDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailPort
        width='60%'
        strategyId={detail?.id}
        open={openPortDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailHttp
        width='60%'
        strategyId={detail?.id}
        open={openHttpDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div
        className='p-3'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <div className='flex justify-between items-center'>
          <div className='font-bold text-lg'>策略组</div>
          <Space size={8}>
            <Button type='primary' onClick={handleOpenStrategyTypeModal}>
              添加
            </Button>
            {/* <Button onClick={() => handleEditModal()}>批量导入</Button> */}
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-3' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={datasource}
            total={total}
            loading={loading}
            columns={columns}
            handleTurnPage={handleTurnPage}
            pageSize={searchParams.pagination.pageSize}
            pageNum={searchParams.pagination.pageNum}
            showSizeChanger={true}
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadius
            }}
            scroll={{
              y: `calc(100vh - 170px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default StrategyMetric
