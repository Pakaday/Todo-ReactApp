import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/TodoItems`)
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
    const [isSubmit, setIsSubmit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    // Validate input in the console
    useEffect(() => {
        console.log('User input changed:', userInput);
    }, [userInput]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for input
        if (!userInput || !dueDate) {
            console.error('Task title and due date are required.');
            return;
        }

        setIsSubmit(true);

        const newTodo = {
            title: userInput,
            description,
            isCompleted,
            dueDate
        };

        fetch(`${process.env.REACT_APP_API_URL}/TodoItems`, {

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
                setIsCompleted(false);
                setDueDate('');
            })
            .catch(error => {
                console.error('Error adding item:', error);
            })
            .finally(() => {
                setIsSubmit(false);
            });
    };

    const handleDelete = (id) => {
        console.log('Deleting ID:', id);
        setDeletingId(id);

        fetch(`${process.env.REACT_APP_API_URL}/TodoItems/${id}`, {

            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
                } else {
                    console.error('Failed to delete task');
                }
            })
            .catch(error => console.error('Error deleting task:', error))
            .finally(() => {
                setDeletingId(null);
            })
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
                <button type="submit" disabled={isSubmit}>
                    {isSubmit ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>
                        {todo.title} - {todo.description} - {todo.isCompleted ? 'Completed' : 'Pending'} - {new Date(todo.dueDate).toLocaleDateString()}
                        <button onClick={() => handleDelete(todo.id)} disabled={deletingId === todo.id}>
                            {deletingId === todo.id ? 'Deleting...' : 'Delete'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
