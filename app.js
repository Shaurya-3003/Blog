// jshint esversion: 6

import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import _ from "lodash";
import mongoose from 'mongoose';
import cors from 'cors';

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

mongoose.connect("mongodb://localhost:27017/blogDB");

const blogSchema = {
	title: String,
	body: String
};

const Blog = mongoose.model("Blog", blogSchema);

let blogList = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

app.get("/", function (req, res) {
	// res.render("home", { homeStartingContent: homeStartingContent, blogList: blogList });
	Blog.find({}, function (err, foundBlogs) {
		res.render("home", { homeStartingContent: homeStartingContent, blogList: foundBlogs });
	});
});

app.get("/about", function (req, res) {
	res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
	res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function (req, res) {
	res.render("compose");
});

app.get("/posts/:postID", function (req, res) {
	const uniqueID = req.params.postID;
	Blog.findOne({ _id: uniqueID }, function (err, blog) {
		if (!err) {
			res.render("post", { blog: blog });
		}
	});
});

app.post("/compose", function (req, res) {
	const blogTitle = _.capitalize(req.body.blogTitle);
	const blogBody = req.body.blogBody;
	const entry = new Blog({
		title: blogTitle,
		body: blogBody
	});
	entry.save();
	console.log(Blog);
	res.redirect("/");
});

app.route("/blogs")
	.get(function (req, res) {
		Blog.find(function (err, foundBlogs) {
			res.send(foundBlogs);
		});
	})
	.post(function (req, res) {
		const newBlog = new Blog({
			title: req.body.blogTitle,
			body: req.body.blogBody
		});
		newBlog.save();
	})
	.delete(function (req, res) {
		Blog.deleteMany(function (err) {
			if (!err) {
				res.send("Deleted all blogs successfully.")
			}
			else res.send(err);
		});
	});

app.route("/blogs/:title")
	.get(function (req, res) {
		Blog.findOne({ title: req.params.title }, function (foundBlog, err) {
			if (err) {
				res.send(err);
			}
			else {
				if (foundBlog) {
					res.send(foundBlog);
				}
				else{
					res.send("Didn't find a blog with this name.")
				}
			}
		})
	})
	.delete(function (req, res) {
		Blog.deleteOne({ title: req.params.title }, function (err) {
			if (err) {
				res.send(err);
			}
			else {
				res.send("Deleted article with name " + req.params.title);
			}
		})
	});



app.listen(5000, function () {
	console.log("Server started on port 5000");
});
