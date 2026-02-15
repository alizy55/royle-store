import React, {
    useState,
    useEffect
} from 'react';
import {
    getProducts
} from '../services/product';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../services/cart';
import {
    getCategories
} from '../services/category';

function CustomerDashboard() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({
        items: [],
        totalAmount: 0
    });
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    useEffect(() => {
        loadProducts();
        loadCart();
        loadCategories();
        loadCustomerOrders();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await getProducts();
            console.log('Products loaded:', response.data);

            if (response.data && response.data.success) {
                const productsData = response.data.data || [];
                setProducts(productsData);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            if (response.data && response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCart = async () => {
        try {
            const response = await getCart();
            if (response.data && response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const loadCustomerOrders = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch('http://127.0.0.1:5000/api/orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'user-id': userData.id || userData._id
                }
            });
            const data = await response.json();
            if (data.success) {
                setCustomerOrders(data.data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const handleAddToCart = async (product) => {
        if (product.stock === 0) {
            alert('Product is out of stock');
            return;
        }

        setCartLoading(true);
        try {
            const response = await addToCart(product._id, 1);
            if (response.data && response.data.success) {
                setCart(response.data.data);
                alert(`${product.title} added to cart!`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, change) => {
        const item = cart.items.find(i => i.productId._id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }

        setCartLoading(true);
        try {
            const response = await updateCartItem(productId, newQuantity);
            if (response.data && response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Error updating quantity: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        setCartLoading(true);
        try {
            const response = await removeFromCart(productId);
            if (response.data && response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Error removing item: ' + (error.response?.data?.message || error.message));
        } finally {
            setCartLoading(false);
        }
    };

    const getCartCount = () => {
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const placeOrder = async () => {
        if (cart.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        setCartLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');

            const orderData = {
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    title: item.title || item.productId.title,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: cart.totalAmount,
                customerId: userData.id || userData._id,
                shippingAddress: {
                    address: userData.address || 'Default Address',
                    city: userData.city || 'Default City',
                    phone: userData.phone || '1234567890'
                }
            };

            console.log('Placing order:', orderData);

            const response = await fetch('http://127.0.0.1:5000/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'user-id': userData.id || userData._id
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            console.log('Order response:', data);

            if (data.success) {
                await clearCart();
                setCart({
                    items: [],
                    totalAmount: 0
                });
                setShowCart(false);

                setLastOrder(data.data);
                setShowOrderConfirmation(true);

                loadProducts();
                loadCustomerOrders();
            } else {
                alert('Error placing order: ' + data.message);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order: ' + error.message);
        } finally {
            setCartLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return '#27ae60';
            case 'shipped':
                return '#3498db';
            case 'processing':
                return '#f39c12';
            case 'pending':
                return '#e67e22';
            case 'rejected':
                return '#e74c3c';
            case 'cancelled':
                return '#95a5a6';
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
        } > 🛍️Royal Store < /h2> <
        div style = {
            styles.searchBar
        } >
        <
        input type = "text"
        placeholder = "Search products..."
        value = {
            searchTerm
        }
        onChange = {
            (e) => setSearchTerm(e.target.value)
        }
        style = {
            styles.searchInput
        }
        /> <
        /div> <
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
            () => {
                setShowOrders(!showOrders);
                setShowCart(false);
                if (!showOrders) loadCustomerOrders();
            }
        }
        style = {
            styles.ordersBtn
        } >
        📋Orders({
            customerOrders.length
        }) <
        /button> <
        button onClick = {
            () => {
                setShowCart(!showCart);
                setShowOrders(false);
            }
        }
        style = {
            styles.cartBtn
        }
        disabled = {
            cartLoading
        } >
        🛒Cart({
            getCartCount()
        }) <
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
            /* Category Filter */ } <
        div style = {
            styles.categories
        } >
        <
        button onClick = {
            () => setSelectedCategory('all')
        }
        style = {
            {
                ...styles.categoryBtn,
                backgroundColor: selectedCategory === 'all' ? '#3498db' : '#ecf0f1',
                color: selectedCategory === 'all' ? 'white' : '#333'
            }
        } >
        All Products <
        /button> {
            categories.map(category => ( <
                button key = {
                    category._id
                }
                onClick = {
                    () => setSelectedCategory(category.name)
                }
                style = {
                    {
                        ...styles.categoryBtn,
                        backgroundColor: selectedCategory === category.name ? '#3498db' : '#ecf0f1',
                        color: selectedCategory === category.name ? 'white' : '#333'
                    }
                } >
                {
                    category.name
                } <
                /button>
            ))
        } <
        /div>

        {
            /* Order Success Message */ } {
            orderPlaced && ( <
                div style = {
                    styles.successMessage
                } > ✅Order placed successfully!Thank you
                for shopping.Check your order history. <
                /div>
            )
        }

        {
            /* Cart Sidebar */ } {
            showCart && ( <
                div style = {
                    styles.cartSidebar
                } >
                <
                div style = {
                    styles.cartHeader
                } >
                <
                h3 > Your Shopping Cart < /h3> <
                button onClick = {
                    () => setShowCart(false)
                }
                style = {
                    styles.closeBtn
                } > ✕ < /button> <
                /div>

                {
                    cart.items.length === 0 ? ( <
                        div style = {
                            styles.emptyCart
                        } >
                        <
                        p > Your cart is empty < /p> <
                        button onClick = {
                            () => setShowCart(false)
                        }
                        style = {
                            styles.continueBtn
                        } >
                        Continue Shopping <
                        /button> <
                        /div>
                    ) : ( <
                        > {
                            cart.items.map(item => ( <
                                div key = {
                                    item.productId._id
                                }
                                style = {
                                    styles.cartItem
                                } >
                                <
                                div style = {
                                    styles.cartItemInfo
                                } >
                                <
                                h4 > {
                                    item.title || item.productId.title
                                } < /h4> <
                                p style = {
                                    styles.cartItemPrice
                                } > ₹{
                                    item.price
                                }
                                x {
                                    item.quantity
                                } < /p> <
                                p style = {
                                    styles.cartItemTotal
                                } > Total: ₹{
                                    item.price * item.quantity
                                } < /p> {
                                    item.productId.stock < 10 && ( <
                                        p style = {
                                            styles.stockWarningText
                                        } > Only {
                                            item.productId.stock
                                        }
                                        left in stock! < /p>
                                    )
                                } <
                                /div> <
                                div style = {
                                    styles.cartActions
                                } >
                                <
                                button onClick = {
                                    () => handleUpdateQuantity(item.productId._id, -1)
                                }
                                style = {
                                    styles.qtyBtn
                                }
                                disabled = {
                                    cartLoading
                                } >
                                - < /button> <
                                span style = {
                                    styles.qty
                                } > {
                                    item.quantity
                                } < /span> <
                                button onClick = {
                                    () => handleUpdateQuantity(item.productId._id, 1)
                                }
                                style = {
                                    styles.qtyBtn
                                }
                                disabled = {
                                    cartLoading || item.quantity >= item.productId.stock
                                } >
                                + < /button> <
                                button onClick = {
                                    () => handleRemoveFromCart(item.productId._id)
                                }
                                style = {
                                    styles.removeBtn
                                }
                                disabled = {
                                    cartLoading
                                } >
                                Remove <
                                /button> <
                                /div> <
                                /div>
                            ))
                        }

                        <
                        div style = {
                            styles.cartTotal
                        } >
                        <
                        h3 > Total: ₹{
                            cart.totalAmount
                        } < /h3> <
                        button onClick = {
                            placeOrder
                        }
                        style = {
                            styles.checkoutBtn
                        }
                        disabled = {
                            cartLoading
                        } >
                        {
                            cartLoading ? 'Processing...' : 'Proceed to Checkout'
                        } <
                        /button> <
                        /div> <
                        />
                    )
                } <
                /div>
            )
        }

        {
            /* Orders Sidebar */ } {
            showOrders && ( <
                div style = {
                    styles.cartSidebar
                } >
                <
                div style = {
                    styles.cartHeader
                } >
                <
                h3 > My Orders < /h3> <
                button onClick = {
                    () => setShowOrders(false)
                }
                style = {
                    styles.closeBtn
                } > ✕ < /button> <
                /div>

                {
                    customerOrders.length === 0 ? ( <
                        div style = {
                            styles.emptyCart
                        } >
                        <
                        p > No orders yet < /p> <
                        button onClick = {
                            () => setShowOrders(false)
                        }
                        style = {
                            styles.continueBtn
                        } >
                        Continue Shopping <
                        /button> <
                        /div>
                    ) : ( <
                        div style = {
                            styles.ordersList
                        } > {
                            customerOrders.map(order => ( <
                                div key = {
                                    order._id
                                }
                                style = {
                                    styles.orderCard
                                } >
                                <
                                div style = {
                                    styles.orderHeader
                                } >
                                <
                                span style = {
                                    styles.orderId
                                } > Order #{
                                    order.orderId || order._id.slice(-8)
                                } < /span> <
                                span style = {
                                    {
                                        ...styles.orderStatus,
                                        backgroundColor: getStatusColor(order.status)
                                    }
                                } > {
                                    order.status
                                } <
                                /span> <
                                /div> <
                                div style = {
                                    styles.orderDate
                                } > {
                                    new Date(order.createdAt).toLocaleDateString()
                                }
                                at {
                                    new Date(order.createdAt).toLocaleTimeString()
                                } <
                                /div> <
                                div style = {
                                    styles.orderItems
                                } > {
                                    order.items.map((item, idx) => ( <
                                        div key = {
                                            idx
                                        }
                                        style = {
                                            styles.orderItem
                                        } >
                                        <
                                        span > {
                                            item.title || item.productId?.title
                                        } < /span> <
                                        span > ₹{
                                            item.price
                                        }
                                        x {
                                            item.quantity
                                        } < /span> <
                                        /div>
                                    ))
                                } <
                                /div> <
                                div style = {
                                    styles.orderTotal
                                } >
                                <
                                strong > Total: ₹{
                                    order.totalAmount
                                } < /strong> <
                                /div> <
                                div style = {
                                    styles.orderFooter
                                } >
                                <
                                small > Payment: {
                                    order.paymentMethod || 'Cash on Delivery'
                                } < /small> <
                                /div> <
                                /div>
                            ))
                        } <
                        /div>
                    )
                } <
                /div>
            )
        }

        {
            /* Order Confirmation Modal */ } {
            showOrderConfirmation && lastOrder && ( <
                div style = {
                    styles.modalOverlay
                } >
                <
                div style = {
                    styles.confirmationModal
                } >
                <
                div style = {
                    styles.confirmationHeader
                } >
                <
                span style = {
                    styles.confirmationIcon
                } > ✅ < /span> <
                h2 style = {
                    styles.confirmationTitle
                } > Order Placed Successfully! < /h2> <
                button onClick = {
                    () => setShowOrderConfirmation(false)
                }
                style = {
                    styles.confirmationClose
                } > ✕ < /button> <
                /div>

                <
                div style = {
                    styles.confirmationBody
                } >
                <
                div style = {
                    styles.confirmationRow
                } >
                <
                strong > Order ID: < /strong>  <
                span > {
                    lastOrder.orderId || lastOrder._id.slice(-8)
                } < /span> <
                /div> <
                div style = {
                    styles.confirmationRow
                } >
                <
                strong > Total Amount: < /strong>  <
                span style = {
                    styles.confirmationAmount
                } > ₹{
                    lastOrder.totalAmount
                } < /span> <
                /div> <
                div style = {
                    styles.confirmationRow
                } >
                <
                strong > Date: < /strong>  <
                span > {
                    new Date(lastOrder.createdAt).toLocaleString()
                } < /span> <
                /div>

                <
                div style = {
                    styles.confirmationItems
                } >
                <
                h4 > Items Ordered: < /h4> {
                    lastOrder.items.map((item, idx) => ( <
                        div key = {
                            idx
                        }
                        style = {
                            styles.confirmationItem
                        } >
                        <
                        span > {
                            item.title || item.productId?.title
                        } < /span> <
                        span > ₹{
                            item.price
                        }
                        x {
                            item.quantity
                        } < /span> <
                        /div>
                    ))
                } <
                /div>

                <
                div style = {
                    styles.confirmationStatus
                } >
                <
                span style = {
                    styles.statusLabel
                } > Current Status: < /span> <
                span style = {
                    {
                        ...styles.statusBadge,
                        backgroundColor: '#e67e22'
                    }
                } > pending < /span> <
                /div>

                <
                p style = {
                    styles.confirmationNote
                } >
                You can track your order in the "My Orders"
                section. <
                /p> <
                /div>

                <
                div style = {
                    styles.confirmationFooter
                } >
                <
                button onClick = {
                    () => {
                        setShowOrderConfirmation(false);
                        setShowOrders(true);
                        loadCustomerOrders();
                    }
                }
                style = {
                    styles.viewOrdersBtn
                } >
                View My Orders <
                /button> <
                button onClick = {
                    () => setShowOrderConfirmation(false)
                }
                style = {
                    styles.continueShoppingBtn
                } >
                Continue Shopping <
                /button> <
                /div> <
                /div> <
                /div>
            )
        }

        {
            /* Products Grid */ } <
        div style = {
            styles.content
        } > {
            loading ? ( <
                div style = {
                    styles.loading
                } > Loading products... < /div>
            ) : ( <
                >
                <
                div style = {
                    styles.productsHeader
                } >
                <
                h3 > {
                    filteredProducts.length
                }
                Products Available < /h3> <
                /div>

                <
                div style = {
                    styles.productGrid
                } > {
                    filteredProducts.length === 0 ? ( <
                        div style = {
                            styles.noProducts
                        } >
                        <
                        p > No products found < /p> <
                        /div>
                    ) : (
                        filteredProducts.map(product => ( <
                            div key = {
                                product._id
                            }
                            style = {
                                styles.productCard
                            } >
                            <
                            div style = {
                                styles.productImageContainer
                            } >
                            <
                            img src = {
                                product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
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
                            /> {
                                product.stock < 10 && ( <
                                    span style = {
                                        styles.stockWarning
                                    } > Only {
                                        product.stock
                                    }
                                    left! < /span>
                                )
                            } <
                            /div>

                            <
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
                                styles.productSeller
                            } > by {
                                product.sellerId?.storeName || product.sellerId?.name || 'Seller'
                            } < /p> <
                            p style = {
                                styles.productCategory
                            } > {
                                product.category
                            } < /p> <
                            p style = {
                                styles.productPrice
                            } > ₹{
                                product.price
                            } < /p> <
                            p style = {
                                styles.productDesc
                            } > {
                                product.description ? product.description.substring(0, 60) : 'No description available'
                            }...
                            <
                            /p>

                            <
                            button onClick = {
                                () => handleAddToCart(product)
                            }
                            style = {
                                {
                                    ...styles.addToCartBtn,
                                    backgroundColor: product.stock > 0 ? '#27ae60' : '#95a5a6',
                                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
                                }
                            }
                            disabled = {
                                product.stock === 0 || cartLoading
                            } >
                            {
                                product.stock > 0 ? '🛒 Add to Cart' : '❌ Out of Stock'
                            } <
                            /button> <
                            /div> <
                            /div>
                        ))
                    )
                } <
                /div> <
                />
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '30px'
    },
    logo: {
        margin: 0,
        fontSize: '1.8rem'
    },
    searchBar: {
        width: '400px'
    },
    searchInput: {
        width: '100%',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '25px',
        fontSize: '1rem',
        outline: 'none'
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    welcome: {
        fontSize: '1rem'
    },
    cartBtn: {
        padding: '8px 20px',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    ordersBtn: {
        padding: '8px 20px',
        backgroundColor: '#9b59b6',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    logoutBtn: {
        padding: '8px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    categories: {
        display: 'flex',
        gap: '10px',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #ecf0f1',
        overflowX: 'auto'
    },
    categoryBtn: {
        padding: '8px 20px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    successMessage: {
        backgroundColor: '#27ae60',
        color: 'white',
        textAlign: 'center',
        padding: '1rem',
        fontSize: '1.1rem'
    },
    cartSidebar: {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: 'white',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 1000
    },
    cartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #ecf0f1'
    },
    closeBtn: {
        padding: '5px 10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    emptyCart: {
        textAlign: 'center',
        marginTop: '50px'
    },
    continueBtn: {
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px'
    },
    cartItem: {
        borderBottom: '1px solid #ecf0f1',
        padding: '15px 0'
    },
    cartItemInfo: {
        marginBottom: '10px'
    },
    cartItemPrice: {
        color: '#7f8c8d',
        margin: '5px 0'
    },
    cartItemTotal: {
        fontWeight: 'bold',
        color: '#27ae60'
    },
    stockWarningText: {
        color: '#e74c3c',
        fontSize: '0.85rem',
        margin: '5px 0 0 0'
    },
    cartActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    qtyBtn: {
        padding: '5px 10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    qty: {
        fontSize: '1.1rem',
        minWidth: '30px',
        textAlign: 'center'
    },
    removeBtn: {
        padding: '5px 10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cartTotal: {
        marginTop: '20px',
        padding: '15px 0',
        borderTop: '2px solid #333'
    },
    checkoutBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        marginTop: '10px'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto'
    },
    orderCard: {
        border: '1px solid #ecf0f1',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: '#f8f9fa'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    orderId: {
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    orderStatus: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.8rem',
        textTransform: 'capitalize'
    },
    orderDate: {
        color: '#7f8c8d',
        fontSize: '0.85rem',
        marginBottom: '10px'
    },
    orderItems: {
        borderTop: '1px solid #ecf0f1',
        borderBottom: '1px solid #ecf0f1',
        padding: '10px 0',
        marginBottom: '10px'
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '5px 0',
        fontSize: '0.9rem'
    },
    orderTotal: {
        textAlign: 'right',
        color: '#27ae60',
        fontSize: '1.1rem',
        marginBottom: '5px'
    },
    orderFooter: {
        color: '#95a5a6',
        fontSize: '0.8rem',
        textAlign: 'right'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
    },
    confirmationModal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    confirmationHeader: {
        padding: '20px',
        borderBottom: '1px solid #ecf0f1',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
    },
    confirmationIcon: {
        fontSize: '2rem',
        marginRight: '15px'
    },
    confirmationTitle: {
        margin: 0,
        color: '#27ae60',
        fontSize: '1.5rem',
        flex: 1
    },
    confirmationClose: {
        padding: '5px 10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    confirmationBody: {
        padding: '20px'
    },
    confirmationRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        padding: '5px 0',
        borderBottom: '1px dashed #ecf0f1'
    },
    confirmationAmount: {
        color: '#27ae60',
        fontWeight: 'bold',
        fontSize: '1.1rem'
    },
    confirmationItems: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
    },
    confirmationItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '5px 0',
        fontSize: '0.95rem'
    },
    confirmationStatus: {
        marginTop: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    statusLabel: {
        fontWeight: 'bold',
        color: '#333'
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.85rem',
        display: 'inline-block'
    },
    confirmationNote: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f1f9ff',
        borderRadius: '6px',
        color: '#3498db',
        fontSize: '0.95rem'
    },
    confirmationFooter: {
        padding: '20px',
        borderTop: '1px solid #ecf0f1',
        display: 'flex',
        gap: '10px'
    },
    viewOrdersBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    continueShoppingBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#ecf0f1',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    content: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        fontSize: '1.2rem',
        color: '#666'
    },
    productsHeader: {
        marginBottom: '20px'
    },
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    noProducts: {
        textAlign: 'center',
        padding: '60px',
        backgroundColor: 'white',
        borderRadius: '10px',
        gridColumn: '1 / -1'
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s'
    },
    productImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
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
    productSeller: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        margin: '0 0 5px 0'
    },
    productCategory: {
        color: '#95a5a6',
        fontSize: '0.9rem',
        margin: '0 0 5px 0'
    },
    productPrice: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '5px 0'
    },
    productDesc: {
        color: '#666',
        fontSize: '0.9rem',
        margin: '10px 0'
    },
    addToCartBtn: {
        width: '100%',
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem'
    }
};

export default CustomerDashboard;