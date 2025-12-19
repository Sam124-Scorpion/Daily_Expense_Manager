# 💰 Daily Expense Tracker

A comprehensive full-stack web application for personal finance management with AI-powered insights.

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Use Case Diagram](#use-case-diagram)
- [Data Flow Diagram](#data-flow-diagram)
- [Database Schema](#database-schema)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)

---

## 🎯 Overview

Daily Expense Tracker is a modern web application that helps users track their daily expenses, visualize spending patterns, and receive AI-powered financial insights for better money management.

### Key Features
- 👤 User Authentication (Signup/Login)
- 💵 Expense Management (Add, Edit, Delete)
- 📊 Interactive Dashboard with Charts
- 📈 Advanced Expense Reports with Filtering
- 🤖 AI-Powered Financial Insights (Gemini & OpenAI)
- 📱 Responsive Design

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend - React Application"
        A[React Components]
        B[React Router]
        C[Chart.js Visualization]
        D[LocalStorage]
    end
    
    subgraph "Backend - Django API"
        E[Django Views]
        F[Django Models]
        G[URL Routing]
    end
    
    subgraph "Database"
        H[(SQLite Database)]
    end
    
    subgraph "AI Services"
        I[Google Gemini API]
        J[OpenAI API]
        K[Fallback Engine]
    end
    
    A -->|HTTP Requests| E
    E -->|Query/Save| F
    F -->|ORM| H
    B -->|Route Management| A
    C -->|Render Charts| A
    A -->|Store Session| D
    E -->|AI Insights Request| I
    E -->|AI Insights Request| J
    E -->|Local Processing| K
    
    style A fill:#61dafb
    style E fill:#092e20
    style H fill:#003b57
    style I fill:#4285f4
    style J fill:#10a37f
```

### Architecture Layers

**Frontend Layer (React + Vite)**
- Component-based architecture
- Client-side routing with React Router
- State management using React Hooks
- Real-time data visualization with Chart.js

**Backend Layer (Django REST)**
- RESTful API design
- MVT pattern implementation
- CSRF protection & CORS handling
- Business logic layer

**Data Layer (SQLite)**
- Relational database with foreign key constraints
- User and Expense entities
- Automatic timestamp management

**AI Integration Layer**
- Multi-provider support (Gemini, OpenAI)
- Intelligent fallback mechanism
- Quota management

---

## 👥 Use Case Diagram

```mermaid
graph LR
    User((User))
    
    subgraph "Authentication"
        UC1[Register Account]
        UC2[Login to System]
        UC3[Logout]
    end
    
    subgraph "Expense Management"
        UC4[Add Expense]
        UC5[View Expenses]
        UC6[Edit Expense]
        UC7[Delete Expense]
    end
    
    subgraph "Analytics & Reports"
        UC8[View Dashboard]
        UC9[Generate Reports]
        UC10[Filter by Date Range]
        UC11[Search Expenses]
    end
    
    subgraph "AI Features"
        UC12[Get AI Insights]
        UC13[View Spending Patterns]
        UC14[Get Budget Recommendations]
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    
    UC12 -.->|uses| Gemini[Gemini API]
    UC12 -.->|uses| OpenAI[OpenAI API]
    UC12 -.->|fallback| Local[Local Engine]
    
    style User fill:#ff6b6b
    style UC12 fill:#4ecdc4
    style Gemini fill:#4285f4
    style OpenAI fill:#10a37f
```

### Use Case Descriptions

**Authentication Use Cases:**
- **Register Account**: New users create accounts with fullname, email, and password
- **Login**: Existing users authenticate using email and password
- **Logout**: Users end their session and clear local storage

**Expense Management Use Cases:**
- **Add Expense**: Record new expenses with item name, cost, and date
- **View Expenses**: Display all user expenses in list/table format
- **Edit Expense**: Modify existing expense details
- **Delete Expense**: Remove unwanted expense records

**Analytics & Reports Use Cases:**
- **View Dashboard**: See overview with charts, totals, and recent expenses
- **Generate Reports**: Create comprehensive expense reports
- **Filter by Date Range**: View expenses within specific date ranges
- **Search Expenses**: Find expenses by item name

**AI Features Use Cases:**
- **Get AI Insights**: Request AI-powered spending analysis
- **View Spending Patterns**: Identify spending trends and categories
- **Get Budget Recommendations**: Receive personalized savings suggestions

---

## 🔄 Data Flow Diagram

### Level 0 - Context Diagram

```mermaid
graph LR
    User[👤 User]
    System[📱 Daily Expense<br/>Tracker System]
    AI_Services[🤖 AI Services<br/>Gemini/OpenAI]
    
    User -->|Login Credentials<br/>Expense Data<br/>Filter Criteria| System
    System -->|Dashboard Data<br/>Reports<br/>AI Insights| User
    System -->|Expense Data<br/>Analysis Request| AI_Services
    AI_Services -->|Financial Insights<br/>Recommendations| System
    
    style System fill:#4ecdc4
    style User fill:#ff6b6b
    style AI_Services fill:#95e1d3
```

### Level 1 - Process Diagram

```mermaid
graph TB
    User[👤 User]
    
    subgraph "Daily Expense Tracker System"
        P1[1.0<br/>User<br/>Authentication]
        P2[2.0<br/>Expense<br/>Management]
        P3[3.0<br/>Data<br/>Visualization]
        P4[4.0<br/>Report<br/>Generation]
        P5[5.0<br/>AI Insights<br/>Processing]
        
        DS1[(D1: User Data)]
        DS2[(D2: Expense Data)]
    end
    
    AI[🤖 AI Services]
    
    User -->|Registration/Login| P1
    P1 -->|Store User| DS1
    P1 -->|User Session| User
    DS1 -->|Validate User| P1
    
    User -->|Add/Edit/Delete| P2
    P2 -->|Store Expenses| DS2
    DS2 -->|Retrieve Expenses| P2
    P2 -->|Confirmation| User
    DS1 -->|User ID| P2
    
    DS2 -->|Expense Data| P3
    P3 -->|Charts & Stats| User
    
    User -->|Filter Criteria| P4
    DS2 -->|Filtered Data| P4
    P4 -->|Reports| User
    
    User -->|Request Insights| P5
    DS2 -->|Expense History| P5
    P5 -->|Analysis Request| AI
    AI -->|Insights| P5
    P5 -->|Financial Advice| User
    
    style P1 fill:#a8e6cf
    style P2 fill:#ffd3b6
    style P3 fill:#ffaaa5
    style P4 fill:#ff8b94
    style P5 fill:#a8e6cf
    style DS1 fill:#dcedc1
    style DS2 fill:#dcedc1
```

### Level 2 - Expense Management Detail

```mermaid
graph TB
    User[👤 User]
    
    subgraph "2.0 Expense Management"
        P21[2.1<br/>Add Expense]
        P22[2.2<br/>View Expenses]
        P23[2.3<br/>Edit Expense]
        P24[2.4<br/>Delete Expense]
        P25[2.5<br/>Validate Input]
    end
    
    DS1[(D1: User Data)]
    DS2[(D2: Expense Data)]
    
    User -->|Expense Details| P21
    P21 -->|Validate| P25
    P25 -->|Valid Data| P21
    P25 -->|Error| User
    DS1 -->|User ID| P21
    P21 -->|Create Record| DS2
    P21 -->|Success| User
    
    User -->|Request List| P22
    DS1 -->|User ID| P22
    DS2 -->|Expense List| P22
    P22 -->|Display| User
    
    User -->|Updated Details| P23
    P23 -->|Validate| P25
    DS2 -->|Find Record| P23
    P23 -->|Update Record| DS2
    P23 -->|Success| User
    
    User -->|Delete Request| P24
    DS2 -->|Find & Delete| P24
    P24 -->|Confirmation| User
    
    style P21 fill:#ffd3b6
    style P22 fill:#ffd3b6
    style P23 fill:#ffd3b6
    style P24 fill:#ffd3b6
    style P25 fill:#ffaaa5
```

---

## 🗃️ Database Schema

```mermaid
erDiagram
    UserDetails ||--o{ ExpenseDetails : "has many"
    
    UserDetails {
        int id PK
        varchar Fullname
        varchar Email UK
        varchar Password
        datetime Registration_date
    }
    
    ExpenseDetails {
        int id PK
        int User_id FK
        datetime ExpenseDate
        varchar ExpenseItem
        float ExpenseCost
        datetime NoteDate
    }
```

### Entity Descriptions

**UserDetails Table**
- Stores user account information
- Email is unique for authentication
- Registration date auto-generated
- Cascade delete on user removal

**ExpenseDetails Table**
- Stores individual expense records
- Foreign key relationship to UserDetails
- Auto-generated timestamps (ExpenseDate, NoteDate)
- Supports flexible expense item naming

---

## 🛠️ Technology Stack

### Frontend
```
├── React 19.2.0                  # UI Framework
├── Vite (rolldown-vite 7.2.2)   # Build Tool
├── React Router DOM 7.9.1        # Routing
├── Chart.js 4.5.1                # Data Visualization
├── React-chartjs-2 5.3.1         # React wrapper for Chart.js
├── Bootstrap 5.3.8               # CSS Framework
└── React-Toastify 11.0.5         # Notifications
```

### Backend
```
├── Django 4.2.7                  # Web Framework
├── Django REST Framework 3.14.0  # API Framework
├── django-cors-headers 4.3.0     # CORS Support
├── SQLite                        # Database
├── OpenAI 1.54.0                 # AI Integration
├── Gunicorn 21.2.0              # WSGI Server
└── python-dotenv 1.0.0          # Environment Variables
```

---

## 🚀 Setup Instructions

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# Optional: AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_MODEL=gemini-2.5-flash  # Optional, defaults to gemini-2.5-flash
```

---

## 🔌 API Endpoints

```mermaid
graph LR
    subgraph "Authentication APIs"
        A1[POST /api/signup/]
        A2[POST /api/login/]
    end
    
    subgraph "Expense APIs"
        B1[POST /api/add-expense/]
        B2[GET /api/manage-expense/:userId/]
        B3[PUT/PATCH /api/expenses/:expenseId/]
        B4[DELETE /api/expenses/:expenseId/]
    end
    
    subgraph "AI APIs"
        C1[POST /api/ai/insights/:userId/]
    end
    
    style A1 fill:#a8e6cf
    style A2 fill:#a8e6cf
    style B1 fill:#ffd3b6
    style B2 fill:#ffd3b6
    style B3 fill:#ffd3b6
    style B4 fill:#ffd3b6
    style C1 fill:#ffaaa5
```

### API Documentation

#### Authentication

**POST /api/signup/**
```json
Request: {
  "Fullname": "John Doe",
  "Email": "john@example.com",
  "Password": "password123"
}

Response: {
  "message": "User registered successfully"
}
```

**POST /api/login/**
```json
Request: {
  "Email": "john@example.com",
  "Password": "password123"
}

Response: {
  "message": "Login successful",
  "userId": 1,
  "userName": "John Doe",
  "userEmail": "john@example.com"
}
```

#### Expense Management

**POST /api/add-expense/**
```json
Request: {
  "UserId": 1,
  "ExpenseDate": "2025-12-17",
  "ExpenseItem": "Groceries",
  "ExpenseCost": 1500.00
}

Response: {
  "message": "Expense added successfully"
}
```

**GET /api/manage-expense/:userId/**
```json
Response: {
  "expenses": [
    {
      "id": 1,
      "ExpenseDate": "2025-12-17T10:30:00Z",
      "ExpenseItem": "Groceries",
      "ExpenseCost": 1500.00
    }
  ]
}
```

**PUT/PATCH /api/expenses/:expenseId/**
```json
Request: {
  "ExpenseItem": "Updated Item",
  "ExpenseCost": 2000.00
}

Response: {
  "message": "Expense updated successfully"
}
```

**DELETE /api/expenses/:expenseId/**
```json
Response: {
  "message": "Expense deleted successfully"
}
```

#### AI Insights

**POST /api/ai/insights/:userId/?provider=gemini**
```json
Response: {
  "insight": "Top spend categories -> Groceries: ₹5,000...",
  "provider": "gemini",
  "total_expenses": 15000.00,
  "average_expense": 1500.00,
  "expense_count": 10
}
```

---

## 📊 Component Structure

```
frontend/src/
├── components/
│   ├── home.jsx              # Landing page
│   ├── signup.jsx            # User registration
│   ├── login.jsx             # User login
│   ├── navbar.jsx            # Navigation bar
│   ├── dashboard.jsx         # Main dashboard with charts
│   ├── addexpense.jsx        # Add expense form
│   ├── manageexpense.jsx     # Expense list & management
│   ├── expensereport.jsx     # Advanced reporting
│   ├── AIInsights.jsx        # AI insights component
│   └── AIInsights.css        # AI component styles
├── App.jsx                   # Main app component
├── App.css                   # Global styles
├── main.jsx                  # Entry point
└── index.css                 # Base styles
```

---

## 🎨 Features Overview

### Dashboard
- 📊 Visual charts (Pie charts for spending distribution)
- 💰 Total expense calculation
- 📈 Average expense tracking
- 🔝 Highest expense highlight
- 📝 Recent transactions display

### Expense Reports
- 📅 Date range filtering
- 🔍 Search functionality
- 📊 Statistical summaries
- 📋 Detailed expense listing
- 💡 Export capabilities

### AI Insights
- 🤖 Multi-provider AI support (Gemini & OpenAI)
- 📊 Spending pattern analysis
- 💡 Personalized recommendations
- 📈 Budget optimization tips
- 🔄 Automatic fallback mechanism

---

## 🔐 Security Considerations

⚠️ **Current Implementation Notes:**
- Password storage: Plain text (requires hashing implementation)
- CSRF: Disabled for API endpoints
- CORS: Configured for development

🔒 **Production Recommendations:**
- Implement bcrypt/Argon2 password hashing
- Enable JWT token-based authentication
- Add rate limiting
- Enable CSRF protection
- Use environment-based configuration
- Implement HTTPS

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

Permissions: commercial use, modification, distribution, private use
Conditions: license and copyright notice
Limitations: liability, warranty

---

## 👨‍💻 Developer

Built with ❤️ by Soumik Das using React, Django, and AI technologies

---

## 🔗 Quick Links

- **Backend API**: `http://localhost:8000/api/`
- **Frontend**: `http://localhost:5173/`
- **Django Admin**: `http://localhost:8000/admin/`
