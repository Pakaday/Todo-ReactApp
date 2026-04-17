# SmartTask — Full-Stack Todo Application

A full-stack task management application with JWT-based authentication, user-scoped data, and a complete xUnit test suite. Built as a capstone project demonstrating end-to-end full-stack development from authentication through deployment.

**Live demo:** [todo-react-app-two-beta.vercel.app](https://todo-react-app-two-beta.vercel.app)

## What This Is

SmartTask is a production-deployed application where authenticated users can manage their own private task lists. The project covers the full development lifecycle — API design, authentication, database migrations, frontend integration, unit testing, and CI/CD deployment to Azure and Vercel.

## Stack

**Backend:** ASP.NET Core 8, Entity Framework Core, SQL Server, JWT Bearer Authentication, BCrypt.Net

**Frontend:** React, React Router, JavaScript

**Testing:** xUnit, EF Core In-Memory provider

**Deployment:** Azure App Service (backend CI/CD), Vercel (frontend)

## Architecture

```
React Frontend (Vercel)
        │
        │  JWT Bearer token on every request
        ▼
ASP.NET Core REST API (Azure)
        │
        ├── UsersController  — register, login, JWT generation
        └── TodoItemsController  — [Authorize] CRUD, user-scoped
                │
                ▼
        SQL Server (EF Core)
```

## Features

**Authentication**
- User registration with duplicate username check
- Password hashing via BCrypt — passwords are never stored in plain text
- JWT token generation on login with configurable issuer, audience, and expiry
- All todo endpoints protected with `[Authorize]` attribute
- User identity extracted from JWT claims on every request

**User-Scoped Data**
- Every todo item is associated with the authenticated user's identity
- All queries filter by `UserId` — users can only read, update, or delete their own tasks
- This isolation is enforced at the database query level, not just the UI

**Task Management**
- Full CRUD: create, read (list + by ID), update, delete
- Title and due date validation at both client and server
- Real-time form validation with error display on change
- Search/filter tasks by title or description
- Export current task list to CSV with timestamped filename
- Edit mode pre-populates the form with existing task data
- isSubmit guard prevents double-submission

**Guest Mode**
- Users can try the app without registering
- Guest tasks are persisted to localStorage
- Guest mode uses the same UI components with localStorage instead of API calls

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/users/register` | None | Register new user |
| POST | `/api/users/login` | None | Login, returns JWT token |
| GET | `/api/todoitems` | JWT | Get all tasks for authenticated user |
| GET | `/api/todoitems/{id}` | JWT | Get specific task (user-scoped) |
| POST | `/api/todoitems` | JWT | Create new task |
| PUT | `/api/todoitems/{id}` | JWT | Update task (user-scoped) |
| DELETE | `/api/todoitems/{id}` | JWT | Delete task (user-scoped) |

## Unit Tests

A separate `TodoApi.Tests` project covers the controller layer using an in-memory EF Core database and a mocked `ClaimsPrincipal` for authentication context:

```
✓ GetTodoItems_ReturnsUserSpecificItems   — user isolation verified
✓ GetById_ReturnsCorrectItem             — correct item returned by ID
✓ GetById_ReturnsNotFound                — 404 for non-existent ID
✓ PostTodoItem_CreatesItem               — item created and returned
✓ PutTodoItem_UpdatesCorrectly           — title and fields updated
✓ DeleteTodoItem_RemovesItem             — item removed from DB
```

The `TestDbContextFactory` creates a fresh in-memory database per test using a random GUID as the database name, ensuring test isolation.

## Running Locally

**Prerequisites:** .NET 8 SDK, SQL Server or SQL Server LocalDB, Node.js

**1. Backend — add to `appsettings.Development.json`:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=TodoDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-secret-key-at-least-32-chars",
    "Issuer": "TodoApi",
    "Audience": "TodoClient"
  }
}
```

**2. Apply migrations and run backend:**

```bash
dotnet ef database update
dotnet run
```

**3. Frontend:**

```bash
cd client
echo "REACT_APP_API_URL=https://localhost:5001/api" > .env
npm install
npm start
```

**4. Run tests:**

```bash
cd TodoApi.Tests
dotnet test
```

## Key Design Decisions

**BCrypt for password hashing** — passwords are hashed with a work factor before storage. Plain text passwords are never persisted.

**User isolation at the query layer** — rather than filtering results after fetching, every query includes a `WHERE UserId = currentUser` clause. This means unauthorized data never leaves the database, not just the API.

**In-memory database per test** — each test gets a fresh `Guid`-named database, preventing state leakage between tests without needing to reset or seed data.

**JWT claims for identity** — the controller extracts `User.Identity.Name` from the JWT claims rather than accepting a userId parameter, preventing users from accessing other users' data by guessing IDs.

**Guest mode with localStorage** — same React components handle both authenticated and guest users; the data source (API vs localStorage) switches based on the user state rather than duplicating UI logic.

##  Author

Frederick Neimeister

---

> This project is part of a capstone demonstrating full-stack software development skills, including secure authentication, data persistence, testing, and documentation.
