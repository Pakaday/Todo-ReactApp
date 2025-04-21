import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [todos, setTodos] = useState([
        //{ id: 1, name: 'Sample Task' },
        //{ id: 2, name: 'Another one' }
    ]);

    useEffect(() => {
        fetch('http://localhost:5209/api/TodoItems')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setTodos(data);
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
            });
        console.log('Component loaded');
    }, []);

    const [userInput, setUserInput] = useState('');
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [dueDate, setDueDate] = useState('');


    // Validate input in the console
    useEffect(() => {
        console.log('User input changed:', userInput);
    }, [userInput]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newTodo = {
            title: userInput,
            description,
            isCompleted,
            dueDate
        };

        fetch('http://localhost:5209/api/TodoItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo)
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                setTodos([...todos, data]);
                // Clear input field
                setUserInput('');
                setDescription('');
                setIsCompleted('');
                setDueDate('');
            })
            .catch(error => {
                console.error('Error adding item:', error);
            });
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5209/api/TodoItems/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
                } else {
                    console.error('Failed to delete task');
                }
            })
            .catch(error => console.error('Error deleting task:', error));
    };

    return (
        <div className="App">
            <h1>Todo List</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter a task
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Is Complete?
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                    />
                </label>
                <br />
                <label>
                    Due Date:
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </label>
                <br />
                <button type="submit">Submit</button>
            </form>
            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>
                        {todo.title} - {todo.description} - {todo.isCompleted ? 'Completed' : 'Pending'} - {todo.dueDate}
                        <button onClick={() => handleDelete(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
