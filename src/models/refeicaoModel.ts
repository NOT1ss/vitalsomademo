import { Alimento } from './alimentoModel';

export interface Refeicao {
  id: string;
  name: string;
  foods: Alimento[];
}
