const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Authority authentication routes
router.post("/authority/signup", authController.authoritySignUp);
router.post("/authority/signin", authController.authoritySignIn);
router.post("/authority/verify", authController.verifyAuthorityToken);

module.exports = router;
