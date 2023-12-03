const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const fetchUSer = require("../middleware/fetchUser");
const JWT_SECRET = "helloKaushikBeinLimit";

// ROUTE 1: Create a user using:POST on '/api/auth/signup' ; Doesn't require authentication
router.post(
  "/signup",
  [
    body("name").isLength({ min: 3 }),
    body("email", "Please enter a valid email address").isEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      // .withMessage(
      //   "Password must contain at least one lowercase letter, one uppercase letter, and one special character"
      // ),
  ],
  async (req, res) => {
    let signup=false;
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.json({ errors: result.array() });
      }
  
      // checking if the email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ signup,msg: "Email already exist" });
      }
  
      // Password hashing
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
  
      // User Creation
      user = await new User({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      user.save().then(() => {
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        signup=true;
        return res
          .status(200)
          .json({authToken, signup, msg: "User Created Successfully"});
      });
      
    } catch (error) {
      return res.send({signup,msg:"Enter valid email"})
    }
  }
);

// ROUTE 2: Authenticate a user using:POST on '/api/auth/login' ; Doesn't require authentication

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let login=false
    //if there are errors return bad request and the errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ login,errors: result.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ login, msg: "Please try to login with correct credentials!!" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({login, msg: "Enter correct password" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      login=true;
      res.json({ login,authToken,msg:"You have succesfully logged in!!" });
    } catch (error) {
      res.status(500).send({login,msg:"Server Error, Try Again!!"});
    }
  }
);

// ROUTE 3: Get loggedin user details using:POST on '/api/auth/getUser' ; Require authentication

router.post("/getUser", fetchUSer, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send({user})
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured");
  }
});

module.exports = router;
