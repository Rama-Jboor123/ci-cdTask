import { getTodos, createTodo, updateTodo, deleteTodo } from "./api.js";

// ========================
// DOM Elements
// ========================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const taskCounter = document.getElementById("taskCounter");

const filterButtons = document.querySelectorAll(".filter-btn");
const navItems = document.querySelectorAll(".nav-item");

const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const editCompleted = document.getElementById("editCompleted");
const updateTaskBtn = document.getElementById("updateTaskBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditModal = document.getElementById("closeEditModal");

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const sidebarOverlay = document.getElementById("sidebarOverlay");

// ========================
// Application State
// ========================

let todos = [];
let currentFilter = "all";

let selectedEditId = null;
let selectedDeleteId = null;

// ========================
// Load Tasks
// ========================

async function loadTodos() {
  showLoading(true);
  hideError();

  try {
    todos = await getTodos();
    renderTodos();
  } catch (error) {
    console.error(error);
    showError("Unable to load tasks. Please try again.");
  } finally {
    showLoading(false);
  }
}

// ========================
// Render Tasks
// ========================

function renderTodos() {
  todoList.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    todoList.style.display = "none";
    emptyState.style.display = "block";
  } else {
    todoList.style.display = "block";
    emptyState.style.display = "none";
  }

  filteredTodos.forEach((todo) => {
    const todoItem = createTodoElement(todo);
    todoList.appendChild(todoItem);
  });

  updateTaskCounter();
}

// ========================
// Create Todo HTML
// ========================

function createTodoElement(todo) {
  const todoItem = document.createElement("div");

  todoItem.classList.add("todo-item");

  const todoId = getTodoId(todo);

  const leftSection = document.createElement("div");
  leftSection.classList.add("todo-left");

  // Checkbox
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.classList.add("todo-checkbox");
  checkbox.checked = Boolean(todo.completed);

  checkbox.addEventListener("change", async () => {
    await toggleTodo(todo);
  });

  // Task information
  const todoInfo = document.createElement("div");
  todoInfo.classList.add("todo-info");

  const description = document.createElement("span");
  description.classList.add("todo-description");
  description.textContent = todo.description;

  if (todo.completed) {
    description.classList.add("completed");
  }

  const meta = document.createElement("span");
  meta.classList.add("todo-meta");
  meta.textContent = todo.completed ? "Completed" : "Active";

  todoInfo.appendChild(description);
  todoInfo.appendChild(meta);

  leftSection.appendChild(checkbox);
  leftSection.appendChild(todoInfo);

  // Actions
  const actions = document.createElement("div");
  actions.classList.add("todo-actions");

  const editButton = document.createElement("button");
  editButton.classList.add("icon-btn", "edit-btn");
  editButton.innerHTML = "✎";
  editButton.title = "Edit task";

  editButton.addEventListener("click", () => {
    openEditModal(todo);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("icon-btn", "delete-btn");
  deleteButton.innerHTML = "🗑";
  deleteButton.title = "Delete task";

  deleteButton.addEventListener("click", () => {
    openDeleteModal(todoId);
  });

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  todoItem.appendChild(leftSection);
  todoItem.appendChild(actions);

  return todoItem;
}

// ========================
// Get Todo ID
// ========================

function getTodoId(todo) {
  /*
    The current backend uses "task_dd" as the task identifier.
    The fallbacks make the frontend tolerant if the backend
    later returns task_id or id instead.
  */

  return todo.task_dd ?? todo.task_id ?? todo.id;
}

// ========================
// Add Task
// ========================

async function handleAddTask() {
  const description = taskInput.value.trim();

  if (!description) {
    showError("Please enter a task.");
    taskInput.focus();
    return;
  }

  hideError();

  addTaskBtn.disabled = true;

  try {
    const newTodo = await createTodo(description);

    todos.push(newTodo);

    taskInput.value = "";

    currentFilter = "all";
    updateActiveFilterButtons();

    renderTodos();
  } catch (error) {
    console.error(error);
    showError("Unable to add the task. Please try again.");
  } finally {
    addTaskBtn.disabled = false;
  }
}

// Add button
addTaskBtn.addEventListener("click", handleAddTask);

// Enter key
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAddTask();
  }
});

// ========================
// Complete / Uncomplete
// ========================

async function toggleTodo(todo) {
  const id = getTodoId(todo);

  if (id == null) {
    showError("Task ID is missing.");
    renderTodos();
    return;
  }

  hideError();

  try {
    const updatedTodo = await updateTodo(id, todo.description, !todo.completed);

    replaceTodo(updatedTodo);

    renderTodos();
  } catch (error) {
    console.error(error);

    showError("Unable to update the task.");
    renderTodos();
  }
}

// ========================
// Edit Task
// ========================

function openEditModal(todo) {
  selectedEditId = getTodoId(todo);

  editTaskInput.value = todo.description;
  editCompleted.checked = Boolean(todo.completed);

  editModal.classList.add("show");

  editTaskInput.focus();
}

function closeEdit() {
  editModal.classList.remove("show");

  selectedEditId = null;

  editTaskInput.value = "";
  editCompleted.checked = false;
}

async function handleUpdateTask() {
  if (selectedEditId == null) {
    return;
  }

  const description = editTaskInput.value.trim();

  if (!description) {
    showError("Task description cannot be empty.");
    return;
  }

  updateTaskBtn.disabled = true;
  hideError();

  try {
    const updatedTodo = await updateTodo(
      selectedEditId,
      description,
      editCompleted.checked,
    );

    replaceTodo(updatedTodo);

    closeEdit();

    renderTodos();
  } catch (error) {
    console.error(error);
    showError("Unable to update the task.");
  } finally {
    updateTaskBtn.disabled = false;
  }
}

updateTaskBtn.addEventListener("click", handleUpdateTask);

cancelEditBtn.addEventListener("click", closeEdit);

closeEditModal.addEventListener("click", closeEdit);

// ========================
// Delete Task
// ========================

function openDeleteModal(id) {
  selectedDeleteId = id;

  deleteModal.classList.add("show");
}

function closeDelete() {
  deleteModal.classList.remove("show");

  selectedDeleteId = null;
}

async function handleDeleteTask() {
  if (selectedDeleteId == null) {
    return;
  }

  confirmDeleteBtn.disabled = true;
  hideError();

  try {
    await deleteTodo(selectedDeleteId);

    todos = todos.filter((todo) => getTodoId(todo) !== selectedDeleteId);

    closeDelete();

    renderTodos();
  } catch (error) {
    console.error(error);
    showError("Unable to delete the task.");
  } finally {
    confirmDeleteBtn.disabled = false;
  }
}

confirmDeleteBtn.addEventListener("click", handleDeleteTask);

cancelDeleteBtn.addEventListener("click", closeDelete);

// ========================
// Filters
// ========================

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function setFilter(filter) {
  currentFilter = filter;

  updateActiveFilterButtons();

  renderTodos();

  closeSidebar();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

navItems.forEach((button) => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

function updateActiveFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });

  navItems.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

// ========================
// Task Counter
// ========================

function updateTaskCounter() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  const total = todos.length;

  if (total === 0) {
    taskCounter.textContent = "";
    return;
  }

  taskCounter.textContent = `${remaining} of ${total} tasks remaining`;
}

// ========================
// Replace Updated Todo
// ========================

function replaceTodo(updatedTodo) {
  const updatedId = getTodoId(updatedTodo);

  todos = todos.map((todo) => {
    return getTodoId(todo) === updatedId ? updatedTodo : todo;
  });
}

// ========================
// Error Message
// ========================

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// ========================
// Loading
// ========================

function showLoading(show) {
  loadingMessage.style.display = show ? "block" : "none";
}

// ========================
// Mobile Sidebar
// ========================

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
}

menuBtn.addEventListener("click", openSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);

// ========================
// Close Modals by Clicking Outside
// ========================

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEdit();
  }
});

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    closeDelete();
  }
});

// ESC closes modals/sidebar
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeEdit();
    closeDelete();
    closeSidebar();
  }
});

// ========================
// Start Application
// ========================
loadTodos();
