const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const getUser = users.find((user) => user.username === username);

  if (!getUser) {
    return response.status(404).json({ error: "User not found" });
  }
  request.user = getUser;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const usernameAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  user = {
    username,
    name,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const userTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(userTodo);

  return response.status(201).json(userTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let getTodoById = user.todos.find((todo) => todo.id === id);

  if (!getTodoById) {
    return response.status(404).json({ error: "Not Found" });
  }

  getTodoById.title = title;
  getTodoById.deadline = new Date(deadline);
  return response.json(getTodoById);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let getTodoById = user.todos.find((todo) => todo.id === id);

  if (!getTodoById) {
    return response.status(404).json({ error: "Not Found" });
  }

  getTodoById.done = true;
  return response.json(getTodoById);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let getTodoById = user.todos.findIndex((todo) => todo.id === id);

  if (getTodoById === -1) {
    return response.status(404).json({ error: "Not Found" });
  }
  user.todos.splice(getTodoById, 1);

  return response.status(204).json();
});

module.exports = app;
