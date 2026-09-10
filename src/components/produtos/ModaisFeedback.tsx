import { FiTrash2 } from "react-icons/fi";
import type { Produto } from "../../types/produtos";

interface ModaisFeedbackProps {
  modalConfirmarRemocao: boolean;
  produtoParaRemover: Produto | null;
  removendo: boolean;
  onConfirmarRemocao: () => void;
  onCancelarRemocao: () => void;
  modalSucesso: boolean;
  modalErro: boolean;
  onFecharFeedback: () => void;
}

export function ModaisFeedback({
  modalConfirmarRemocao,
  produtoParaRemover,
  removendo,
  onConfirmarRemocao,
  onCancelarRemocao,
  modalSucesso,
  modalErro,
  onFecharFeedback,
}: ModaisFeedbackProps) {
  return (
    <>
      {modalConfirmarRemocao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">Remover?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
              Deseja mesmo apagar <span className="font-bold text-gray-800 dark:text-white">{produtoParaRemover?.nome}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onCancelarRemocao} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95">Não</button>
              <button onClick={onConfirmarRemocao} disabled={removendo} className="px-4 py-3 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20">
                {removendo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sim, apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(modalSucesso || modalErro) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalSucesso ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {modalSucesso ? '✓' : '✕'}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${modalSucesso ? 'text-green-600' : 'text-red-600'}`}>
              {modalSucesso ? 'Tudo certo!' : 'Algo deu errado'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {modalSucesso ? 'O produto foi removido.' : 'Não conseguimos processar sua solicitação.'}
            </p>
            <button
              onClick={onFecharFeedback}
              className={`w-full py-3 text-white rounded-2xl font-bold transition-all active:scale-95 ${modalSucesso ? 'bg-green-600 shadow-green-900/20' : 'bg-red-600 shadow-red-900/20'} shadow-lg`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}