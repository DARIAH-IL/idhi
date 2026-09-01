import type { FilterOperator } from '#/api/models'
import type { EntityFilter } from '#/api/typedEntitySearch.ts'
import type { AdvancedSearchField } from '#/lib/advancedSearchFields.ts'

export type FilterCombinator = 'and' | 'or'

export interface FilterConditionNode {
  id: string
  kind: 'condition'
  field: AdvancedSearchField | ''
  operator: FilterOperator | ''
  value: unknown
}

export interface FilterGroupNode {
  id: string
  kind: 'group'
  combinator: FilterCombinator
  children: FilterNode[]
}

export type FilterNode = FilterConditionNode | FilterGroupNode

function createNodeId(): string {
  return `node-${crypto.randomUUID()}`
}

export function createConditionNode(): FilterConditionNode {
  return {
    id: createNodeId(),
    kind: 'condition',
    field: '',
    operator: '',
    value: undefined,
  }
}

export function createGroupNode(
  combinator: FilterCombinator = 'and',
): FilterGroupNode {
  return {
    id: createNodeId(),
    kind: 'group',
    combinator,
    children: [createConditionNode()],
  }
}

function isValueMissing(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true
  }
  return Array.isArray(value) && value.length === 0
}

function compileCondition(node: FilterConditionNode): EntityFilter | undefined {
  if (!node.field || !node.operator || isValueMissing(node.value)) {
    return undefined
  }
  return { field: node.field, op: node.operator, value: node.value }
}

function compileGroup(node: FilterGroupNode): EntityFilter | undefined {
  const children = node.children
    .map(compileNode)
    .filter((child): child is EntityFilter => child !== undefined)

  if (children.length === 0) {
    return undefined
  }
  if (children.length === 1) {
    return children[0]
  }
  return node.combinator === 'and' ? { and: children } : { or: children }
}

export function compileNode(node: FilterNode): EntityFilter | undefined {
  return node.kind === 'condition' ? compileCondition(node) : compileGroup(node)
}

export function compileAdvancedFilter(
  root: FilterGroupNode | undefined,
): EntityFilter | undefined {
  return root ? compileNode(root) : undefined
}

export function countActiveConditions(node: FilterNode | undefined): number {
  if (!node) {
    return 0
  }
  if (node.kind === 'condition') {
    return compileCondition(node) ? 1 : 0
  }
  return node.children.reduce(
    (sum, child) => sum + countActiveConditions(child),
    0,
  )
}

function walkNode(
  node: FilterNode,
  id: string,
  updater: (node: FilterNode) => FilterNode,
): FilterNode {
  if (node.id === id) {
    return updater(node)
  }
  if (node.kind === 'group') {
    return {
      ...node,
      children: node.children.map((child) => walkNode(child, id, updater)),
    }
  }
  return node
}

export function updateNode(
  root: FilterGroupNode,
  id: string,
  updater: (node: FilterNode) => FilterNode,
): FilterGroupNode {
  if (root.id !== id) {
    return {
      ...root,
      children: root.children.map((child) => walkNode(child, id, updater)),
    }
  }
  const updated = updater(root)
  return updated.kind === 'group' ? updated : root
}

export function updateCondition(
  root: FilterGroupNode,
  id: string,
  patch: Partial<Omit<FilterConditionNode, 'id' | 'kind'>>,
): FilterGroupNode {
  return updateNode(root, id, (node) =>
    node.kind === 'condition' ? { ...node, ...patch } : node,
  )
}

export function setGroupCombinator(
  root: FilterGroupNode,
  id: string,
  combinator: FilterCombinator,
): FilterGroupNode {
  return updateNode(root, id, (node) =>
    node.kind === 'group' ? { ...node, combinator } : node,
  )
}

export function removeNode(root: FilterGroupNode, id: string): FilterGroupNode {
  function walk(node: FilterGroupNode): FilterGroupNode {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== id)
        .map((child) => (child.kind === 'group' ? walk(child) : child)),
    }
  }
  return walk(root)
}

export function addCondition(
  root: FilterGroupNode,
  groupId: string,
): FilterGroupNode {
  return updateNode(root, groupId, (node) =>
    node.kind === 'group'
      ? { ...node, children: [...node.children, createConditionNode()] }
      : node,
  )
}

export function addGroup(
  root: FilterGroupNode,
  groupId: string,
): FilterGroupNode {
  return updateNode(root, groupId, (node) =>
    node.kind === 'group'
      ? { ...node, children: [...node.children, createGroupNode()] }
      : node,
  )
}
