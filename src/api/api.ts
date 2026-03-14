// src/api/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://estoque-backend-y9le.onrender.com",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
});


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calcularFrete = async (cepDestino: string, pacotes: any[]) => {
  try {
    const res = await api.post("/frete", { cepDestino, pacotes });
    // Resposta esperada: [{ servico: "PAC", valor: 12.35, prazo: 5 }, ...]
    if (Array.isArray(res.data) && res.data.length > 0) {
      // Pega o menor valor
      const menor = res.data.reduce((prev, curr) =>
        curr.valor < prev.valor ? curr : prev
      );
      return menor;
    }
    return { valor: 0, prazo: 0 };
  } catch (err) {
    console.error(err);
    return { valor: 0, prazo: 0 };
  }
};

export default api;