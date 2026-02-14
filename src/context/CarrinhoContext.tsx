import { createContext, useContext, useState, type ReactNode } from "react";

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem_url: string;
  quantidade: number;
  estoque: number;
}

interface CarrinhoContextType {
  carrinho: Produto[];
  adicionar: (produto: Produto) => boolean;
  remover: (id: number) => void;
  limpar: () => void;
  aumentar: (id: number) => boolean;
  diminuir: (id: number) => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<Produto[]>([]);

  function adicionar(produto: Produto): boolean {
    const existe = carrinho.find(p => p.id === produto.id);

    if (existe) {
      if (existe.quantidade >= produto.estoque) {
        return false;
      }

      setCarrinho(prev =>
        prev.map(p =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      );

      return true;
    }

    if (produto.estoque <= 0) {
      return false;
    }

    setCarrinho(prev => [...prev, { ...produto, quantidade: 1 }]);
    return true;
  }

  function aumentar(id: number): boolean {
    const item = carrinho.find(p => p.id === id);
    if (!item) return false;

    if (item.quantidade >= item.estoque) {
      return false;
    }

    setCarrinho(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, quantidade: p.quantidade + 1 }
          : p
      )
    );

    return true;
  }

  function diminuir(id: number) {
    setCarrinho(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );
  }

  function remover(id: number) {
    setCarrinho(prev => prev.filter(p => p.id !== id));
  }

  function limpar() {
    setCarrinho([]);
  }

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionar,
        remover,
        limpar,
        aumentar,
        diminuir,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error("useCarrinho must be used inside CarrinhoProvider");
  }
  return context;
}
