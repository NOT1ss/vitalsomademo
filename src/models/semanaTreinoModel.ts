// src/models/semanaTreinoModel.ts

export interface Exercicio {
  id: string;
  nome: string;
  imagem: any;
}

export interface ExercicioCompleto extends Exercicio {
  db_id: number; // ID do exercício no banco de dados
  series: string;
  repeticoes: string;
  carga: string;
  observacoes?: string;
}

export type DiaStatus = 'concluido' | 'nao_realizado' | 'pendente';

export interface DiaSemana {
  id: string;
  diaAbreviado: string;
  diaCompleto: string;
  numero: number; // Agora será o dia do mês (ex: 2, 3, 4)
  data: Date; // A data completa para referência
  status: DiaStatus;
  exercicios: ExercicioCompleto[];
}

export const exercicioPadrao: ExercicioCompleto = {
    id: '',
    nome: '',
    series: '',
    repeticoes: '',
    carga: '',
    imagem: require('../../assets/images/almoco.jpeg'), 
};

// --- FUNÇÃO PARA GERAR A SEMANA DINAMICAMENTE ---

export const gerarSemanaAtual = (dataReferencia: Date): DiaSemana[] => {
    const hoje = dataReferencia; // Usa a data fornecida
    const diaDaSemanaHoje = hoje.getDay(); // Domingo = 0, Segunda = 1, ...
    const inicioDaSemana = new Date(hoje);
    
    // Ajusta a data para o início da semana (Domingo)
    inicioDaSemana.setDate(hoje.getDate() - diaDaSemanaHoje);
    inicioDaSemana.setHours(0, 0, 0, 0); // Zera a hora para evitar bugs de fuso horário

    const semana: DiaSemana[] = [];
    const diasAbreviados = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasCompletos = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    for (let i = 0; i < 7; i++) {
        const dataAtual = new Date(inicioDaSemana);
        dataAtual.setDate(inicioDaSemana.getDate() + i);

        semana.push({
            id: i.toString(),
            diaAbreviado: diasAbreviados[i],
            diaCompleto: diasCompletos[i],
            numero: dataAtual.getDate(),
            data: dataAtual,
            status: 'pendente',
            exercicios: [], // Os exercícios agora vêm sempre do banco de dados
        });
    }

    return semana;
};