# Hotel Booking App with AI-Powered Recommendations

## Introduction

The Hotel Booking App is an intelligent full-stack platform that transforms how users discover and book hotels. Built with the **MERN stack** and enhanced with **Machine Learning algorithms**, the system delivers personalized recommendations based on user preferences and behavior. This creates a seamless booking experience while improving user engagement and conversion rates.

## Background

In today’s competitive travel industry, users expect more than just a booking platform—they want **personalized, intelligent suggestions** that match their unique preferences. Traditional search filters are limited and often fail to provide relevant results. This project bridges the gap by combining a robust booking system with **AI-powered recommendation engines**, ensuring users find the best hotels tailored to their needs.


## Key Features

### Core Booking System

- **User Authentication & Authorization** – Secure registration and login using JWT
- **Advanced Hotel Search** – Filter by location, price, amenities, and ratings
- **Room Booking Workflow** – End-to-end booking system with date selection
- **User Profiles** – Manage bookings, preferences, and history
- **Admin Panel** – Manage hotels, rooms, and bookings efficiently
- **Review & Rating System** – Collect user feedback and ratings
    

### AI-Powered Enhancements

- **Personalized Recommendations** – TF-IDF content-based filtering  
- **Collaborative Filtering** – k-NN algorithm for user similarity  
- **Trending Analysis** – Detects and promotes popular hotels in real-time  
- **Hybrid Recommendation Engine** – Combines content-based + collaborative + popularity  
- **Smart Search Results** – Machine learning–enhanced ranking of hotel listings  
- **Similar Hotel Suggestions** – Content-based similarity for hotel discovery  
    

## Implementation

### 1. Content-Based Recommendations (TF-IDF)  
- Extracts features from hotel descriptions, amenities, and location  
- Builds user profiles based on past interactions  
- Uses cosine similarity for matching hotels  
- Advantage: Works well for new users with limited data  

### 2. Collaborative Filtering (k-NN)  
- Builds a user-hotel interaction matrix  
- Finds similar users based on booking and rating patterns  
- Recommends hotels liked by similar users  
- Advantage: Captures hidden preferences and community trends  

### 3. Hybrid Recommendation Engine  
- Weighted approach: **Content-based (60%) + Collaborative (40%) + Popularity Boost (10%)**  
- Reduces cold start issues while balancing personalization and discovery  
- Continuously improves as more interaction data is collected   q 
    


## Getting Started

### Prerequisites  
Install the following before running the application:  
- **Node.js** (v16+)  
- **Python** (v3.8+)  
- **MongoDB** (local or Atlas)


### Environment Setup
Create a `.env` file with your API keys:
```env
MONGO=your_mongodb_config_here
JWT=your_jwt_key_here
```

### Running the Application
#### 1. Start the Flask API Server (ml-service)
Navigate into the **ml-service** folder:

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```
The ML server will start on `http://localhost:5000`

#### 2. Start the Backend Server (Node.js)
Navigate into the **backend** folder:

```bash
cd backend
npm install
npm start
```
The backend server will start on `http://localhost:8800`

#### 3. Launch the Web Frontend (React.js)
Navigate into the **frontend** folder:

```bash
cd frontend
npm install
npm start
```
The web application will open in your browser at `http://localhost:3000`


The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8800
- **ML Service**: http://localhost:5000



## Technology Stack

### Frontend
- **React.js** - Modern UI library with hooks and context
- **CSS3** - Responsive design with modern styling
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### Machine Learning Service
- **Python 3.8+** - Programming language for ML algorithms
- **Flask** - Lightweight web framework for ML API
- **scikit-learn** - Machine learning library
- **pandas** - Data manipulation and analysis
- **numpy** - Numerical computing library
- **TF-IDF Vectorizer** - Text feature extraction
- **k-NN Algorithm** - Collaborative filtering implementation



## System Architecture

The application follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ML Service    │    │   Database      │
│   (React.js)    │◄──►│  (Express.js)   │◄──►│ (Python/Flask)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │    │                 │
│ • User Interface│    │ • Authentication│    │ • TF-IDF        │    │ • User Data     │
│ • Recommendations│   │ • Hotel APIs    │    │ • k-NN Algorithm│    │ • Hotel Data    │
│ • Booking Flow  │    │ • User Tracking │    │ • Model Training│    │ • Interactions  │
│ • Search & Filter│   │ • Data Validation│   │ • Recommendations│   │ • Preferences   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```


## Project Structure

```
hotel-booking-ml-app/
├── backend/                # Node.js API
│   ├── controllers/        # Business logic
│   ├── models/             # MongoDB Schemas
│   ├── routes/             # API endpoints
│   └── index.js            # Server entry
├── frontend/               # React.js frontend
│   ├── components/         # Reusable UI
│   ├── pages/              # Page views
│   └── App.js              # Root component
├── ml-service/             # Python ML microservice
│   ├── app.py              # Flask server
│   ├── recommendation_engine.py
│   └── models/             # Trained models
└── README.md               # Documentation

```

## Contributing
This project demonstrates the synergy between traditional web development and modern AI techniques. By combining booking workflows with recommendation engines, it creates a practical, production-ready system for intelligent hotel booking.

---

**StayWise** – Empowering smarter stays with insight and value. Compare better, book wiser, and travel confidently! 