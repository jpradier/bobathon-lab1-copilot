/**
 * Todo App - Frontend JavaScript
 *
 * This file uses literate-style comments to explain:
 * - How API calls work
 * - Why async/await is used
 * - How errors are handled
 * - The purpose of each function
 */

const API_URL = '/api/todos';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const todoCount = document.getElementById('todo-count');

/**
 * Fetch all todos from the API and render them.
 *
 * API call details:
 * - Uses the Fetch API to send an HTTP GET request to API_URL.
 * - The server responds with JSON (an array of todos), which we parse
 *   with response.json().
 *
 * Why async/await:
 * - fetch() is asynchronous and returns a Promise.
 * - async/await lets us write asynchronous code that reads top-to-bottom,
 *   like synchronous code, making it easier for beginners to follow.
 *
 * Error handling:
 * - We wrap the call in a try/catch block.
 * - If the HTTP response is not OK, we throw an Error.
 * - The catch block displays a user-friendly message.
 */
async function fetchTodos() {
    showLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        showError('Failed to load todos. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

/**
 * Create a new todo.
 *
 * API call details:
 * - Sends an HTTP POST request to API_URL.
 * - The request body contains JSON with the new todo title.
 * - The server responds with the created todo object.
 *
 * Why async/await:
 * - We wait for the network request and JSON parsing to finish
 *   before updating the UI.
 *
 * Error handling:
 * - Non-OK responses trigger an Error.
 * - Errors are caught and shown to the user.
 */
async function createTodo(title) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (!response.ok) throw new Error('Failed to create todo');
        const todo = await response.json();
        addTodoToList(todo);
        updateCount();
    } catch (error) {
        console.error('Error creating todo:', error);
        showError('Failed to create todo. Please try again.');
    }
}

/**
 * Toggle todo completion status.
 *
 * API call details:
 * - Sends an HTTP PUT request to /api/todos/:id.
 * - The body includes the new completed value (the opposite of current).
 * - The server responds with the updated todo object.
 *
 * Why async/await:
 * - Ensures we wait for the updated todo before refreshing the UI.
 *
 * Error handling:
 * - Non-OK responses throw an Error, which is caught and reported.
 */
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });
        if (!response.ok) throw new Error('Failed to update todo');
        const todo = await response.json();
        updateTodoInList(todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    }
}

/**
 * Delete a todo.
 *
 * API call details:
 * - Sends an HTTP DELETE request to /api/todos/:id.
 * - No JSON body is required for deletion.
 * - If successful, the server responds with a success status.
 *
 * Why async/await:
 * - Waits for the server to confirm deletion before updating the UI.
 *
 * Error handling:
 * - Non-OK responses throw an Error, which is caught and reported.
 */
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete todo');
        removeTodoFromList(id);
        updateCount();
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

/**
 * Render all todos in the list.
 *
 * Purpose:
 * - Clears the current list and rebuilds it from the provided array.
 * - Shows an empty-state message when there are no todos.
 */
function renderTodos(todos) {
    todoList.innerHTML = '';
    if (todos.length === 0) {
        showEmptyState(true);
    } else {
        showEmptyState(false);
        todos.forEach(todo => addTodoToList(todo));
    }
    updateCount();
}

/**
 * Add a single todo to the list.
 *
 * Purpose:
 * - Creates the DOM element for one todo and inserts it at the top.
 */
function addTodoToList(todo) {
    showEmptyState(false);
    const li = createTodoElement(todo);
    todoList.prepend(li);
}

/**
 * Create the DOM element for a todo.
 *
 * Purpose:
 * - Builds the HTML structure for a todo item.
 * - Adds event listeners for checkbox toggle and delete.
 * - Uses escapeHtml to prevent XSS by escaping user input.
 */
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';
    li.dataset.id = todo.id;
    
    li.innerHTML = `
        <div class="form-check flex-grow-1">
            <input type="checkbox" 
                   class="form-check-input todo-checkbox" 
                   id="todo-${todo.id}"
                   ${todo.completed ? 'checked' : ''}>
            <label class="form-check-label ${todo.completed ? 'text-decoration-line-through text-muted' : ''}" 
                   for="todo-${todo.id}">
                ${escapeHtml(todo.title)}
            </label>
        </div>
        <button class="btn btn-sm btn-outline-danger delete-btn" 
                aria-label="Delete todo"
                title="Delete">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    // Add event listeners
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => toggleTodo(todo.id, todo.completed));
    
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    
    return li;
}

/**
 * Update a todo in the list.
 *
 * Purpose:
 * - Finds the existing list item by id and replaces it with a fresh one.
 * - This ensures the UI matches the latest server state.
 */
function updateTodoInList(todo) {
    const li = todoList.querySelector(`li[data-id="${todo.id}"]`);
    if (li) {
        const newLi = createTodoElement(todo);
        li.replaceWith(newLi);
    }
}

/**
 * Remove a todo from the list.
 *
 * Purpose:
 * - Removes the list item from the DOM after a successful delete.
 * - If the list becomes empty, shows the empty-state message.
 */
function removeTodoFromList(id) {
    const li = todoList.querySelector(`li[data-id="${id}"]`);
    if (li) {
        li.remove();
    }
    if (todoList.children.length === 0) {
        showEmptyState(true);
    }
}

/**
 * Update the todo count display.
 *
 * Purpose:
 * - Counts current list items and updates the text UI.
 */
function updateCount() {
    const count = todoList.children.length;
    todoCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

/**
 * Show/hide loading state.
 *
 * Purpose:
 * - Displays a loading indicator while data is being fetched.
 */
function showLoading(show) {
    loadingState.style.display = show ? 'block' : 'none';
}

/**
 * Show/hide empty state.
 *
 * Purpose:
 * - Shows a friendly message when there are no todos.
 */
function showEmptyState(show) {
    emptyState.style.display = show ? 'block' : 'none';
}

/**
 * Show error message.
 *
 * Error handling details:
 * - Creates a Bootstrap alert element with the provided message.
 * - Inserts it above the list so users see it immediately.
 * - Auto-dismisses after 5 seconds to avoid clutter.
 */
function showError(message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    todoList.parentNode.insertBefore(alert, todoList);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => alert.remove(), 5000);
}

/**
 * Escape HTML to prevent XSS.
 *
 * Purpose:
 * - Converts user-provided text into safe text content.
 * - Prevents users from injecting HTML or scripts into the page.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
// Purpose:
// - Handle user interactions (form submission, app initialization).
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (title) {
        createTodo(title);
        todoInput.value = '';
        todoInput.focus();
    }
});

// Initialize app
// Purpose:
// - Fetch and render todos once the DOM is ready.
document.addEventListener('DOMContentLoaded', fetchTodos);
