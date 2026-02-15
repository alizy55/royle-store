import React, {
    useState,
    useEffect
} from 'react';
import axios from 'axios';
import {
    getMyProducts,
    createProductWithImages,
    updateProductWithImages,
    deleteProduct
} from '../services/product';
import {
    getSellerOrders,
    updateOrderStatus
} from '../services/order';

function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [categories, setCategories] = useState([]);

    // Image upload states
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        cost: '',
        description: '',
        category: '',
        brand: '',
        stock: '',
        sku: '',
        tags: ''
    });

    const [profileData, setProfileData] = useState({
        storeName: '',
        phone: '',
        address: '',
        city: '',
        bio: ''
    });

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        lowStock: 0,
        pendingOrders: 0,
        acceptedOrders: 0,
        rejectedOrders: 0,
        deliveredOrders: 0
    });

    const [user, setUser] = useState({});
    const token = localStorage.getItem('token');

    const API = axios.create({
        baseURL: 'http://127.0.0.1:5000/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        setProfileData({
            storeName: userData.storeName || userData.name || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            bio: userData.bio || ''
        });

        const sellerId = userData.id || userData._id;
        if (sellerId) {
            loadProducts(sellerId);
            loadSellerOrders(sellerId);
            loadCategories();
        }
    }, []);

    const loadProducts = async (sellerId) => {
        try {
            setLoading(true);
            const res = await getMyProducts(sellerId);
            console.log('Products response:', res.data);

            let productsData = [];
            if (res.data && res.data.success) {
                productsData = res.data.data || [];
            } else if (Array.isArray(res.data)) {
                productsData = res.data;
            }

            setProducts(productsData);
        } catch (err) {
            console.error('Error loading products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSellerOrders = async (sellerId) => {
        try {
            const res = await getSellerOrders();
            console.log('Seller orders:', res.data);
            setSellerOrders(res.data.data || []);
            calculateStats(products, res.data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            setSellerOrders([]);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/categories');
            if (response.data && response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const calculateStats = (products, orders) => {
        const totalProducts = products.length;
        const totalSales = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
        const totalRevenue = products.reduce((sum, p) => sum + ((p.price * (p.soldCount || 0)) || 0), 0);
        const totalCost = products.reduce((sum, p) => sum + ((p.cost || 0) * (p.soldCount || 0)), 0);
        const lowStock = products.filter(p => (p.stock || 0) < 10).length;

        const pendingOrders = orders.filter(o => {
            const sellerStatus = o.sellerStatuses?.find(s => s.sellerId?._id === user.id);
            return sellerStatus?.status === 'pending';
        }).length;

        const acceptedOrders = orders.filter(o => {
            const sellerStatus = o.sellerStatuses?.find(s => s.sellerId?._id === user.id);
            return sellerStatus?.status === 'accepted';
        }).length;

        const rejectedOrders = orders.filter(o => {
            const sellerStatus = o.sellerStatuses?.find(s => s.sellerId?._id === user.id);
            return sellerStatus?.status === 'rejected';
        }).length;

        const deliveredOrders = orders.filter(o => {
            const sellerStatus = o.sellerStatuses?.find(s => s.sellerId?._id === user.id);
            return sellerStatus?.status === 'delivered';
        }).length;

        setStats({
            totalProducts,
            totalSales,
            totalRevenue,
            totalProfit: totalRevenue - totalCost,
            lowStock,
            pendingOrders,
            acceptedOrders,
            rejectedOrders,
            deliveredOrders
        });
    };

    const handleInputChange = (e) => {
        const {
            name,
            value
        } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleProfileChange = (e) => {
        const {
            name,
            value
        } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Max size is 5MB`);
                return false;
            }
            return true;
        });

        setImageFiles(validFiles);

        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newFiles = [...imageFiles];
        const newPreviews = [...imagePreviews];

        URL.revokeObjectURL(newPreviews[index]);

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://127.0.0.1:5000/api/auth/profile',
                profileData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    ...response.data.user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setUser(updatedUser);
                setShowSettings(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const sellerId = userData.id || userData._id;

            const formDataToSend = new FormData();

            formDataToSend.append('title', formData.title);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('cost', formData.cost || '0');
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('brand', formData.brand || '');
            formDataToSend.append('stock', formData.stock);
            formDataToSend.append('sku', formData.sku || '');
            formDataToSend.append('tags', formData.tags || '');
            formDataToSend.append('sellerId', sellerId);
            formDataToSend.append('status', 'active');

            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            console.log('Sending product data with images:', imageFiles.length);

            if (editingProduct) {
                formDataToSend.append('keepExistingImages', 'true');
                const response = await updateProductWithImages(editingProduct._id, formDataToSend);
                console.log('Update response:', response.data);
                alert('Product updated successfully!');
            } else {
                const response = await createProductWithImages(formDataToSend);
                console.log('Create response:', response.data);
                alert('Product created successfully!');
            }

            resetForm();
            loadProducts(sellerId);
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title || '',
            price: product.price?.toString() || '',
            cost: product.cost?.toString() || '',
            description: product.description || '',
            category: product.category || '',
            brand: product.brand || '',
            stock: product.stock?.toString() || '',
            sku: product.sku || '',
            tags: product.tags ? product.tags.join(', ') : ''
        });

        setImageFiles([]);
        setImagePreviews([]);

        setShowForm(true);
        setActiveTab('products');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                alert('Product deleted successfully!');
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                const sellerId = userData.id || userData._id;
                loadProducts(sellerId);
            } catch (err) {
                alert('Error deleting product: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatus(orderId, newStatus);
            if (response.data.success) {
                alert(`Order ${newStatus} successfully!`);
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                const sellerId = userData.id || userData._id;
                loadSellerOrders(sellerId);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error updating order: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            title: '',
            price: '',
            cost: '',
            description: '',
            category: '',
            brand: '',
            stock: '',
            sku: '',
            tags: ''
        });

        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setImageFiles([]);
        setImagePreviews([]);
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Filter orders that contain products from this seller
    const filteredOrders = sellerOrders.filter(order =>
        order.items && order.items.some(item => item.productId)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return '#27ae60';
            case 'shipped':
                return '#3498db';
            case 'accepted':
                return '#f39c12';
            case 'pending':
                return '#e67e22';
            case 'rejected':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    return ( <
        div style = {
            styles.container
        } > {
            /* Navbar */ } <
        div style = {
            styles.navbar
        } >
        <
        div style = {
            styles.navLeft
        } >
        <
        h2 style = {
            styles.logo
        } > 🛍️{
            user.storeName || user.name
        }
        's Store</h2> <
        /div> <
        div style = {
            styles.navRight
        } >
        <
        span style = {
            styles.welcome
        } > Welcome, {
            user.name
        }! < /span> <
        button onClick = {
            () => setShowSettings(!showSettings)
        }
        style = {
            styles.settingsBtn
        } > ⚙️Settings <
        /button> <
        button onClick = {
            logout
        }
        style = {
            styles.logoutBtn
        } > Logout < /button> <
        /div> <
        /div>

        {
            /* Settings Modal */ } {
            showSettings && ( <
                div style = {
                    styles.modal
                } >
                <
                div style = {
                    styles.modalContent
                } >
                <
                h3 style = {
                    styles.modalTitle
                } > Store Settings < /h3> <
                form onSubmit = {
                    handleProfileSubmit
                } >
                <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Store Name < /label> <
                input type = "text"
                name = "storeName"
                value = {
                    profileData.storeName
                }
                onChange = {
                    handleProfileChange
                }
                style = {
                    styles.input
                }
                /> <
                /div> <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Phone < /label> <
                input type = "text"
                name = "phone"
                value = {
                    profileData.phone
                }
                onChange = {
                    handleProfileChange
                }
                style = {
                    styles.input
                }
                /> <
                /div> <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Address < /label> <
                input type = "text"
                name = "address"
                value = {
                    profileData.address
                }
                onChange = {
                    handleProfileChange
                }
                style = {
                    styles.input
                }
                /> <
                /div> <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > City < /label> <
                input type = "text"
                name = "city"
                value = {
                    profileData.city
                }
                onChange = {
                    handleProfileChange
                }
                style = {
                    styles.input
                }
                /> <
                /div> <
                div style = {
                    styles.formGroup
                } >
                <
                label style = {
                    styles.label
                } > Bio < /label> <
                textarea name = "bio"
                value = {
                    profileData.bio
                }
                onChange = {
                    handleProfileChange
                }
                style = {
                    {
                        ...styles.input,
                        minHeight: '80px'
                    }
                }
                /> <
                /div> <
                div style = {
                    styles.modalButtons
                } >
                <
                button type = "submit"
                style = {
                    styles.submitBtn
                } > Save Changes < /button> <
                button type = "button"
                onClick = {
                    () => setShowSettings(false)
                }
                style = {
                    styles.cancelBtn
                } > Cancel < /button> <
                /div> <
                /form> <
                /div> <
                /div>
            )
        }

        {
            /* Stats Cards */ } <
        div style = {
            styles.statsContainer
        } >
        <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Total Products < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.totalProducts
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Total Sales < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.totalSales
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Revenue < /h3> <
        p style = {
            styles.statNumber
        } > ₹{
            stats.totalRevenue.toLocaleString()
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Profit < /h3> <
        p style = {
            styles.statNumber
        } > ₹{
            stats.totalProfit.toLocaleString()
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Low Stock < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.lowStock
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #fc6767 0%, #ec008c 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Pending < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.pendingOrders
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Accepted < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.acceptedOrders
        } < /p> <
        /div> <
        div style = {
            {
                ...styles.statCard,
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            }
        } >
        <
        h3 style = {
            styles.statLabel
        } > Delivered < /h3> <
        p style = {
            styles.statNumber
        } > {
            stats.deliveredOrders
        } < /p> <
        /div> <
        /div>

        {
            /* Tabs */ } <
        div style = {
            styles.tabs
        } >
        <
        button onClick = {
            () => setActiveTab('products')
        }
        style = {
            {
                ...styles.tab,
                background: activeTab === 'products' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'products' ? 'white' : '#333'
            }
        } >
        📦My Products({
            products.length
        }) <
        /button> <
        button onClick = {
            () => setActiveTab('orders')
        }
        style = {
            {
                ...styles.tab,
                background: activeTab === 'orders' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'orders' ? 'white' : '#333'
            }
        } >
        📋Orders({
            filteredOrders.length
        }) <
        /button> <
        /div>

        {
            /* Content based on active tab */ } <
        div style = {
            styles.content
        } > {
            activeTab === 'products' && ( <
                > {
                    /* Product Management Header */ } <
                div style = {
                    styles.header
                } >
                <
                h3 style = {
                    styles.sectionTitle
                } > Product Management < /h3> <
                button onClick = {
                    () => setShowForm(!showForm)
                }
                style = {
                    styles.addBtn
                } > {
                    showForm ? '✕ Cancel' : '+ Add New Product'
                } <
                /button> <
                /div>

                {
                    /* Add/Edit Product Form */ } {
                    showForm && ( <
                        form onSubmit = {
                            handleSubmit
                        }
                        style = {
                            styles.form
                        }
                        encType = "multipart/form-data" >
                        <
                        h4 style = {
                            styles.formTitle
                        } > {
                            editingProduct ? 'Edit Product' : 'Add New Product'
                        } < /h4>

                        <
                        div style = {
                            styles.formRow
                        } >
                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Product Title * < /label> <
                        input type = "text"
                        name = "title"
                        value = {
                            formData.title
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        required placeholder = "e.g. iPhone 13, Nike Shoes" /
                        >
                        <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Category * < /label> <
                        select name = "category"
                        value = {
                            formData.category
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        required >
                        <
                        option value = "" > Select Category < /option> {
                            categories.map(cat => ( <
                                option key = {
                                    cat._id
                                }
                                value = {
                                    cat.name
                                } > {
                                    cat.name
                                } < /option>
                            ))
                        } <
                        /select> <
                        /div> <
                        /div>

                        <
                        div style = {
                            styles.formRow
                        } >
                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Price(₹) * < /label> <
                        input type = "number"
                        name = "price"
                        value = {
                            formData.price
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        required min = "0"
                        step = "0.01" /
                        >
                        <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Cost(₹) < /label> <
                        input type = "number"
                        name = "cost"
                        value = {
                            formData.cost
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        min = "0"
                        step = "0.01"
                        placeholder = "Optional" /
                        >
                        <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Stock * < /label> <
                        input type = "number"
                        name = "stock"
                        value = {
                            formData.stock
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        required min = "0" /
                        >
                        <
                        /div> <
                        /div>

                        <
                        div style = {
                            styles.formRow
                        } >
                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Brand < /label> <
                        input type = "text"
                        name = "brand"
                        value = {
                            formData.brand
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        placeholder = "e.g. Apple, Nike" /
                        >
                        <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > SKU < /label> <
                        input type = "text"
                        name = "sku"
                        value = {
                            formData.sku
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        placeholder = "Stock Keeping Unit" /
                        >
                        <
                        /div> <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Description * < /label> <
                        textarea name = "description"
                        value = {
                            formData.description
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            {
                                ...styles.input,
                                minHeight: '100px'
                            }
                        }
                        required placeholder = "Detailed description of your product..." /
                        >
                        <
                        /div>

                        {
                            /* Image Upload Section */ } <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Product Images(Max 5) < /label> <
                        input type = "file"
                        name = "images"
                        accept = "image/*"
                        multiple onChange = {
                            handleImageChange
                        }
                        style = {
                            styles.fileInput
                        }
                        /> <
                        small style = {
                            styles.helpText
                        } > You can select up to 5 images.Max 5 MB each.Allowed: JPG, PNG, GIF < /small>

                        {
                            imagePreviews.length > 0 && ( <
                                div style = {
                                    styles.previewContainer
                                } > {
                                    imagePreviews.map((preview, index) => ( <
                                        div key = {
                                            index
                                        }
                                        style = {
                                            styles.previewItem
                                        } >
                                        <
                                        img src = {
                                            preview
                                        }
                                        alt = {
                                            `Preview ${index + 1}`
                                        }
                                        style = {
                                            styles.previewImage
                                        }
                                        /> <
                                        button type = "button"
                                        onClick = {
                                            () => removeImage(index)
                                        }
                                        style = {
                                            styles.removeImageBtn
                                        } >
                                        ✕
                                        <
                                        /button> <
                                        /div>
                                    ))
                                } <
                                /div>
                            )
                        }

                        {
                            editingProduct && editingProduct.images && editingProduct.images.length > 0 && ( <
                                div >
                                <
                                p style = {
                                    styles.label
                                } > Existing Images: < /p> <
                                div style = {
                                    styles.previewContainer
                                } > {
                                    editingProduct.images.map((img, index) => ( <
                                        div key = {
                                            index
                                        }
                                        style = {
                                            styles.previewItem
                                        } >
                                        <
                                        img src = {
                                            img
                                        }
                                        alt = {
                                            `Existing ${index + 1}`
                                        }
                                        style = {
                                            styles.previewImage
                                        }
                                        /> <
                                        /div>
                                    ))
                                } <
                                /div> <
                                /div>
                            )
                        } <
                        /div>

                        <
                        div style = {
                            styles.formGroup
                        } >
                        <
                        label style = {
                            styles.label
                        } > Tags(comma separated) < /label> <
                        input type = "text"
                        name = "tags"
                        value = {
                            formData.tags
                        }
                        onChange = {
                            handleInputChange
                        }
                        style = {
                            styles.input
                        }
                        placeholder = "e.g. trendy, new, sale, popular" /
                        >
                        <
                        /div>

                        <
                        div style = {
                            styles.formButtons
                        } >
                        <
                        button type = "submit"
                        style = {
                            styles.submitBtn
                        }
                        disabled = {
                            loading
                        } > {
                            loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')
                        } <
                        /button> <
                        button type = "button"
                        onClick = {
                            resetForm
                        }
                        style = {
                            styles.cancelBtn
                        } >
                        Cancel <
                        /button> <
                        /div> <
                        /form>
                    )
                }

                {
                    /* Products Grid */ } <
                div style = {
                    styles.productsHeader
                } >
                <
                h3 style = {
                    styles.sectionTitle
                } > Your Products({
                    products.length
                }) < /h3> <
                /div>

                {
                    loading ? ( <
                        div style = {
                            styles.loading
                        } > Loading products... < /div>
                    ) : ( <
                        div style = {
                            styles.productGrid
                        } > {
                            products.length === 0 ? ( <
                                div style = {
                                    styles.emptyState
                                } >
                                <
                                p style = {
                                    styles.emptyText
                                } > No products yet.Click "Add New Product"
                                to start selling! < /p> <
                                /div>
                            ) : (
                                products.map(product => ( <
                                    div key = {
                                        product._id
                                    }
                                    style = {
                                        styles.productCard
                                    } >
                                    <
                                    div style = {
                                        styles.productImageContainer
                                    } > {
                                        product.images && product.images.length > 0 ? ( <
                                            img src = {
                                                product.images[0]
                                            }
                                            alt = {
                                                product.title
                                            }
                                            style = {
                                                styles.productImage
                                            }
                                            onError = {
                                                (e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
                                                }
                                            }
                                            />
                                        ) : ( <
                                            div style = {
                                                styles.noImage
                                            } >
                                            <
                                            span > 📷 < /span> <
                                            small > No Image < /small> <
                                            /div>
                                        )
                                    } {
                                        product.images && product.images.length > 1 && ( <
                                            span style = {
                                                styles.imageCount
                                            } > +{
                                                product.images.length - 1
                                            } < /span>
                                        )
                                    } {
                                        product.stock < 10 && ( <
                                            span style = {
                                                styles.stockWarning
                                            } > Low Stock: {
                                                product.stock
                                            } < /span>
                                        )
                                    } <
                                    /div> <
                                    div style = {
                                        styles.productInfo
                                    } >
                                    <
                                    h4 style = {
                                        styles.productTitle
                                    } > {
                                        product.title
                                    } < /h4> <
                                    p style = {
                                        styles.productCategory
                                    } > {
                                        product.category
                                    } < /p> <
                                    p style = {
                                        styles.productPrice
                                    } > ₹{
                                        product.price
                                    } < /p> {
                                        product.cost > 0 && ( <
                                            p style = {
                                                styles.productProfit
                                            } >
                                            Profit: ₹{
                                                (product.price - product.cost).toLocaleString()
                                            } <
                                            /p>
                                        )
                                    } <
                                    div style = {
                                        styles.productStats
                                    } >
                                    <
                                    span style = {
                                        styles.stockBadge
                                    } > 📦Stock: {
                                        product.stock
                                    } < /span> <
                                    span style = {
                                        styles.soldBadge
                                    } > 💰Sold: {
                                        product.soldCount || 0
                                    } < /span> <
                                    /div> <
                                    div style = {
                                        styles.productActions
                                    } >
                                    <
                                    button onClick = {
                                        () => handleEdit(product)
                                    }
                                    style = {
                                        styles.editBtn
                                    } >
                                    Edit <
                                    /button> <
                                    button onClick = {
                                        () => handleDelete(product._id)
                                    }
                                    style = {
                                        styles.deleteBtn
                                    } >
                                    Delete <
                                    /button> <
                                    /div> <
                                    /div> <
                                    /div>
                                ))
                            )
                        } <
                        /div>
                    )
                } <
                />
            )
        }

        {
            activeTab === 'orders' && ( <
                div style = {
                    styles.ordersSection
                } >
                <
                h3 style = {
                    styles.sectionTitle
                } > Manage Orders({
                    filteredOrders.length
                }) < /h3> {
                    filteredOrders.length === 0 ? ( <
                        div style = {
                            styles.emptyState
                        } >
                        <
                        p style = {
                            styles.emptyText
                        } > No orders yet
                        for your products < /p> <
                        /div>
                    ) : ( <
                        div style = {
                            styles.tableContainer
                        } >
                        <
                        table style = {
                            styles.table
                        } >
                        <
                        thead >
                        <
                        tr >
                        <
                        th > Order ID < /th> <
                        th > Customer < /th> <
                        th > Products < /th> <
                        th > Total < /th> <
                        th > Your Status < /th> <
                        th > Order Status < /th> <
                        th > Date < /th> <
                        th > Actions < /th> <
                        /tr> <
                        /thead> <
                        tbody > {
                            filteredOrders.map(order => {
                                const sellerStatus = order.sellerStatuses?.find(
                                    s => s.sellerId?._id === user.id || s.sellerId === user.id
                                );

                                return ( <
                                    tr key = {
                                        order._id
                                    } >
                                    <
                                    td > #{
                                        order.orderId || order._id.slice(-8)
                                    } < /td> <
                                    td > {
                                        order.customerName || order.customerId?.name || 'Customer'
                                    } < /td> <
                                    td > {
                                        order.items
                                        .filter(item => item.productId)
                                        .map((item, idx) => ( <
                                            div key = {
                                                idx
                                            }
                                            style = {
                                                {
                                                    fontSize: '0.9rem'
                                                }
                                            } > {
                                                item.title || item.productId?.title
                                            }
                                            x {
                                                item.quantity
                                            } <
                                            /div>
                                        ))
                                    } <
                                    /td> <
                                    td > ₹{
                                        order.totalAmount
                                    } < /td> <
                                    td >
                                    <
                                    span style = {
                                        {
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(sellerStatus?.status || 'pending')
                                        }
                                    } > {
                                        sellerStatus?.status || 'pending'
                                    } <
                                    /span> <
                                    /td> <
                                    td >
                                    <
                                    span style = {
                                        {
                                            ...styles.statusBadge,
                                            backgroundColor: order.status === 'delivered' ? '#27ae60' : order.status === 'shipped' ? '#3498db' : order.status === 'processing' ? '#f39c12' : order.status === 'pending' ? '#e67e22' : order.status === 'rejected' ? '#e74c3c' : '#95a5a6'
                                        }
                                    } > {
                                        order.status
                                    } <
                                    /span> <
                                    /td> <
                                    td > {
                                        new Date(order.createdAt).toLocaleDateString()
                                    } < /td> <
                                    td >
                                    <
                                    select onChange = {
                                        (e) => handleUpdateOrderStatus(order._id, e.target.value)
                                    }
                                    value = {
                                        sellerStatus?.status || 'pending'
                                    }
                                    style = {
                                        styles.statusSelect
                                    } >
                                    <
                                    option value = "pending" > Pending < /option> <
                                    option value = "accepted" > Accept < /option> <
                                    option value = "rejected" > Reject < /option> <
                                    option value = "shipped" > Ship < /option> <
                                    option value = "delivered" > Deliver < /option> <
                                    /select> <
                                    /td> <
                                    /tr>
                                );
                            })
                        } <
                        /tbody> <
                        /table> <
                        /div>
                    )
                } <
                /div>
            )
        } <
        /div> <
        /div>
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
    navLeft: {
        display: 'flex',
        alignItems: 'center'
    },
    navRight: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    },
    logo: {
        margin: 0,
        fontSize: '1.5rem'
    },
    welcome: {
        fontSize: '1rem'
    },
    settingsBtn: {
        padding: '8px 16px',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500'
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
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
    },
    modalTitle: {
        marginTop: 0,
        color: '#333',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    statCard: {
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    statLabel: {
        margin: 0,
        fontSize: '0.85rem',
        fontWeight: 'normal'
    },
    statNumber: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: '5px 0 0 0'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        padding: '0 2rem',
        marginBottom: '20px',
        maxWidth: '1200px',
        margin: '20px auto'
    },
    tab: {
        padding: '12px 24px',
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
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    sectionTitle: {
        margin: 0,
        color: '#333'
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
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
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
    fileInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: 'white'
    },
    helpText: {
        display: 'block',
        color: '#7f8c8d',
        fontSize: '0.85rem',
        marginTop: '5px'
    },
    previewContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '15px'
    },
    previewItem: {
        position: 'relative',
        width: '80px',
        height: '80px',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #ddd'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    removeImageBtn: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
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
    modalButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    productsHeader: {
        marginBottom: '20px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '1.2rem',
        color: '#666'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px',
        backgroundColor: 'white',
        borderRadius: '10px',
        gridColumn: '1 / -1'
    },
    emptyText: {
        color: '#666',
        fontSize: '1.1rem'
    },
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s'
    },
    productImageContainer: {
        height: '180px',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    noImage: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        color: '#bdc3c7',
        backgroundColor: '#ecf0f1'
    },
    imageCount: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem'
    },
    stockWarning: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem'
    },
    productInfo: {
        padding: '15px'
    },
    productTitle: {
        margin: '0 0 5px 0',
        fontSize: '1.1rem'
    },
    productCategory: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        margin: '0 0 5px 0'
    },
    productPrice: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '5px 0'
    },
    productProfit: {
        color: '#27ae60',
        fontSize: '0.9rem',
        margin: '0 0 10px 0'
    },
    productStats: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '10px 0',
        fontSize: '0.9rem'
    },
    stockBadge: {
        color: '#7f8c8d'
    },
    soldBadge: {
        color: '#7f8c8d'
    },
    productActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px'
    },
    editBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    deleteBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    ordersSection: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    tableContainer: {
        overflowX: 'auto',
        marginTop: '20px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '900px'
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.85rem',
        display: 'inline-block'
    },
    statusSelect: {
        padding: '6px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        fontSize: '0.9rem'
    }
};

export default SellerDashboard;