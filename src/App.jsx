import { useEffect, useState } from 'react';
import axios from 'axios';
// Asegúrate de que este archivo CSS se esté importando.
import './App.css';

// URL base de la API para no repetirla
const API_URL = "http://localhost:5237/api/productos";

const initialFormState = { nombre: '', descripcion: '', precio: '', estado: true };

function App() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get(API_URL);
        setProductos(response.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: inputValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) {
      alert("Nombre y Precio son campos obligatorios.");
      return;
    }

    if (editingId) {
      try {
        const updatePayload = {
          ...formData,
          id: editingId,
          fechaCreacion: new Date().toISOString()
        };

        // Se envía el payload con el id incluido a la API
        const response = await axios.put(`${API_URL}/${editingId}`, updatePayload);
        setProductos(productos.map(p => (p.id === editingId ? response.data : p)));
        setEditingId(null);
      } catch (err) {
        console.error("Error al actualizar producto:", err);
        setError(err);
      }
    } else {
      try {
        const newProductPayload = {
          ...formData,
          fechaCreacion: new Date().toISOString()
        };
        const response = await axios.post(API_URL, newProductPayload);
        setProductos([...productos, response.data]);
      } catch (err) {
        console.error("Error al crear producto:", err);
        setError(err);
      }
    }
    setFormData(initialFormState);
  };

  const handleEdit = (producto) => {
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      estado: producto.estado
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProductos(productos.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        setError(err);
      }
    }
  };

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (error) return <div className="error-state">Error: {error.message}</div>;

  return (
    <div className="App">
      <header>
        <h1>Gestión de Productos</h1>
      </header>

      <main>
        <div className="form-container card">
          <h2>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre del producto" value={formData.nombre} onChange={handleInputChange} required />
            <input type="text" name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} />
            <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleInputChange} required step="0.01" />
            <label className="checkbox-label">
              <input type="checkbox" name="estado" checked={formData.estado} onChange={handleInputChange} />
              <span>Activo</span>
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Actualizar' : 'Agregar'}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData(initialFormState); }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="product-list">
          <h3>Lista de productos</h3>
          <ul>
            {productos.length > 0 ? (
              productos.map(producto => (
                <li key={producto.id} className="card">
                  <div className="product-info">
                    <strong>{producto.nombre}</strong>
                    <span className="product-price">${parseFloat(producto.precio).toFixed(2)}</span>
                    <p>{producto.descripcion}</p>
                    <div className="product-meta">
                      <span className={`status ${producto.estado ? 'status-active' : 'status-inactive'}`}>
                        {producto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                      {producto.fechaCreacion && (
                        <span className="creation-date">
                          Creado: {new Date(producto.fechaCreacion).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="button-group">
                    <button className="btn btn-icon" onClick={() => handleEdit(producto)}>✏️</button>
                    <button className="btn btn-icon btn-delete" onClick={() => handleDelete(producto.id)}>🗑️</button>
                  </div>
                </li>
              ))
            ) : (
              <p>No hay productos para mostrar.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
