# Marketplace & Shop Design Document

This document outlines the architectural design for the **Marketplace** functionality in the Pet Care application, covering database schema, user roles, file structure, and implementation steps for Admin/Vendor views.

---

## 1. Database Design (Schema)

To support a robust shop with multiple vendors, we need the following new entities:

### A. Product (`products`)
Stores item details.
*   `id` (Long, PK)
*   `vendor_id` (Long, FK to `users` or `vendors` table) - *Crucial for multi-vendor support*
*   `title` (String)
*   `description` (Text)
*   `price` (BigDecimal)
*   `stock_quantity` (Integer) - *Inventory management*
*   `category` (String/Enum) - *e.g., FOOD, TOYS, MEDICINE*
*   `image_url` (String)
*   `is_active` (Boolean) - *Soft delete/hide*

### B. Order (`orders`)
High-level order summary.
*   `id` (Long, PK)
*   `user_id` (Long, FK to User) - *The buyer*
*   `total_amount` (BigDecimal)
*   `status` (Enum: PLACED, PAID, PACKED, SHIPPED, DELIVERED, CANCELLED)
*   `shipping_address` (Text)
*   `payment_id` (String) - *From Razorpay/Stripe*
*   `created_at` (Timestamp)

### C. Order Item (`order_items`)
Links orders to specific products.
*   `id` (Long, PK)
*   `order_id` (Long, FK)
*   `product_id` (Long, FK)
*   `quantity` (Integer)
*   `price_at_purchase` (BigDecimal) - *Store historical price in case product price changes*

### D. Cart (`carts` & `cart_items`)
Temporary storage for user selection.
*   **Cart:** `user_id`, `updated_at`
*   **CartItem:** `cart_id`, `product_id`, `quantity`

---

## 2. User Roles & Access Control

We need to differentiate between who *buys* and who *sells*.

### A. Roles
*   **ADMIN:** Can manage ALL products, view ALL orders, ban vendors.
*   **VENDOR (New Role):** Can only manage *their own* products and view orders containing their products.
    *   *Note: A Veterinarian could optionally also be a Vendor.*
*   **USER (Pet Owner):** Can browse, add to cart, and buy.

### B. Authorization Logic
*   `GET /api/products` -> Public (Everyone)
*   `POST /api/products` -> Admin or Vendor only
*   `PUT /api/products/{id}` -> Admin or (Vendor who owns the product)
*   `GET /api/orders` -> User (sees their own), Admin (sees all), Vendor (sees order items related to them)

---

## 3. Frontend Architecture (React)

### A. Public Shop Views (User)
1.  **Marketplace Home (`/shop`)**
    *   Grid of products.
    *   Filters (Category, Price range).
    *   Search bar.
2.  **Product Detail (`/shop/product/:id`)**
    *   Large image, full description.
    *   "Add to Cart" button.
3.  **Cart & Checkout (`/cart`, `/checkout`)**
    *   Review items.
    *   Enter address.
    *   Payment integration (Razorpay).

### B. Admin / Vendor Dashboard
We should create a **separate layout** or a dedicated section in the existing `Dashboard`.

1.  **Vendor Dashboard (`/vendor/dashboard`)**
    *   **Stats:** Total Sales, Active Products, Pending Orders.
    *   **Product Manager:** Table to Add/Edit/Delete products.
    *   **Order Manager:** List of orders to pack/ship. Button to update status (e.g., "Mark as Shipped").

2.  **Admin Dashboard (`/admin/dashboard`)**
    *   **Platform Stats:** Total platform revenue.
    *   **User Manager:** Manage users/vendors.
    *   **Global Product Manager:** Oversee all listings.

---

## 4. Implementation Steps (How to Get It)

### Phase 1: Backend Foundation
1.  **Create Entities:** Implement `Product`, `Order`, `OrderItem`, `Cart` in Spring Boot (`src/main/java/com/pets/petcare/entity`).
2.  **Repositories:** Create interfaces in `repository` package.
3.  **Services:**
    *   `ProductService`: CRUD logic.
    *   `OrderService`: Logic to convert Cart -> Order, handle stock reduction.
    *   `CartService`: Add/Remove items.
4.  **Controllers:** Expose REST endpoints (e.g., `/api/store/products`).

### Phase 2: Frontend Shop (Buyer Experience)
1.  **Product Card Component:** Resusable UI for displaying items.
2.  **Shop Page:** Fetch products from API and display in grid.
3.  **Cart Context:** Global state (Redux or Context API) to track cart count in Navbar.

### Phase 3: Vendor Dashboard (Seller Experience)
1.  **Product Form:** Modal or page to upload image, set price/desc.
2.  **My Products Table:** List view with Edit/Delete actions.
3.  **Order Fulfillment:** View showing "New Orders". Action buttons to change status to "Shipped".

### Phase 4: Payments
1.  **Razorpay Setup:** Backend API to create order ID.
2.  **Frontend Integration:** Razorpay checkout popup.
3.  **Webhook:** Handle successful payment confirmation to update Order status to `PAID`.

---

## 5. Summary Flow
1.  **Vendor** logs in -> Goes to Dashboard -> Adds "Dog Food" ($20).
2.  **User** logs in -> Goes to Shop -> Sees "Dog Food" -> Adds to Cart -> Pays.
3.  **System** creates Order #101 -> Emails User & Vendor.
4.  **Vendor** sees Order #101 in Dashboard -> Packs item -> Clicks "Mark Shipped".
5.  **User** sees status "Shipped" in their Order History.

