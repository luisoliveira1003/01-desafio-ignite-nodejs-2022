const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(401).json({ error: "Unauthorized" });

  request.user = user;

  return next();
}

function userAlreadyExists(username) {
  const userExists = users.some((user) => user.username === username);

  return userExists;
}

function findTodoById(todos, idTodo) {
  const todoIndex = todos.findIndex((todos) => todos.id === idTodo);

  return todoIndex;
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = userAlreadyExists(username);

  if (userExists)
    return response.status(400).json({ error: "User already exists!" });

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json({ message: "User created!" });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = findTodoById(user.todos, id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not found!" });

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = findTodoById(user.todos, id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not found!" });

  user.todos[todoIndex].done = true;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = findTodoById(user.todos, id);

  if (todoIndex === -1)
    return response.status(404).json({ error: "Todo not found!" });

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
