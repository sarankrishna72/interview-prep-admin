const User = require("../models/user");

exports.getLogin = (req, res) => {
  // If already logged in → redirect
 res.render('auth/login', {
    title: 'Admin Login',
    error: null
  });
  
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Early validation
        const validationError = validateLoginInput(email, password);
        if (validationError) {
            return renderLoginError(res, validationError);
        }
        // Find and validate user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return renderLoginError(res, 'Invalid email or password');
        }
        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return renderLoginError(res, 'Invalid email or password');
        }
        // Success: set session and redirect
        req.session.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };
        return res.redirect('/questions');

    } catch (error) {
        console.error('Web Login Error:', error);
        return renderLoginError(res, 'Something went wrong. Please try again.');
    }
};

// Validation helper
function validateLoginInput(email, password) {
    if (!email || !password) {
        return 'Please enter email and password';
    }
    return null; // No error
}

// Helper function to reduce repetition
function renderLoginError(res, errorMessage) {
    return res.render('auth/login', {
        title: 'Admin Login',
        error: errorMessage
    });
}

