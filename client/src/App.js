import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);

    // Fetch todo list when page loads
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/TodoItems`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setTodos(data);
            })
            .catch(error => {
                alert('Error fetching from database:', error);
            });
    }, []);

    // Form input
    const [id, setId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [isSubmit, setIsSubmit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Real-time validation NEW
    const [titleError, setTitleError] = useState('Task name required');
    const [dueDateError, setDueDateError] = useState('Due date required');

    const resetForm = () => {
        setId(null);
        setTitle('');
        setDescription('');
        setIsCompleted(false);
        setDueDate('');
        setIsSubmit(false);
        setIsEditing(false);
        setDueDateError('Due date required') // Makes submitting due date show validation on reset NEW
    };

    // Form submission 
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for input
        if (!title || !dueDate) {
            alert('Task and due date are required.'); // REMOVE
            return;
        }

        // Disable Submit button
        setIsSubmit(true);

        const newTodo = {
            title,
            description,
            isCompleted,
            dueDate
        };

        const updateTodo = {
            id,
            title,
            description,
            isCompleted,
            dueDate

        }
        // Update method for PUT/POST 
        if (isEditing) {
            fetch(`${process.env.REACT_APP_API_URL}/TodoItems/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateTodo)
            })
                .then(response => response.json())
                .then(data => {
                    setTodos(prev => prev.map(todo => todo.id === id ? data : todo));
                    resetForm();
                })
                .catch(error => {
                    alert('Error updating items:', error);
                })
                .finally(() => {
                    setIsSubmit(false);
                });

        } else {

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
                    // Add new task to list
                    setTodos([...todos, data]);
                    // Clear input field
                    resetForm();
                })
                .catch(error => {
                    alert('Error adding item:', error);
                })
                .finally(() => {
                    setIsSubmit(false);
                });
        }
    };

        // Delete handler
        const handleDelete = (id) => {
            console.log('Deleting ID:', id); // REMOVE
            setDeletingId(id);

            fetch(`${process.env.REACT_APP_API_URL}/TodoItems/${id}`, {

                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
                    } else {
                        alert('Failed to delete task');
                    }
                })
                .catch(error => alert('Error deleting task:', error))
                .finally(() => {
                    setDeletingId(null);
                })
        };

    // Task title valdiation
    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);

        if (!value.trim()) {
            setTitleError('Task name required');
        } else {
            setTitleError('');
        }
    }
    // Due date validation
    const handleDateChange = (e) => {
        const value = e.target.value;
        setDueDate(value);

        if (!value) {
            setDueDateError('Due date required');
        } else {
            setDueDateError('');
        }
    }

        return (
            <div className="App">
                <h1>Todo List</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                        Enter a task
                        <br />
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className={titleError ? 'error' : '' }
                        />
                        {titleError && <p className="error-message">{titleError}</p>}
                    </label>
                    <br />
                    <label>
                        Description
                        <br />
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
                        Due Date
                        <br />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={handleDateChange}
                            className={dueDateError ? 'error' : ''}
                        />
                        {dueDateError && <p className="error-message">{dueDateError}</p>}
                    </label>
                    <br />
                    <button type="submit" disabled={isSubmit}>
                        {isSubmit ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
                <div className="task-list">
                    {todos.map(todo => (
                        <div className="task-card" key={todo.id}>
                            <div>
                                <strong>{todo.title}</strong>
                                {todo.description && <p>{todo.description}</p>}
                                <p>{todo.isCompleted ? 'Completed' : 'Pending'} - {new Date(todo.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="task-actions">
                                <button onClick={() =>
                                    handleDelete(todo.id)}
                                    disabled={deletingId === todo.id}>
                                    {deletingId === todo.id ? 'Deleting...' : 'Delete'}
                                </button>
                                <button onClick={() => {
                                    setTitle(todo.title);
                                    setDescription(todo.description);
                                    setIsCompleted(todo.isCompleted);
                                    setDueDate(todo.dueDate.split('T')[0]);
                                    setIsEditing(true);
                                    setId(todo.id);
                                    setTitleError('');
                                    setDueDateError('');
                                }}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

export default App;
