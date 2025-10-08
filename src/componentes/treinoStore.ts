// src/componentes/treinoStore.ts
import { DiaSemana, gerarSemanaAtual } from '../models/semanaTreinoModel';

let estado: {
    dias: DiaSemana[];
} = {
    dias: [],
};

export const inicializarStore = () => {
    if (estado.dias.length === 0) {
        const hoje = new Date();
        const semanaGerada = gerarSemanaAtual();
        const semanaComStatus = semanaGerada.map(dia => {
            let status = 'pendente';
            if (dia.exercicios.length > 0) {
                status = 'concluido';
            } else if (dia.data.setHours(0,0,0,0) < hoje.setHours(0,0,0,0)) {
                status = 'nao_realizado';
            }
            return { ...dia, status: status as 'concluido' | 'nao_realizado' | 'pendente' };
        });
        estado.dias = semanaComStatus;
    }
};

export const getDias = (): DiaSemana[] => {
    return estado.dias;
};

export const atualizarDiaNaStore = (diaAtualizado: DiaSemana): DiaSemana[] => {
    const novosDias = estado.dias.map(d => 
        d.id === diaAtualizado.id ? diaAtualizado : d
    );
    estado.dias = novosDias;
    return novosDias;
};