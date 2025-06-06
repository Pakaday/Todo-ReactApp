import { useState, useEffect } from 'react';
import './App.css';

function TodoList({ user }) {
    const [todos, setTodos] = useState([]);

    const formatDate = (isoDateStr) => {
        if (!isoDateStr || typeof isoDateStr !== 'string' || !isoDateStr.includes('T')) {
            return 'No due date';
        }
        const [datePart] = isoDateStr.split('T');
        const [year, month, day] = datePart.split('-');
        return `${month}/${day}/${year}`;
    };

    // Load todo list based on user
    useEffect(() => {
        if (user === 'guest') {
            const guestTodos = JSON.parse(localStorage.getItem('guest')) || [];
            setTodos(guestTodos);
        }
    }, [user]);

    useEffect(() => {
        if (user === 'guest') {
            localStorage.setItem('guest', JSON.stringify(todos));
        }
    }, [todos, user]);

    // Fetch todo list when page loads
    useEffect(() => {
        if (user === 'guest') return; // Skip backend if guest
        fetch(`${process.env.REACT_APP_API_URL}/TodoItems`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setTodos(data);
            })
            .catch(error => {
                console.error('Fetch error:', error);
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

    // Search bar
    const [query, setQuery] = useState('');
    const listToShow = query
        ? todos.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase()))
        : todos;

    const resetForm = () => {
        setId(null);
        setTitle('');
        setDescription('');
        setIsCompleted(false);
        setDueDate('');
        setIsSubmit(false);
        setIsEditing(false);

        // Reset validation 
        setTitleError('Task name required')
        setDueDateError('Due date required')
    };

    // Form submission 
    const handleSubmit = (e) => {
        e.preventDefault();

        let hasError = false;

        // Validation for input
        if (!title) {
            setTitleError('Task name required');
            hasError = true;
        } else {
            setTitleError('');
        }

        if (!dueDate) {
            setDueDateError('Due date required');
            hasError = true;
        } else {
            setDueDateError('');
        }

        if (hasError) return;

        // Disable Submit button
        setIsSubmit(true);

        const newTodo = {
            title,
            description,
            isCompleted,
            dueDate: new Date(dueDate).toISOString()
        };

        const updateTodo = {
            id,
            title,
            description,
            isCompleted,
            dueDate: new Date(dueDate).toISOString()
        };

        if (user === 'guest') {
            if (isEditing) {
                const updatedTodos = todos.map(todo =>
                    todo.id === id ? { id, title, description, isCompleted, dueDate } : todo
                );
                setTodos(updatedTodos);
            } else {
                const guestId = Date.now();
                const newGuestTodo = {
                    id: guestId,
                    title,
                    description,
                    isCompleted,
                    dueDate: new Date(dueDate).toISOString()
                };
                console.log('Creating guest todo:', newGuestTodo);
                setTodos(prev => [...prev, newGuestTodo]);
            }

            resetForm();
            return;
        }
        // Update method for PUT/POST 
        if (isEditing) {
            fetch(`${process.env.REACT_APP_API_URL}/TodoItems/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            console.log('Submitting newTodo:', newTodo); // Debug
            fetch(`${process.env.REACT_APP_API_URL}/TodoItems`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        if (user === 'guest') {
            setTodos(prev => prev.filter(todo => todo.id !== id && todo.title !== id));
            return;
        }

        console.log('Deleting ID:', id); // REMOVE
        setDeletingId(id);

        fetch(`${process.env.REACT_APP_API_URL}/TodoItems/${id}`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
        <div className="App nav-buttons">
            {user === 'guest' ? (
                <button onClick={() => window.location.href = '/'}>Go Back</button>
            ) : (
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    } }>Logout</button>
            )}
            <h1>Todo List</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter a task
                    <br />
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className={titleError ? 'error' : ''}
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
            <br />
            <label>
                <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </label>
            <div className="task-list">
                {listToShow.map(todo => (
                    <div className="task-card" key={todo.id || `${todo.title}-${todo.dueDate}`}>
                        <div>
                            <strong>{todo.title}</strong>
                            {todo.description && <p>{todo.description}</p>}
                            <p>{todo.isCompleted ? 'Completed' : 'Pending'} - {formatDate(todo.dueDate)}</p>
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
                                //setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
                                setDueDate(typeof todo.dueDate == 'string' && todo.dueDate.includes('T')
                                    ? todo.dueDate.split('T')[0]
                                    : todo.dueDate || ''
                                );
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

export default TodoList;
