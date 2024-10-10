const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

//check login
const authMiddleware = (req, res, next) => {
  console.log("All Cookies:", req.cookies);
  const token = req.cookies.token;
  console.log("Token:", token);
  if (!token) {
    console.log("No token found.");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

//post
//admin-check login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//get
//admin-login page

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "admin",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
      currentRoute: "/admin",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//get
//dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
    };

    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
      currentRoute: "/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});
//get
//admin-create new post
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
    };

    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
      currentRoute: "/add-post",
    });
  } catch (error) {
    console.log(error);
  }
});
//post
//admin-create new post
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

//get
//admin-create new post
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
      currentRoute: `/edit-post/${req.params.id}`,
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

//put
//admin-create new post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

//delete
//admin-delete post

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//get
//admin logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  // res.json({ message: "Logout successfully" });
  res.redirect("/");
});

// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (req.body.username === "admin" && req.body.password === "password") {
//       res.send("You are  logged in.");
//     } else {
//       res.send("Wrong username or password");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

//post
//admin- register
// router.post("/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//       const user = await User.create({ username, password: hashedPassword });
//       res.status(201).json({ message: "User Created", user });
//     } catch (error) {
//       if (error.code === 11000) {
//         res.status(409).json({ message: "User already in use" });
//       }
//       res.status(500).json({ message: "Internal server error" });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });
module.exports = router;
