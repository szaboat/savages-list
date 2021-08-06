import React, { useState } from "react";
import ReactHtmlParser from "react-html-parser";
import "./App.css";
import { ReactSortable } from "react-sortablejs";

type Todo = {
  id: string;
  text: string;
  status: TodoStatus;
  duration: number;
};

enum TodoStatus {
  TODO = "todo",
  DOING = "doing",
  DONE = "done",
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

function gen4() {
  return Math.random().toString(16).slice(-4);
}

function simpleUniqueId() {
  return "".concat(
    [gen4(), gen4(), gen4(), gen4(), gen4(), gen4(), gen4(), gen4()].join("")
  );
}

const renderText = (s: string) => {
  return s.replaceAll(/#\S+/g, "<span class='tag'>$&</span>");
};

function TodoItem({
  todo,
  index,
  onUpdate,
  onDelete,
  showActions,
}: {
  todo: Todo;
  index: number;
  onUpdate: (index: number) => void;
  onDelete: (id: string) => void;
  showActions: boolean;
}): JSX.Element {
  const renderStatus = (todo: Todo) => {
    switch (todo.status) {
      case TodoStatus.TODO:
        return <span className="checkbox"></span>;
      case TodoStatus.DOING:
        return (
          <span
            className="checkbox"
            style={{
              background:
                "linear-gradient(to bottom right,black 50%,transparent 50%)",
            }}
          ></span>
        );
      case TodoStatus.DONE:
        return (
          <span
            className="checkbox"
            style={{
              background: "black",
            }}
          ></span>
        );
      default:
        return "☐";
    }
  };

  return (
    <div className="todo">
      <div style={{ justifyContent: "left", flex: 1 }}>
        <span
          onClick={(e) => {
            onUpdate(index);
          }}
        >
          {showActions ? renderStatus(todo) : null}
        </span>

        <span className={todo.status === TodoStatus.DONE ? "done" : ""}>
          {ReactHtmlParser(renderText(todo.text))}
        </span>
      </div>

      <span
        className="delete"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(todo.id);
        }}
      >
        Delete
      </span>
    </div>
  );
}

function TodoForm({
  addTodo,
}: {
  addTodo: (text: string) => any;
}): JSX.Element {
  const [value, setValue] = React.useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="What needs to be done?"
        type="text"
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

function App() {
  const [todos, setTodos] = useLocalStorage("todos", [
    {
      text: "Learn about React",
      status: TodoStatus.TODO,
      id: simpleUniqueId(),
      duration: 0,
    },
  ]);

  const addTodo = (text: string) => {
    const newTodos = [
      { text, status: TodoStatus.TODO, id: simpleUniqueId(), duration: 0 },
      ...todos,
    ];
    setTodos(newTodos);
  };

  const deleteTodo = async (index: string) => {
    const confirmResult = window.confirm("Are you sure?");
    if (confirmResult) {
      const newTodos = todos.filter((t) => `${t.id}` !== `${index}`);
      setTodos(newTodos);
    }
  };

  const updateTodo = (index: number) => {
    const getStatus = (status: TodoStatus): TodoStatus => {
      if (status === TodoStatus.TODO) {
        return TodoStatus.DOING;
      } else if (status === TodoStatus.DOING) {
        return TodoStatus.DONE;
      } else {
        return TodoStatus.TODO;
      }
    };

    const newTodos = [...todos];
    newTodos[index].status = getStatus(newTodos[index].status);
    setTodos(newTodos);
  };

  const currentTodos = todos.filter((t) => t.status === TodoStatus.DOING);

  return (
    <div className="app">
      <div className="todo-list">
        <TodoForm addTodo={addTodo} />
        <ReactSortable list={todos} setList={setTodos}>
          {todos.map((todo, index) => (
            <TodoItem
              showActions={true}
              key={index}
              index={index}
              todo={todo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ReactSortable>
      </div>

      <div
        className="current"
        style={{ backgroundColor: "lightyellow", padding: "10px" }}
      >
        <h2>Current focus</h2>
        {currentTodos.map((todo, index) => (
          <TodoItem
            key={index}
            showActions={false}
            index={index}
            todo={todo}
            onUpdate={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
