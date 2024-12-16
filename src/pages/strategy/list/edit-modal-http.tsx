import { Condition, HTTPMethod, Status, StatusCodeCondition } from '@/api/enum'
import { ConditionData, defaultPaginationReq, HTTPMethodData, StatusCodeConditionData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import {
  createStrategy,
  CreateStrategyRequest,
  parseHTTPStrategyDetailToFormData,
  updateStrategy
} from '@/api/strategy'
import { AnnotationsEditor } from '@/components/data/child/annotation-editor'
import {
  useAlarmLevelList,
  useAlarmNoticeGroupList,
  useAlarmPageList,
  useStrategyCategoryList,
  useStrategyGroupList
} from '@/hooks/select'
import { useSubmit } from '@/hooks/submit'
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Popover,
  Row,
  Select,
  Space,
  theme,
  Typography
} from 'antd'
import { useEffect, useState } from 'react'

export interface HTTPEditModalProps extends ModalProps {
  strategyDetail?: StrategyItem
}

export const HTTPEditModal: React.FC<HTTPEditModalProps> = (props) => {
  const { strategyDetail, ...restProps } = props

  const { token } = theme.useToken()
  const [form] = Form.useForm<CreateStrategyRequest>()
  const [loading, setLoading] = useState(false)
  const { strategyGroupList, strategyGroupListLoading } = useStrategyGroupList({
    pagination: defaultPaginationReq
  })
  const { strategyCategoryList, strategyCategoryListLoading } = useStrategyCategoryList({
    pagination: defaultPaginationReq
  })
  const { alarmGroupList, alarmGroupListLoading } = useAlarmNoticeGroupList({
    pagination: defaultPaginationReq
  })
  const { alarmPageList, alarmPageListLoading } = useAlarmPageList({
    pagination: defaultPaginationReq
  })
  const { alarmLevelList, alarmLevelListLoading } = useAlarmLevelList({
    pagination: defaultPaginationReq
  })
  const { submit } = useSubmit(updateStrategy, createStrategy, strategyDetail?.id)

  const [descriptionOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })
  const [summaryOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })

  const handleSubmit = () => {
    setLoading(true)
    form
      .validateFields()
      .then((values) => {
        if (strategyDetail) {
          return submit({ data: values, id: strategyDetail?.id })
        } else {
          return submit(values)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (restProps.open) {
      if (strategyDetail) {
        form.setFieldsValue(parseHTTPStrategyDetailToFormData(strategyDetail))
      } else {
        form.resetFields()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyDetail, restProps.open])

  return (
    <Modal {...restProps} onOk={handleSubmit} confirmLoading={loading}>
      <div className='max-h-[70vh] overflow-y-auto overflow-x-hidden'>
        <Form form={form} layout='vertical' autoComplete='off' disabled={loading}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label='策略名称' name='name' rules={[{ required: true, message: '请输入策略名称' }]}>
                <Input placeholder='请输入策略名称' allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='策略组' name='groupId' rules={[{ required: true, message: '请选择策略组' }]}>
                <Select
                  placeholder='请选择策略组'
                  allowClear
                  loading={strategyGroupListLoading}
                  options={strategyGroupList.map((item) => ({
                    label: item.name,
                    value: item.id,
                    disabled: item.status !== Status.StatusEnable
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='策略类型' name='categoriesIds' rules={[{ required: true, message: '请选择策略类型' }]}>
            <Select
              placeholder='请选择策略类型'
              allowClear
              mode='multiple'
              loading={strategyCategoryListLoading}
              options={strategyCategoryList}
            />
          </Form.Item>
          <Form.Item
            label='通知对象'
            name='alarmGroupIds'
            rules={[
              {
                required: false,
                message: '请选择通知对象'
              }
            ]}
          >
            <Select
              placeholder='请选择通知对象'
              allowClear
              mode='multiple'
              loading={alarmGroupListLoading}
              options={alarmGroupList.map((item) => ({
                label: item.name,
                value: item.id,
                disabled: item.status !== Status.StatusEnable
              }))}
            />
          </Form.Item>
          <Form.Item label='请求地址' name='expr' rules={[{ required: true, message: '请输入请求地址', type: 'url' }]}>
            <Input placeholder='请输入请求地址' allowClear />
          </Form.Item>
          <Form.Item label={<b>标签kv集合</b>} required>
            <Form.List
              name='labels'
              rules={[
                {
                  message: '请输入至少一个标签',
                  validator(_, value, callback) {
                    if (value.length === 0) {
                      callback('请输入至少一个标签')
                    } else {
                      callback()
                    }
                  }
                }
              ]}
            >
              {(fields, { add, remove }) => (
                <div key={`${fields.length}_1`}>
                  <Row gutter={12} wrap>
                    {fields.map(({ key, name, ...restField }) => (
                      <Col span={12} key={key}>
                        <Row gutter={12} className='w-[200%]'>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              label={[name, 'key'].join('.')}
                              rules={[
                                {
                                  required: true,
                                  message: '标签Key不允许为空'
                                }
                              ]}
                            >
                              <Input placeholder='key' />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <span className='flex items-center gap-2'>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                label={[name, 'value'].join('.')}
                                rules={[
                                  {
                                    required: true,
                                    message: '标签值不允许为空'
                                  }
                                ]}
                                className='flex-1'
                              >
                                <Input placeholder='value' />
                              </Form.Item>
                              <MinusCircleOutlined onClick={() => remove(name)} style={{ color: token.colorError }} />
                            </span>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    添加新标签
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item tooltip='注解用于告警展示的内容编辑' label={<b>注解</b>} required>
            <Form.Item
              name={['annotations', 'summary']}
              label={
                <Space size={8}>
                  告警摘要
                  <Popover
                    title='告警摘要, 告警内容如下所示'
                    content={
                      <Typography.Text ellipsis copyable className='w-[30vw]'>
                        {summaryOkInfo.info}
                      </Typography.Text>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              }
              rules={[{ required: true, message: '请输入告警摘要' }]}
            >
              <AnnotationsEditor labels={summaryOkInfo.labels} language='summary' />
            </Form.Item>
            <Form.Item
              name={['annotations', 'description']}
              label={
                <Space size={8}>
                  告警明细
                  <Popover
                    title='告警明细, 告警内容如下所示'
                    content={
                      <Typography.Text ellipsis copyable className='w-[30vw]'>
                        {descriptionOkInfo.info}
                      </Typography.Text>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              }
              rules={[{ required: true, message: '请输入告警明细' }]}
            >
              <AnnotationsEditor height={64 * 2} labels={descriptionOkInfo.labels} language='description' />
            </Form.Item>
          </Form.Item>
          <Form.Item label={<b>告警等级</b>} required>
            <Form.List name='strategyLevel'>
              {(fields, { add, remove }) => (
                <div className='flex flex-col gap-4'>
                  {fields.map((field) => (
                    <Card
                      size='small'
                      title={`策略等级明细 ${field.name + 1}`}
                      key={field.key}
                      extra={
                        <MinusCircleOutlined
                          style={{ color: token.colorError }}
                          onClick={() => {
                            remove(field.name)
                          }}
                        />
                      }
                    >
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            label='告警等级'
                            name={[field.name, 'levelId']}
                            rules={[
                              {
                                required: true,
                                message: '请选择告警等级'
                              }
                            ]}
                          >
                            <Select
                              placeholder='请选择告警等级'
                              loading={alarmLevelListLoading}
                              options={alarmLevelList}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label='请求方式'
                            name={[field.name, 'method']}
                            rules={[
                              {
                                required: true,
                                message: '请选择请求方式'
                              }
                            ]}
                          >
                            <Select
                              placeholder='请选择请求方式'
                              options={Object.entries(HTTPMethodData)
                                .filter(([key]) => key !== HTTPMethod.HTTPMethodUnknown)
                                .map(([key, value]) => ({
                                  value: +key,
                                  label: value
                                }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label='状态码判断条件'
                            name={[field.name, 'statusCodeCondition']}
                            rules={[
                              {
                                required: true,
                                message: '请选择状态码判断条件'
                              }
                            ]}
                          >
                            <Select
                              placeholder='请选择状态码判断条件'
                              options={Object.entries(StatusCodeConditionData)
                                .filter(([key]) => +key !== StatusCodeCondition.StatusCodeConditionUnknown)
                                .map(([key, value]) => ({
                                  value: +key,
                                  label: value
                                }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label='状态码'
                            name={[field.name, 'statusCodes']}
                            rules={[
                              {
                                required: true,
                                message: '请输入状态码'
                              }
                            ]}
                          >
                            <InputNumber className='w-full' placeholder='请输入状态码' />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label='响应时间判断条件'
                            name={[field.name, 'responseTimeCondition']}
                            rules={[
                              {
                                required: true,
                                message: '请选择响应时间判断条件'
                              }
                            ]}
                          >
                            <Select
                              placeholder='请选择响应时间判断条件'
                              options={Object.entries(ConditionData)
                                .filter(([key]) => +key !== Condition.ConditionUnknown)
                                .map(([key, value]) => ({
                                  value: +key,
                                  label: value
                                }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            label='响应时间(ms)'
                            name={[field.name, 'responseTime']}
                            rules={[{ required: true, message: '请输入响应时间(ms)' }]}
                          >
                            <InputNumber className='w-full' placeholder='请输入响应时间(ms)' />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item label='请求头'>
                            <Form.List name={[field.name, 'headers']}>
                              {(fields, { add, remove }) => (
                                <div>
                                  {fields.map((field) => (
                                    <div key={field.key} className='flex items-center gap-2'>
                                      <Form.Item
                                        name={[field.name, 'key']}
                                        rules={[
                                          {
                                            required: true,
                                            message: '请输入请求头Key'
                                          }
                                        ]}
                                      >
                                        <Input placeholder='key' />
                                      </Form.Item>
                                      <Form.Item
                                        name={[field.name, 'value']}
                                        rules={[
                                          {
                                            required: true,
                                            message: '请输入请求头Value'
                                          }
                                        ]}
                                      >
                                        <Input placeholder='value' />
                                      </Form.Item>
                                      <MinusCircleOutlined
                                        onClick={() => remove(field.name)}
                                        style={{ color: token.colorError }}
                                      />
                                    </div>
                                  ))}
                                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加新请求头
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            label='查询参数'
                            tooltip={
                              <div>
                                <p>查询请求参数格式: key=value</p>
                                <p>多个参数请用&连接</p>
                                <p>
                                  示例: <code>a=1&b=2&c=3</code>
                                </p>
                              </div>
                            }
                          >
                            <Input.TextArea placeholder='请输入查询参数' />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            label='请求体'
                            tooltip={
                              <div>
                                <p>
                                  请求体格式: <code>{JSON.stringify({ a: 1, b: 2, c: 3 })}</code>
                                </p>
                              </div>
                            }
                          >
                            <Input.TextArea placeholder='请输入请求体' />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item
                            label='告警页面'
                            name={[field.name, 'alarmPageIds']}
                            rules={[
                              {
                                required: true,
                                message: '请选择告警页面'
                              }
                            ]}
                          >
                            <Select
                              mode='multiple'
                              allowClear
                              placeholder='请选择告警页面'
                              loading={alarmPageListLoading}
                              options={alarmPageList}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item
                            label='通知对象'
                            name={[field.name, 'alarmGroupIds']}
                            rules={[
                              {
                                required: false,
                                message: '请选择通知对象'
                              }
                            ]}
                          >
                            <Select
                              mode='multiple'
                              allowClear
                              placeholder='请选择通知对象'
                              options={alarmGroupList.map((item) => ({
                                label: item.name,
                                value: item.id,
                                disabled: item.status !== Status.StatusEnable
                              }))}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label={<b>label通知对象</b>}>
                        <Form.List name={[field.name, 'strategyLabels']}>
                          {(fields, { add, remove }) => (
                            <div key={`${fields.length}_1`}>
                              <Row gutter={24} wrap>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Col span={24} key={key}>
                                    <span className='flex items-center gap-2'>
                                      <Row gutter={24} className='w-full'>
                                        <Col span={10}>
                                          <Form.Item
                                            name={[name, 'name']}
                                            label={[name, 'name'].join('.')}
                                            rules={[
                                              {
                                                required: true,
                                                message: '标签Key不允许为空'
                                              }
                                            ]}
                                          >
                                            <Input placeholder='key' />
                                          </Form.Item>
                                        </Col>
                                        <Col span={14}>
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'value']}
                                            label={[name, 'value'].join('.')}
                                            rules={[
                                              {
                                                required: true,
                                                message: '标签值不允许为空'
                                              }
                                            ]}
                                            className='flex-1'
                                          >
                                            <Input placeholder='value' />
                                          </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'alarmGroupIds']}
                                            label={[name, '通知对象'].join('.')}
                                            rules={[
                                              {
                                                required: true,
                                                message: '标签值不允许为空'
                                              }
                                            ]}
                                            className='flex-1'
                                          >
                                            <Input placeholder='通知对象' />
                                          </Form.Item>
                                        </Col>
                                      </Row>
                                      <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                        style={{ color: token.colorError }}
                                      />
                                    </span>
                                  </Col>
                                ))}
                              </Row>
                              <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                添加新 label 通知对象
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  ))}
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    添加策略等级
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}