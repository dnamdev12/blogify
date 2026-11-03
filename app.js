require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();

const PORT = process.env.PORT || 8001;

function connectToMongo() {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("mongodb connected"))
    .catch((err) => {
      console.error("mongodb connection failed:", err.message);
      setTimeout(connectToMongo, 10000);
    });
}
connectToMongo();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort("createdAt");
  res.render("home", { user: req.user, blogs: allBlogs });
});

app.listen(PORT, () => console.log("server started"));
