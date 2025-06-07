// firebase.js - Modificación para Firebase v9 en adelante
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";

// Configuración de Firebase (actualiza con tus datos)
const firebaseConfig = {
  apiKey: "AIzaSyA03M9P-xAkiz-Y7rkBc4YM0HhbYZLbW8U",
  authDomain: "tradehub-project.firebaseapp.com",
  databaseURL: "https://tradehub-project-default-rtdb.firebaseio.com/",
  projectId: "tradehub-project",
  storageBucket: "tradehub-project.firebasestorage.app",
  messagingSenderId: "328061985780",
  appId: "1:328061985780:web:03dc0b3cf85551d4c4cfa1",
  measurementId: "G-0XZ4RQ5WNB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la referencia a la base de datos
const database = getDatabase(app);

// Obtener instancia de autenticación
const auth = getAuth(app);

// Configurar proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Función para registrar usuario
const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: displayName
    });

    await sendEmailVerification(userCredential.user);

    // 🔒 Cerrar sesión después de registrar y enviar verificación
    await signOut(auth);

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


// Función para login con email/password
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Función para login con Google
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Función para cerrar sesión
const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Función para recuperar contraseña
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Exportar las funciones y servicios necesarios
export {
  auth,
  registerUser,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  sendEmailVerification,
  updateProfile,
  database,
  ref,
  set,
  get
};
