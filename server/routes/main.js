const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
//routes
//get
//home
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
    };

    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});
// get
//post:id
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs,Express & Mongodb",
      currentRoute: `/post/${slug}`,
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

//post
//post:searchTerm
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "search",
      description: "Simple Blog created with NodeJs,Express & Mongodb",
      currentRoute: "/search",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-z0-9]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", {
      data,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about", {
    currentRoute: "/about",
  });
});

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Discover how to use express.js",
//       body: "Discover how to use express.js, a popular node.js web frame work, to build web applications",
//     },
//   ]);
// }
// insertPostData();

module.exports = router;
