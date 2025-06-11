# SmartTask - Full-Stack Task Management App

SmartTask is a full-featured task management web application built using a **React** frontend and **ASP.NET Core** backend. It supports personal productivity by allowing users to create, manage, and organize their tasks efficiently and securely.

## 🚀 Features

- User registration and login with secure authentication (JWT)
- Add, edit, and delete tasks with:
  - Title, description, due date, and status
- Search and filter functionality for tasks
- Export task list to CSV for reports
- Responsive and user-friendly interface
- Each user has their own unique task list

## 🔧 Technologies Used

### Frontend
- React (Vite)
- Axios for HTTP requests
- TailwindCSS for styling

### Backend
- ASP.NET Core Web API
- Entity Framework Core (with SQL Server and InMemory for testing)
- JWT for authentication

### Testing
- xUnit
- EF Core InMemory provider for isolated unit tests

## 🗃️ Project Structure

```
SmartTask/
├── TodoApi/                  # ASP.NET Core backend
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   └── Program.cs
├── client/                   # React frontend
│   ├── src/
│   └── index.html
├── TodoApi.Tests/            # Unit test project (xUnit)
```

## 🛠️ Setup Instructions

### Backend
1. Navigate to `TodoApi` folder
2. Run the API: `dotnet run`
3. Ensure SQL Server is running and connection string is configured in `appsettings.json`

### Frontend
1. Navigate to `client` folder
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

## 🧪 Running Tests

1. Navigate to `TodoApi.Tests` folder
2. Run tests: `dotnet test`

## 📁 Environment Configuration

- `appsettings.Development.json` – for development DB connection
- `.env` – for frontend API base URL

## ✍️ Author

Frederick Neimeister

---

> This project is part of a capstone demonstrating full-stack software development skills, including secure authentication, data persistence, testing, and documentation.