// controllers/authController.js
import { auth } from "../config/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User registered with UID:", user.uid); // Log the UID
        res.status(201).json({ user });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(400).json({ error: error.message });
    }
};

export const signInUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in with UID:", user.uid); // Log the UID
        res.status(200).json({ user, redirectTo: "/addCoin.html" });
    } catch (error) {
        console.error("Sign-in error:", error.message);
        res.status(400).json({ error: error.message });
    }
};
