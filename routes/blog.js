const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", { user: req.user });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});
router.get("/:blogId", async (req, res) => {
  const blog = await Blog.findById(req.params.blogId).populate("createdBy");
  console.log(blog, "blog");
  if (!blog) return res.redirect("/");
  const comments = await Comment.find({ blogId: req.params.blogId })
    .sort("-createdAt")
    .populate("createdBy");
  return res.render("blog", { user: req.user, blog: blog, comments });
});

router.post("/comment/:blogId", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
