export const filters = ['all', 'active', 'completed'] as const
export type TodoFilter = (typeof filters)[number]
