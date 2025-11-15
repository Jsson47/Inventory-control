import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../index.js";

const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Suscribirse a cambios de autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            // session puede ser null al cerrar sesión
            console.log("auth event:", event, session);
            if (!session?.user) {
                setUser(null);
            } else {
                setUser(session.user);
            }
        });

        // Cleanup: desuscribirse correctamente
        return () => {
            try {
                // Diferentes versiones de supabase-js exponen unsubscribe de forma distinta
                if (authListener?.subscription?.unsubscribe) {
                    authListener.subscription.unsubscribe();
                } else if (authListener?.unsubscribe) {
                    authListener.unsubscribe();
                }
            } catch (err) {
                console.warn("Failed to unsubscribe auth listener:", err);
            }
        };
    }, []); // efecto solo al montar

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);