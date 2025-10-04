// src/models/semanaTreinoModel.ts

export interface Exercicio {
  id: string;
  nome: string;
  imagem: any;
}

export interface ExercicioCompleto extends Exercicio {
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

export const gerarSemanaAtual = (): DiaSemana[] => {
    const hoje = new Date();
    // Para teste, podemos fixar a data, ex: const hoje = new Date(2025, 8, 5); // Uma sexta-feira
    const diaDaSemanaHoje = hoje.getDay(); // Domingo = 0, Segunda = 1, ..., Sábado = 6
    const inicioDaSemana = new Date(hoje);
    
    // Ajusta a data para o início da semana (Domingo)
    inicioDaSemana.setDate(hoje.getDate() - diaDaSemanaHoje);

    const semana: DiaSemana[] = [];
    const diasAbreviados = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    for (let i = 0; i < 7; i++) {
        const dataAtual = new Date(inicioDaSemana);
        dataAtual.setDate(inicioDaSemana.getDate() + i);

        // Adiciona treinos mockados para certos dias da semana para exemplo
        let exerciciosDoDia: ExercicioCompleto[] = [];
        if (i === 1 || i === 4) { // Segunda e Quinta
            exerciciosDoDia = [{ id: 'ex1', nome: 'Supino Reto', imagem: require('../../assets/images/almoco.jpeg'), series: '4', repeticoes: '10-12', carga: '20kg' }];
        }
        if (i === 3 || i === 5) { // Quarta e Sexta
            exerciciosDoDia = [{ id: 'ex4', nome: 'Agachamento', imagem: require('../../assets/images/almoco.jpeg'), series: '4', repeticoes: '8-10', carga: '50kg' }];
        }

        semana.push({
            id: i.toString(),
            diaAbreviado: diasAbreviados[i],
            diaCompleto: diasCompletos[i],
            numero: dataAtual.getDate(), // Número real do dia no calendário
            data: dataAtual,
            status: 'pendente', // Status inicial
            exercicios: exerciciosDoDia,
        });
    }

    return semana;
};