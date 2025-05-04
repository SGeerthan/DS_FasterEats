import express from "express";
import passportGoogle from "../middleware/googleAuth.js";
import passportFacebook from "../middleware/facebookAuth.js";

const router = express.Router();

/**Google Authentication Routes **/
router.get("/google", passportGoogle.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passportGoogle.authenticate("google", { session: false }),
  (req, res) => {
    const { token, user } = req.user;
    res.redirect(`http://localhost:5173/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

/**Facebook Authentication Routes **/
// router.get("/facebook", passportFacebook.authenticate("facebook", { scope: ["email"] }));

// router.get(
//   "/facebook/callback",
//   passportFacebook.authenticate("facebook", { session: false }),
//   (req, res) => {
//     const { token, user } = req.user;
//     res.redirect(`http://localhost:5173/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
//   }
// );

export default router;
