import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useNavigate } from 'react-router-dom';
import './App.css';

function TodoList() {
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState(null); 
    const [editValue, setEditValue] = useState('');   
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const response = await api.get('/items');
            const sorted = response.data.sort((a, b) => a.isComplete - b.isComplete);
            setItems(sorted);
        } catch (err) {
            console.error("שגיאה בטעינת נתונים:", err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/login');  
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        try {
            await api.post('/items', { Name: newItemName, IsComplete: false });
            setNewItemName('');
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const toggleComplete = async (item) => {
        try {
            await api.put(`/items/${item.id}`, { ...item, isComplete: !item.isComplete });
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/items/${id}`);
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditValue(item.name);
    };

    const saveEdit = async (item) => {
        if (!editValue.trim()) {
            setEditingId(null);
            return;
        }
        try {
            await api.put(`/items/${item.id}`, { ...item, name: editValue });
            setEditingId(null);
            fetchItems();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="app-viewport">
            <div className="glass-card">
                <header className="app-header">
                    <h1 className="app-title">המשימות שלי</h1>
                    <button className="logout-btn" onClick={handleLogout}>יציאה</button>
                </header>

                <form className="add-task-box" onSubmit={handleAddItem}>
                    <input 
                        type="text" 
                        placeholder="להוסיף משימה חדשה..." 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <button type="submit" className="add-btn">+</button>
                </form>

                <div className="tasks-container">
                    {items.map(item => (
                        <div key={item.id} className={`task-row ${item.isComplete ? 'task-done' : ''}`}>
                            <div className="task-right">
                                <input 
                                    type="checkbox" 
                                    className="task-checkbox"
                                    checked={item.isComplete} 
                                    onChange={() => toggleComplete(item)} 
                                />
                                
                                {editingId === item.id ? (
                                    <input 
                                        className="inline-edit-input"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => saveEdit(item)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(item)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="task-text" onClick={() => !item.isComplete && startEdit(item)}>
                                        {item.name}
                                    </span>
                                )}
                            </div>

                            <div className="task-actions">
                                {!item.isComplete && editingId !== item.id && (
                                    <button className="action-btn btn-edit" onClick={() => startEdit(item)}>✏️</button>
                                )}
                                <button className="action-btn btn-delete" onClick={() => deleteItem(item.id)}>❌</button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p style={{textAlign:'center', color:'#ccc'}}>אין משימות בינתיים...</p>}
                </div>
            </div>
        </div>
    );
}

export default TodoList;