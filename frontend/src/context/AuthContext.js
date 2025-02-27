import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Uygulama başladığında oturum durumunu kontrol edelim
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        
        // İsteğe bağlı: Token'in geçerliliğini backend'den kontrol edebilirsiniz
        // const isValid = await verifyToken(storedToken, userData.id);
        
        // if (isValid) {
          setUser(userData);
        // } else {
        //   localStorage.removeItem("token");
        //   localStorage.removeItem("user");
        // }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Yükleme durumundayken bir loading göstergesi
  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
