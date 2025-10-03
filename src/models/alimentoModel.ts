
export interface Alimento {
  id: string;
  name: string;
  kcal: number;
  base_g: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ATUALIZE OS DADOS (pode copiar e colar esta lista)
export const tacoFoods: Alimento[] = [
  { id: '1', name: 'Arroz, integral, cozido', kcal: 112, base_g: 100, protein: 2.6, carbs: 24.1, fat: 0.9 },
  { id: '3', name: 'Arroz, tipo 1, cozido', kcal: 128, base_g: 100, protein: 2.5, carbs: 28.1, fat: 0.2 },
  { id: '7', name: 'Aveia, flocos, crua', kcal: 385, base_g: 100, protein: 13.9, carbs: 66.6, fat: 8.5 },
  { id: '9', name: 'Biscoito, doce, recheado com chocolate', kcal: 472, base_g: 100, protein: 5.8, carbs: 70.3, fat: 18.7 },
  { id: '11', name: 'Biscoito, salgado, cream cracker', kcal: 432, base_g: 100, protein: 10, carbs: 75.2, fat: 9.3 },
  { id: '21', name: 'Farinha de trigo', kcal: 364, base_g: 100, protein: 9.8, carbs: 75.1, fat: 1.4 },
  { id: '28', name: 'Pão, de forma, integral', kcal: 253, base_g: 100, protein: 9.4, carbs: 49.9, fat: 3.5 },
  { id: '30', name: 'Pão, francês', kcal: 300, base_g: 100, protein: 9, carbs: 58.6, fat: 3.1 },
  { id: '31', name: 'Abacate, polpa, crua', kcal: 96, base_g: 100, protein: 1.2, carbs: 6, fat: 8.4 },
  { id: '37', name: 'Banana, nanica, crua', kcal: 92, base_g: 100, protein: 1.4, carbs: 23.8, fat: 0.1 },
];