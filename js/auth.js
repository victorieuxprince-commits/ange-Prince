// js/auth.js
import { auth, db } from "../firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Inscription d'un nouvel utilisateur
 */
export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Créer le document utilisateur dans Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            displayName: displayName,
            role: "customer",
            createdAt: new Date()
        });

        console.log("Utilisateur inscrit :", user);
        return user;
    } catch (error) {
        console.error("Erreur d'inscription :", error.message);
        throw error;
    }
};

/**
 * Connexion d'un utilisateur
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Connecté :", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Erreur de connexion :", error.message);
        throw error;
    }
};

/**
 * Déconnexion
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("Déconnecté");
    } catch (error) {
        console.error("Erreur de déconnexion :", error.message);
    }
};

/**
 * Observer l'état de l'utilisateur
 */
export const observeAuth = (callback) => {
    onAuthStateChanged(auth, callback);
};
