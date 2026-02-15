import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/category';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    status: 'active'
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingSellers: 0,
    pendingOrders: 0,
    rejectedOrders: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // API setup
  const API = axios.create({
    baseURL: 'http://127.0.0.1:5000/api'
  });

  API.interceptors.request.use((req) => {
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    if (user.id || user._id) {
      req.headers['user-id'] = user.id || user._id;
    }
    return req;
  });

  useEffect(() => {
    loadDashboardData();
    loadCategories();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data...');
      
      const statsRes = await API.get('/admin/dashboard/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const usersRes = await API.get('/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      const productsRes = await API.get('/admin/products');
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }

      // Load all orders with details
      const ordersRes = await API.get('/orders/all');
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
        
        // Update stats with order info
        const pendingOrders = ordersRes.data.data.filter(o => o.status === 'pending').length;
        const rejectedOrders = ordersRes.data.data.filter(o => o.status === 'rejected').length;
        
        setStats(prev => ({
          ...prev,
          pendingOrders,
          rejectedOrders
        }));
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting category data:', categoryFormData);
      
      const dataToSend = {
        name: categoryFormData.name,
        description: categoryFormData.description || '',
        parentCategory: categoryFormData.parentCategory || null,
        status: categoryFormData.status || 'active'
      };
      
      if (editingCategory) {
        const response = await updateCategory(editingCategory._id, dataToSend);
        console.log('Update response:', response.data);
        alert('Category updated successfully!');
      } else {
        const response = await createCategory(dataToSend);
        console.log('Create response:', response.data);
        alert('Category created successfully!');
      }
      resetCategoryForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
      parentCategory: category.parentCategory?._id || '',
      status: category.status || 'active'
    });
    setShowCategoryForm(true);
    setActiveTab('categories');
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      try {
        await deleteCategory(id);
        alert('Category deleted successfully!');
        loadCategories();
      } catch (error) {
        alert('Error deleting category: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      parentCategory: '',
      status: 'active'
    });
  };

  const approveSeller = async (sellerId) => {
    try {
      const response = await API.put(`/admin/approve-seller/${sellerId}`);
      if (response.data.success) {
        alert('Seller approved successfully!');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Error approving seller: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await API.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          alert('User deleted successfully!');
          loadDashboardData();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await API.delete(`/admin/products/${productId}`);
        if (response.data.success) {
          alert('Product deleted successfully!');
          loadDashboardData();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await API.put(`/orders/${orderId}/status`, { status });
      if (response.data.success) {
        alert(`Order status updated to ${status}`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + (error.response?.data?.message || error.message));
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>👑 Admin Dashboard - Royal Store</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Welcome, {user.name}!</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <h3 style={styles.statLabel}>Total Users</h3>
          <p style={styles.statNumber}>{stats.totalUsers}</p>
          <small style={styles.statSmall}>👥 {stats.totalCustomers} Customers | {stats.totalSellers} Sellers</small>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <h3 style={styles.statLabel}>Sellers</h3>
          <p style={styles.statNumber}>{stats.totalSellers}</p>
          <small style={styles.statSmall}>⏳ {stats.pendingSellers} Pending Approval</small>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
          <h3 style={styles.statLabel}>Products</h3>
          <p style={styles.statNumber}>{stats.totalProducts}</p>
          <small style={styles.statSmall}>📦 Across all sellers</small>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
          <h3 style={styles.statLabel}>Orders</h3>
          <p style={styles.statNumber}>{stats.totalOrders}</p>
          <small style={styles.statSmall}>💰 Revenue: ₹{stats.totalRevenue?.toLocaleString() || 0}</small>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'}}>
          <h3 style={styles.statLabel}>Pending Orders</h3>
          <p style={styles.statNumber}>{stats.pendingOrders || 0}</p>
          <small style={styles.statSmall}>⏳ Awaiting action</small>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'}}>
          <h3 style={styles.statLabel}>Rejected Orders</h3>
          <p style={styles.statNumber}>{stats.rejectedOrders || 0}</p>
          <small style={styles.statSmall}>❌ By sellers</small>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{...styles.tab, background: activeTab === 'dashboard' ? '#3498db' : '#ecf0f1', color: activeTab === 'dashboard' ? 'white' : '#333'}}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{...styles.tab, background: activeTab === 'users' ? '#3498db' : '#ecf0f1', color: activeTab === 'users' ? 'white' : '#333'}}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('sellers')} 
          style={{...styles.tab, background: activeTab === 'sellers' ? '#3498db' : '#ecf0f1', color: activeTab === 'sellers' ? 'white' : '#333'}}
        >
          Sellers
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          style={{...styles.tab, background: activeTab === 'products' ? '#3498db' : '#ecf0f1', color: activeTab === 'products' ? 'white' : '#333'}}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          style={{...styles.tab, background: activeTab === 'orders' ? '#3498db' : '#ecf0f1', color: activeTab === 'orders' ? 'white' : '#333'}}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('categories')} 
          style={{...styles.tab, background: activeTab === 'categories' ? '#3498db' : '#ecf0f1', color: activeTab === 'categories' ? 'white' : '#333'}}
        >
          📁 Categories ({categories.length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div>
            <h3 style={styles.sectionTitle}>Dashboard Overview</h3>
            <div style={styles.quickStats}>
              <div style={styles.quickStat}>
                <h4 style={styles.quickStatTitle}>Recent Orders</h4>
                {orders.length > 0 ? (
                  orders.slice(0, 5).map(order => (
                    <div key={order._id} style={styles.orderItem}>
                      <div>
                        <span>#{order.orderId || order._id?.slice(-6)} - </span>
                        <span>{order.customerName || order.customerId?.name || 'Customer'}</span>
                      </div>
                      <div style={styles.orderItemRight}>
                        <span style={{marginRight: '10px'}}>₹{order.totalAmount || 0}</span>
                        <span style={{...styles.statusBadge, 
                          background: order.status === 'delivered' ? '#27ae60' : 
                                    order.status === 'shipped' ? '#3498db' : 
                                    order.status === 'processing' ? '#f39c12' : 
                                    order.status === 'pending' ? '#e67e22' :
                                    order.status === 'rejected' ? '#e74c3c' : '#95a5a6'}}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={styles.noData}>No orders yet</p>
                )}
              </div>
              <div style={styles.quickStat}>
                <h4 style={styles.quickStatTitle}>Pending Sellers</h4>
                {users.filter(u => u.role === 'seller' && u.status === 'pending').length > 0 ? (
                  users.filter(u => u.role === 'seller' && u.status === 'pending').map(seller => (
                    <div key={seller._id} style={styles.sellerItem}>
                      <span>{seller.storeName || seller.name}</span>
                      <button onClick={() => approveSeller(seller._id)} style={styles.approveBtn}>
                        Approve
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={styles.noData}>No pending sellers</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 style={styles.sectionTitle}>All Users</h3>
            {users.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name} {user.storeName && <small>({user.storeName})</small>}</td>
                        <td>{user.email}</td>
                        <td>
                          <span style={{...styles.roleBadge, 
                            background: user.role === 'admin' ? '#e74c3c' : 
                                      user.role === 'seller' ? '#f39c12' : '#3498db'}}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span style={{...styles.statusBadge, 
                            background: user.status === 'active' ? '#27ae60' : 
                                      user.status === 'pending' ? '#f39c12' : '#95a5a6'}}>
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          {user.role !== 'admin' && (
                            <button onClick={() => deleteUser(user._id)} style={styles.deleteBtn}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>No users found</p>
            )}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div>
            <h3 style={styles.sectionTitle}>Seller Management</h3>
            {users.filter(u => u.role === 'seller').length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'seller').map(seller => {
                      const sellerProducts = products.filter(p => p.sellerId?._id === seller._id || p.seller === seller.name);
                      return (
                        <tr key={seller._id}>
                          <td><strong>{seller.storeName || seller.name}</strong></td>
                          <td>{seller.name}</td>
                          <td>{seller.email}</td>
                          <td>{sellerProducts.length}</td>
                          <td>
                            <span style={{...styles.statusBadge, 
                              background: seller.status === 'active' ? '#27ae60' : 
                                        seller.status === 'pending' ? '#f39c12' : '#95a5a6'}}>
                              {seller.status}
                            </span>
                          </td>
                          <td>
                            {seller.status !== 'active' && (
                              <button onClick={() => approveSeller(seller._id)} style={styles.approveBtn}>
                                Approve
                              </button>
                            )}
                            <button onClick={() => deleteUser(seller._id)} style={styles.deleteBtn}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>No sellers found</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h3 style={styles.sectionTitle}>All Products</h3>
            {products.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Seller</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Sold</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>{product.title}</td>
                        <td>₹{product.price}</td>
                        <td>{product.sellerId?.storeName || product.sellerId?.name || 'Unknown'}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td>{product.soldCount || 0}</td>
                        <td>
                          <span style={{...styles.statusBadge, 
                            background: product.status === 'active' ? '#27ae60' : '#f39c12'}}>
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => deleteProduct(product._id)} style={styles.deleteBtn}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>No products found</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 style={styles.sectionTitle}>All Orders</h3>
            {orders.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Seller Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>#{order.orderId || order._id?.slice(-8)}</td>
                        <td>{order.customerName || order.customerId?.name || 'Customer'}</td>
                        <td>
                          {order.items?.map((item, i) => (
                            <div key={i} style={{fontSize: '0.9rem'}}>
                              {item.title || item.productId?.title} x {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span style={{...styles.statusBadge, 
                            background: order.status === 'delivered' ? '#27ae60' : 
                                      order.status === 'shipped' ? '#3498db' : 
                                      order.status === 'processing' ? '#f39c12' : 
                                      order.status === 'pending' ? '#e67e22' :
                                      order.status === 'rejected' ? '#e74c3c' : '#95a5a6'}}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.sellerStatuses?.map((s, i) => (
                            <div key={i} style={{fontSize: '0.85rem', marginBottom: '3px'}}>
                              <strong>{s.sellerId?.storeName || 'Seller'}:</strong>{' '}
                              <span style={{
                                color: s.status === 'delivered' ? '#27ae60' : 
                                      s.status === 'shipped' ? '#3498db' : 
                                      s.status === 'accepted' ? '#f39c12' : 
                                      s.status === 'rejected' ? '#e74c3c' : 
                                      s.status === 'pending' ? '#e67e22' : '#95a5a6'
                              }}>
                                {s.status}
                              </span>
                            </div>
                          ))}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select 
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            value={order.status}
                            style={styles.statusSelect}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>No orders found</p>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div style={styles.header}>
              <h3 style={styles.sectionTitle}>Category Management</h3>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} style={styles.addBtn}>
                {showCategoryForm ? '✕ Cancel' : '+ Add Category'}
              </button>
            </div>

            {/* Category Form */}
            {showCategoryForm && (
              <form onSubmit={handleCategorySubmit} style={styles.form}>
                <h4 style={styles.formTitle}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    style={styles.input}
                    required
                    placeholder="e.g. Electronics, Fashion, Books"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryInputChange}
                    style={{...styles.input, minHeight: '80px'}}
                    placeholder="Brief description of this category"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent Category (Optional)</label>
                  <select
                    name="parentCategory"
                    value={categoryFormData.parentCategory}
                    onChange={handleCategoryInputChange}
                    style={styles.input}
                  >
                    <option value="">None (Top Level Category)</option>
                    {categories.filter(c => !c.parentCategory && (!editingCategory || c._id !== editingCategory._id)).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    name="status"
                    value={categoryFormData.status}
                    onChange={handleCategoryInputChange}
                    style={styles.input}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div style={styles.formButtons}>
                  <button type="submit" style={styles.submitBtn}>
                    {editingCategory ? 'Update Category' : 'Save Category'}
                  </button>
                  <button type="button" onClick={resetCategoryForm} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Categories Table */}
            {categories.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Parent</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category._id}>
                        <td><strong>{category.name}</strong></td>
                        <td>{category.slug}</td>
                        <td>{category.parentCategory?.name || '-'}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          <span style={{...styles.statusBadge, 
                            background: category.status === 'active' ? '#27ae60' : '#95a5a6'}}>
                            {category.status}
                          </span>
                        </td>
                        <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => handleEditCategory(category)} style={styles.editBtn}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteCategory(category._id)} style={styles.deleteBtn}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.noData}>No categories found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif'
  },
  navbar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  welcome: {
    fontSize: '1rem'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
  },
  loading: {
    fontSize: '1.2rem',
    color: '#666'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statCard: {
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  statLabel: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 'normal'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  statSmall: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    padding: '0 2rem',
    marginBottom: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  content: {
    padding: '0 2rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#333'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  formTitle: {
    marginTop: 0,
    color: '#333',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  quickStat: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  quickStatTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    borderBottom: '2px solid #3498db',
    paddingBottom: '5px'
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  orderItemRight: {
    display: 'flex',
    alignItems: 'center'
  },
  sellerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  noData: {
    color: '#999',
    textAlign: 'center',
    padding: '20px'
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  roleBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.9rem',
    display: 'inline-block'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.9rem',
    display: 'inline-block'
  },
  statusSelect: {
    padding: '4px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem'
  },
  approveBtn: {
    padding: '4px 8px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  },
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  editBtn: {
    padding: '4px 8px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  }
};

export default AdminDashboard;