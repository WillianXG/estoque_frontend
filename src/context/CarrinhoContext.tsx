import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Produto {
  id_carrinho: string;   // A chave única (ex: "10-1-arara")
  id: number;            // ID do produto pai
  id_variante: number;   // ID da variante específica
  nome: string;
  tamanho: string;
  variacao: string;
  origem: 'arara' | 'deposito';
  preco: number;
  imagem_url: string;
  quantidade: number;
  estoque: number;
}

interface CarrinhoContextType {
  carrinho: Produto[];
  adicionar: (produto: Produto) => boolean;
  remover: (id_carrinho: string) => void;
  limpar: () => void;
  aumentar: (id_carrinho: string) => boolean;
  diminuir: (id_carrinho: string) => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  // 🔹 Inicializa carrinho a partir do localStorage
  const [carrinho, setCarrinho] = useState<Produto[]>(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
  });

  // 🔹 Sempre que o carrinho mudar, salva no localStorage
  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }, [carrinho]);

  // CORREÇÃO: Agora usamos p.id_carrinho para diferenciar tamanhos/origens
  function adicionar(produto: Produto): boolean {
    const item = carrinho.find(p => p.id_carrinho === produto.id_carrinho);

    if (item) {
      if (item.quantidade >= item.estoque) return false;

      setCarrinho(prev =>
        prev.map(p =>
          p.id_carrinho === produto.id_carrinho ? { ...p, quantidade: p.quantidade + 1 } : p
        )
      );

      return true;
    }

    if (produto.estoque <= 0) return false;

    setCarrinho(prev => [...prev, { ...produto, quantidade: 1 }]);
    return true;
  }

  function aumentar(id_carrinho: string): boolean {
    const item = carrinho.find(p => p.id_carrinho === id_carrinho);
    if (!item) return false;
    if (item.quantidade >= item.estoque) return false;

    setCarrinho(prev =>
      prev.map(p => (p.id_carrinho === id_carrinho ? { ...p, quantidade: p.quantidade + 1 } : p))
    );

    return true;
  }

  function diminuir(id_carrinho: string) {
    setCarrinho(prev =>
      prev
        .map(item =>
          item.id_carrinho === id_carrinho ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter(item => item.quantidade > 0)
    );
  }

  function remover(id_carrinho: string) {
    setCarrinho(prev => prev.filter(p => p.id_carrinho !== id_carrinho));
  }

  function limpar() {
    setCarrinho([]);
  }

  return (
    <CarrinhoContext.Provider
      value={{ carrinho, adicionar, remover, limpar, aumentar, diminuir }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) throw new Error("useCarrinho must be used inside CarrinhoProvider");
  return context;
}