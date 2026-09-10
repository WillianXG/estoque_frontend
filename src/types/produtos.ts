export interface Categoria {
  id: string;
  nome: string;
}

export interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
}

export interface Variante {
  id?: string;
  variacao: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
  imagem_url?: string;
  imagemFile?: File | null;
  loading?: boolean;
}

export interface Produto {
  id?: string;
  nome?: string;
  imagem_url: string;
  categoria_id?: string;
  subcategoria_id?: string;
  preco_venda?: string;
  preco_compra?: string;
  variantes?: Variante[];
}

export interface LoteUpload {
  categoria_id: string;
  subcategoria_id: string;
  preco_venda: string;
  preco_compra: string;
  arquivos: File[];
}