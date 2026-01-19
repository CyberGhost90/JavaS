import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const result = await window.storage.get('todos');
        if (result && result.value) {
          setTodos(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No existing todos');
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, []);

  useEffect(() => {
    if (!isLoading && todos.length >= 0) {
      window.storage.set('todos', JSON.stringify(todos)).catch(err => {
        console.error('Failed to save todos:', err);
      });
    }
  }, [todos, isLoading]);

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">To-Do List</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Completed ({todos.length - activeCount})
            </button>
          </div>

          <div className="space-y-2">
            {filteredTodos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tasks to display</p>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
