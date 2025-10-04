// Isola a comunicação com a API.
const API_URL = "https://hiro-api.vercel.app/api/chat";

export const ChatService = {
  getBotReply: async (prompt: string): Promise<string> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta da rede.');
      }

      const data = await response.json();
      return data.reply;

    } catch (error) {
      console.error("Erro ao buscar resposta do bot:", error);
      // Retorna uma mensagem de erro amigável em caso de falha.
      return "Desculpe, não consegui me conectar. Tente novamente mais tarde.";
    }
  }
};