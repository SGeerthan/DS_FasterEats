import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { JWT_SECRET } from "../config.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,   
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            role: "taxpayer",
            hashed_password: "google-auth",
          });
          await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { token, user });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
