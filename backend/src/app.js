const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const projectsRoutes = require("./routes/projects.routes");
const tasksRoutes = require("./routes/tasks.routes");
const commentsRoutes = require("./routes/comments.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Project Management API Running",
    data: {},
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;