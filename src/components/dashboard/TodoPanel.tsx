import type { FormEventHandler, RefObject } from 'react'
import type { AppCopy } from '../../app/copy'
import { filters, type TodoFilter } from '../../app/filters'
import type { Priority, Todo } from '../../types'

interface TodoPanelProps {
  todos: Todo[]
  filter: TodoFilter
  title: string
  priority: Priority
  editingTodoId: string | null
  inputRef: RefObject<HTMLInputElement | null>
  copy: AppCopy
  onTitleChange: (title: string) => void
  onPriorityChange: (priority: Priority) => void
  onFilterChange: (filter: TodoFilter) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onToggle: (todoId: string) => void
  onEdit: (todo: Todo) => void
  onCancelEdit: () => void
  onDelete: (todoId: string) => void
}

export function TodoPanel({
  todos,
  filter,
  title,
  priority,
  editingTodoId,
  inputRef,
  copy,
  onTitleChange,
  onPriorityChange,
  onFilterChange,
  onSubmit,
  onToggle,
  onEdit,
  onCancelEdit,
  onDelete,
}: TodoPanelProps) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <div className="panel-header flex items-center justify-between">
        <h3>{copy.todoQueue}</h3>
        <div className="filter-row flex" role="tablist" aria-label="Filter todos">
          {filters.map((filterOption) => (
            <button
              key={filterOption}
              type="button"
              role="tab"
              aria-selected={filterOption === filter}
              className={filterOption === filter ? 'filter-button active' : 'filter-button'}
              onClick={() => onFilterChange(filterOption)}
            >
              {copy[filterOption]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="composer-row grid">
        <input
          ref={inputRef}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={copy.addQuickTask}
          aria-label={editingTodoId ? copy.editTodo : copy.addQuickTask}
        />
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as Priority)}
          aria-label="Task priority"
        >
          <option value="low">{copy.low}</option>
          <option value="medium">{copy.medium}</option>
          <option value="high">{copy.high}</option>
        </select>
        <button type="submit" className="primary-button compact">
          {editingTodoId ? copy.saveChanges : copy.add}
        </button>
        {editingTodoId && (
          <button type="button" className="ghost-button" onClick={onCancelEdit}>
            {copy.cancel}
          </button>
        )}
      </form>

      <ul className="todo-list grid min-h-0">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.isCompleted ? 'todo-item completed flex items-center' : 'todo-item flex items-center'}>
            <button
              type="button"
              className="check-button grid place-items-center rounded-full"
              onClick={() => onToggle(todo.id)}
              aria-label={`Toggle ${todo.title}`}
            >
              {todo.isCompleted ? '✓' : ''}
            </button>
            <div className="todo-copy flex min-w-0 flex-1 flex-col">
              <strong>{todo.title}</strong>
              {todo.description && <span>{todo.description}</span>}
            </div>
            <span className={`priority-pill ${todo.priority}`}>{copy[todo.priority]}</span>
            <button type="button" className="ghost-button" onClick={() => onEdit(todo)}>
              {copy.edit}
            </button>
            <button type="button" className="ghost-button" onClick={() => onDelete(todo.id)}>
              {copy.remove}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
