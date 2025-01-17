import {
  type CreateDatasourceRequestFormData,
  createDatasource,
  datasourceHealth,
  getDatasource,
  updateDatasource
} from '@/api/datasource'
import { DatasourceType, Status, StorageType } from '@/api/enum'
import { StatusData } from '@/api/global'
import { DataFrom, type DataFromItem } from '@/components/data/form'
import { Prometheus, VictoriaMetrics } from '@/components/icon'
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons'
import { Col, Form, Input, Modal, type ModalProps, Row, Space, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

export interface EditModalProps extends ModalProps {
  datasourceId?: number
}

let timer: NodeJS.Timeout | null = null
export const EditModal: React.FC<EditModalProps> = (props) => {
  const { onCancel, onOk, open, datasourceId } = props
  const [form] = Form.useForm<CreateDatasourceRequestFormData>()
  const [loading, setLoading] = React.useState(false)
  const [dataSourceHealthStatus, setDataSourceHealth] = useState(false)
  const handleOnOk = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.validateFields().then((values) => {
      const newValues = {
        ...values,
        datasourceType: DatasourceType.DatasourceTypeMetric
      }
      setLoading(true)
      if (datasourceId) {
        updateDatasource({ ...newValues, id: datasourceId, config: JSON.stringify(values.config) })
          .then(() => {
            form.resetFields()
            onOk?.(e)
          })
          .finally(() => setLoading(false))
        return
      }
      if (!dataSourceHealthStatus) {
        message.error('数据源地址测试失败，请检查配置')
        setLoading(false)
        return
      }
      createDatasource({ ...newValues, config: JSON.stringify(values.config) })
        .then(() => {
          form.resetFields()
          onOk?.(e)
        })
        .finally(() => setLoading(false))
      return values
    })
  }

  const handleGetDatasource = useCallback(() => {
    if (!datasourceId) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      getDatasource({ id: datasourceId })
        .then(({ detail }) => {
          let config: Record<string, string> = {}
          try {
            config = JSON.parse(detail.config)
          } catch (error) {
            message.error('数据源配置解析失败，请检查配置')
          }
          form.setFieldsValue({ ...detail, config })
        })
        .finally(() => {
          setLoading(false)
        })
    }, 500)
  }, [datasourceId, form])

  useEffect(() => {
    if (open) {
      handleGetDatasource()
    }
  }, [open, handleGetDatasource])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    form.resetFields()
    onCancel?.(e)
  }

  const formItems: (DataFromItem | DataFromItem[])[] = [
    [
      {
        label: '数据源名称',
        name: 'name',
        type: 'input',
        props: {
          placeholder: '请输入数据源名称'
        },
        formProps: {
          rules: [{ required: true, message: '请输入数据源名称' }]
        }
      },
      {
        label: '状态',
        name: 'status',
        type: 'radio-group',
        props: {
          options: Object.entries(StatusData)
            .filter((item) => {
              return +item[0] !== Status.StatusAll
            })
            .map((item) => {
              return {
                label: item[1].text,
                value: +item[0]
              }
            })
        },
        formProps: {
          rules: [{ required: true, message: '请选择状态' }]
        }
      }
    ],
    [
      {
        label: '存储器类型',
        name: 'storageType',
        type: 'radio-group',
        props: {
          optionType: 'button',
          options: [
            {
              label: (
                <Space>
                  <Prometheus width={15} height={15} />
                  Prometheus
                </Space>
              ),
              value: StorageType.StorageTypePrometheus
            },
            {
              label: (
                <Space>
                  <VictoriaMetrics width={15} height={15} />
                  VictoriaMetrics
                </Space>
              ),
              value: StorageType.StorageTypeVictoriaMetrics
            }
          ]
        },
        formProps: {
          rules: [{ required: true, message: '请选择存储器类型' }]
        }
      }
    ],
    {
      label: '数据源地址',
      name: 'endpoint',
      type: 'button-input',
      onChange: () => {
        setDataSourceHealth(false)
      },
      props: {
        placeholder: '请输入数据源地址',
        enterButton: '连接测试',
        onSearch: async (value: string) => {
          setDataSourceHealth(false)
          datasourceHealth({
            url: value,
            type: form.getFieldValue('storageType')
          }).then(() => {
            setDataSourceHealth(true)
          })
        },
        suffix: dataSourceHealthStatus ? (
          <CheckCircleTwoTone twoToneColor='#52c41a' />
        ) : (
          <CloseCircleTwoTone twoToneColor='#f5222d' />
        )
      },
      formProps: {
        rules: [{ required: true, message: '请输入数据源地址' }]
      }
    },
    {
      label: '说明信息',
      name: 'remark',
      type: 'textarea',
      props: {
        placeholder: '请输入数据源说明信息',
        maxLength: 200,
        showCount: true
      }
    }
  ]

  return (
    <Modal
      {...props}
      title='新建数据源'
      open={open}
      onCancel={handleOnCancel}
      onOk={handleOnOk}
      confirmLoading={loading}
    >
      <DataFrom props={{ form, layout: 'vertical' }} items={formItems}>
        <Form.Item label='基础认证配置'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['config', 'username']} label='用户名'>
                <Input placeholder='请输入用户名' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['config', 'password']} label='密码'>
                <Input placeholder='请输入密码' />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      </DataFrom>
    </Modal>
  )
}
