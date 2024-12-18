import request from '@/api/request'
import { Status, TimeEngineRuleType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { TimeEngineRuleItem } from '../model-types'

/**
 * 创建时间引擎规则请求
 */
export interface CreateTimeEngineRuleRequest {
  /* 规则名称 */
  name: string
  /* 规则备注 */
  remark: string
  /* 规则类型 */
  category: number
  /* 规则 */
  rule: number[]
  /* 状态 */
  status: Status
}

/**
 * 更新时间引擎规则请求
 */
export interface UpdateTimeEngineRuleRequest {
  /* 规则ID */
  id: number
  /* 明细数据 */
  data: CreateTimeEngineRuleRequest
}

/**
 * 获取时间引擎规则列表请求
 */
export interface ListTimeEngineRuleRequest {
  /* 分页 */
  pagination: PaginationReq
  /** 模糊查询 */
  keyword?: string
  /* 状态 */
  status?: Status
  /* 规则类型 */
  category?: TimeEngineRuleType
}

/**
 * // 获取时间引擎规则列表返回
message ListTimeEngineRuleReply {
  // 规则列表
  repeated TimeEngineRuleItem list = 1;
  // 分页
  PaginationReply pagination = 2;
}
 */
export interface ListTimeEngineRuleReply {
  /* 规则列表 */
  list: TimeEngineRuleItem[]
  /* 分页 */
  pagination: PaginationReply
}

/**
 * 创建时间引擎规则
 * @param data CreateTimeEngineRuleRequest
 * @returns
 */
export const createTimeEngineRule = (data: CreateTimeEngineRuleRequest) => {
  return request.POST('/v1/admin/alarm/time_engine_rule/create', data)
}

/**
 * 更新时间引擎规则
 * @param data UpdateTimeEngineRuleRequest
 * @returns
 */
export const updateTimeEngineRule = (data: UpdateTimeEngineRuleRequest) => {
  return request.PUT('/v1/admin/alarm/time_engine_rule/update', data)
}

/**
 * 删除时间引擎规则
 * @param id
 * @returns
 */
export const deleteTimeEngineRule = (id: number) => {
  return request.DELETE(`/v1/admin/alarm/time_engine_rule/delete/${id}`)
}

/**
 * 获取时间引擎规则
 * @param id
 * @returns
 */
export const getTimeEngineRule = (id: number) => {
  return request.GET(`/v1/admin/alarm/time_engine_rule/get/${id}`)
}

/**
 * 获取时间引擎规则列表
 * @param data ListTimeEngineRuleRequest
 * @returns
 */
export const listTimeEngineRule = (data: ListTimeEngineRuleRequest): Promise<ListTimeEngineRuleReply> => {
  return request.POST<ListTimeEngineRuleReply>('/v1/admin/alarm/time_engine_rule/list', data)
}
