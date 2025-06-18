import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api/items';

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', _id: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load items');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const options = {
        method: form._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description
        })
      };

      const url = form._id ? `${API_BASE_URL}/${form._id}` : API_BASE_URL;
      const response = await fetch(url, options);
      
      if (!response.ok) throw new Error('Failed to save item');
      
      setForm({ name: '', description: '', _id: null });
      setIsEditing(false);
      await fetchItems();
      setError('');
    } catch (err) {
      setError('Failed to save item');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item) => {
    setForm(item);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ name: '', description: '', _id: null });
    setIsEditing(false);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchItems();
      setError('');
    } catch (err) {
      setError('Failed to delete item');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-pulse">
            CRUD App
          </h1>
          <p className="text-gray-600">Manage your items with style</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-bounce">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 backdrop-blur-sm bg-opacity-90 transform transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter item name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                placeholder="Enter item description"
                value={form.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
              </button>
              
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Items</h2>
          
          {loading && items.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">No items yet</p>
              <p className="text-gray-400">Add your first item above!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-105"
                  style={{ 
                    animation: `slideUp 0.5s ease-out ${index * 100}ms both`,
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {item.name}
                    </h3>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => editItem(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                        title="Edit item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {item.createdAt && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}