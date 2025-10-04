// Interface que define o formato de uma categoria de receita
export interface RecipeCategory {
  id: string;
  name: string;
  image: any; // Usamos 'any' para aceitar imagens locais com require()
}

// Criamos uma lista de dados de exemplo (mock) que simula uma chamada de API
export const mockCategories: RecipeCategory[] = [
  {
    id: '1',
    name: 'Café da Manhã',
    image: require('../../assets/images/cafemanha.jpg'), // Crie essa pasta e adicione as imagens
  },
  {
    id: '2',
    name: 'Almoço',
    image: require('../../assets/images/almoco.jpeg'),
  },
  {
    id: '3',
    name: 'Jantar',
    image: require('../../assets/images/janta.jpg'),
  },
  {
    id: '4',
    name: 'Lanches',
    image: require('../../assets/images/cafemanha.jpg'),
  },
];