const User = require("../models/user");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Admin Login",
    error: null
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginInput(email, password);
    if (validationError) {
      return renderLoginError(res, validationError);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log(user)
    if (!user) {
      return renderLoginError(res, "Invalid email or password");
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return renderLoginError(res, "Invalid email or password");
    }

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error:", err);
        return renderLoginError(res, "Unable to start session. Please try again.");
      }

      return res.redirect("/questions");
    });
  } catch (error) {
    console.error("Web Login Error:", error);
    return renderLoginError(res, "Something went wrong. Please try again.");
  }
};

function validateLoginInput(email, password) {
  if (!email || !password) {
    return "Please enter email and password";
  }
  return null;
}

function renderLoginError(res, errorMessage) {
  return res.status(401).render("auth/login", {
    title: "Admin Login",
    error: errorMessage
  });
}