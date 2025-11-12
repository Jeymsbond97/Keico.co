# KEICO PLUS - Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
MONGO_DEV=mongodb://localhost:27017/keico
PORT=3012
JWT_SECRET=your-secret-key-change-in-production
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Start backend
npm run start:dev
```

### 2. Create Admin User

To create an admin user, you can use the GraphQL Playground at `http://localhost:3012/graphql`:

```graphql
mutation {
  register(input: {
    email: "admin@keico.com"
    password: "admin123"
    name: "Admin User"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

Then manually update the user role to "admin" in MongoDB or create a script to do this.

Alternatively, you can use the seed script (requires ts-node):
```bash
npx ts-node scripts/seed-admin.ts
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
VITE_GRAPHQL_URL=http://localhost:3012/graphql

# Start frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:3012/graphql
- **Admin Dashboard**: http://localhost:5173/admin_1

## 📝 Default Admin Credentials

- **Email**: admin@keico.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## 🎯 Features

### For Regular Users:
- ✅ View news articles
- ✅ Submit inquiries/contact form
- ✅ Browse company information (About, Services, Products, Team, History, Certificates)

### For Admin Users:
- ✅ Create, edit, and delete news articles
- ✅ Upload images and videos for news
- ✅ Access admin dashboard at `/admin_1`

## 📄 Pages

- **Home** (`/`) - Landing page with hero section and latest news
- **About** (`/about`) - Company information
- **Services** (`/services`) - Our services
- **Products** (`/products`) - Our products
- **Team** (`/team`) - Our team
- **History** (`/history`) - Company history
- **Certificate** (`/certificate`) - Certifications
- **News** (`/news`) - All news articles
- **News Detail** (`/news/:id`) - Individual news article
- **Contact** (`/contact`) - Inquiry form
- **Login** (`/login`) - User login
- **Signup** (`/signup`) - User registration
- **Admin Dashboard** (`/admin_1`) - News management (admin only)

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (user/admin)
- Protected admin routes
- Secure password hashing with bcrypt

## 📦 Adding Sample News

You can add news through:
1. Admin dashboard at `/admin_1` (after logging in as admin)
2. GraphQL Playground (requires admin token)

## 🛠️ Technology Stack

**Backend:**
- NestJS
- GraphQL (Apollo Server)
- MongoDB (Mongoose)
- JWT Authentication
- TypeScript

**Frontend:**
- React 19
- TypeScript
- Apollo Client
- React Router
- Tailwind CSS
- Vite

## 📞 Support

For issues or questions, please contact the development team.

