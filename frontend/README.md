# Smart Multi-Vendor E-Commerce Marketplace (SMV-ECOM)

A full-stack MERN application where multiple sellers can list and sell products while customers can browse, add to cart, and place orders.

## 🚀 Features

### For Customers
- Browse products with category filters
- Search products by name/description
- Add to cart with quantity management
- Place orders with order confirmation
- View order history with real-time status tracking
- Secure authentication

### For Sellers
- Complete product management (Add/Edit/Delete)
- Upload multiple product images (up to 5)
- View orders for their products
- Accept/Reject orders
- Update order status (Accepted → Shipped → Delivered)
- Store profile management
- Dashboard with sales analytics

### For Admin
- User management (view/delete users)
- Seller approval system
- Product management across all sellers
- Order management with seller-by-seller status
- Category management (Add/Edit/Delete)
- Dashboard with platform analytics
- Revenue tracking

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux Toolkit (State Management)
- Axios (API calls)
- React Router (Navigation)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (Image upload)

### Database
- MongoDB Atlas

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start