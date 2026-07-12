# Project Management Platform

Backend for a project, team, task, and comment management platform built with Node.js, Express, Prisma, MySQL, JWT, bcrypt, dotenv, cookie-parser, and CORS.

## Folder Structure

```text
backend/
	prisma/
	src/
		config/
		controllers/
		middleware/
		routes/
		services/
		utils/
		app.js
		server.js
```

## Installation

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

## Environment Variables

Set these in `backend/.env`:

```env
DATABASE_URL="mysql://root:Root12345@localhost:3306/project_management"
JWT_SECRET=your_secret_key
PORT=5000
```

## Response Format

Success:

```json
{
	"success": true,
	"message": "",
	"data": {}
}
```

Error:

```json
{
	"success": false,
	"message": ""
}
```

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Users `ADMIN` only

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

### Tasks

- `GET /api/tasks`
- `GET /api/tasks/my-tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/assign`
- `PATCH /api/tasks/:id/status`

### Comments

- `POST /api/comments`
- `GET /api/comments/task/:taskId`
- `DELETE /api/comments/:id`

### Dashboards

- `GET /api/dashboard/admin`
- `GET /api/dashboard/manager`
- `GET /api/dashboard/member`

## Postman Collection

Import this file into Postman:

- [backend/postman/ProjectManagementPlatform.postman_collection.json](backend/postman/ProjectManagementPlatform.postman_collection.json)

Use these collection variables:

- `baseUrl`
- `token`
- `userId`
- `projectId`
- `taskId`
- `commentId`

## Notes

- Authentication works with either a Bearer token or the `token` httpOnly cookie.
- Role-based access is enforced through reusable middleware.
- Prisma transactions are used where multi-step writes are required.