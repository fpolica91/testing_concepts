const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAlreadyExists = users.find((user) => user.username === username);
  if (!userAlreadyExists) {
    return response.status(404).json({ error: "only authorized users" });
  }
  request.user = userAlreadyExists;
  return next();
}

app.post("/users", (request, response) => {
  const {
    body: { name, username },
  } = request;

  const userAlreadyExists = users.some((u) => u.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }
  const user = Object.assign({}, { id: uuidv4(), username, name, todos: [] });

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
  } = request;

  return response.status(201).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = Object.assign(
    {},
    {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    }
  );
  user.todos.push(todo);
  
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const {
    user
  } = request;

  const todo = user.todos.find(t => t.id === request.params.id);
  if (!todo) {
    return response.status(404).json({ error: "todo does not exits" });
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const todo = user.todos.find(t => t.id === request.params.id);
  if(!todo){
    return response.status(404).json({error: "cannot find todo"});
  }
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const todo = user.todos.find(t => t.id === request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo doesn't exists" });
    }
    user.todos.splice(request.param.id, 1);
    return response.status(204).json(user.todos);
});

module.exports = app;
