import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const fetchTodos = () => {
    fetch(DB_URL)
      .then((response) => response.json())
      .then((data) => setTodos(data))
      .catch((error) => console.error(error));
  };

  const DB_URL = 'http://192.168.0.240:3001/todos';

  useEffect(() => {
    // Fetch todos when component mounts
    fetchTodos();

    // Poll for new todos every 5 seconds
    const intervalId = setInterval(fetchTodos, 2000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleAddTodo = () => {
    const newTodo = prompt('Gib ein neues Todo ein');

    fetch(DB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: newTodo,
      }),
    })
      .then((response) => response.json())
      .then((data) => setTodos([...todos, data]))
      .catch((error) => console.error(error));
  };

  const handleStatusChange = (id, status) => {
    // Änderung im Frontend direkt durchführen
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    const updatedTodo = { ...todos[todoIndex], status };
    setTodos([
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1),
    ]);

    // Änderung in der Datenbank durchführen
    fetch(`${DB_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  const handleClearTodos = async () => {
    await fetch(DB_URL, {
      method: 'DELETE',
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setTodos([]);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className='container'>
      <div className='categories'>
        <div className='category'>
          <h2>Todo</h2>
          <ul>
            {todos
              .filter((todo) => todo.status === 'todo')
              .map((todo) => (
                <li className='todo' key={todo.id}>
                  {todo.task}
                  <button
                    className='move-right-btn'
                    onClick={() => handleStatusChange(todo.id, 'in_progress')}
                  >
                    →
                  </button>
                </li>
              ))}
          </ul>
        </div>
        <div className='category'>
          <h2>In Arbeit</h2>
          <ul>
            {todos
              .filter((todo) => todo.status === 'in_progress')
              .map((todo) => (
                <li className='in-progress' key={todo.id}>
                  {todo.task}
                  <button
                    className='move-left-btn'
                    onClick={() => handleStatusChange(todo.id, 'todo')}
                  >
                    ←
                  </button>
                  <button
                    className='move-right-btn'
                    onClick={() => handleStatusChange(todo.id, 'done')}
                  >
                    →
                  </button>
                </li>
              ))}
          </ul>
        </div>
        <div className='category'>
          <h2>Fertig</h2>
          <ul>
            {todos
              .filter((todo) => todo.status === 'done')
              .map((todo) => (
                <li className='done' key={todo.id}>
                  {todo.task}
                  <button
                    className='move-left-btn'
                    onClick={() => handleStatusChange(todo.id, 'in_progress')}
                  >
                    ←
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <button className='add-button' onClick={() => handleAddTodo()}>
        +
      </button>
      <button className='del-button' onClick={() => handleClearTodos()}>
        ALLES LÖSCHEN
      </button>
    </div>
  );
}

export default App;
