const API_URL = "/todo";

// Get all tasks
export async function getTodos() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return await response.json();
}

// Create a new task
export async function createTodo(description) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: description,
      completed: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return await response.json();
}

// Update an existing task
export async function updateTodo(id, description, completed) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: description,
      completed: completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return await response.json();
}

// Delete a task
export async function deleteTodo(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }

  return await response.json();
}
