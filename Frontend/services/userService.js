import api from "./api.js";

export const registerUser = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error.response?.data || { error: "Registration failed" };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { error: "Login failed" };
  }
};
