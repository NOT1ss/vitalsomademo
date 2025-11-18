// Interface que define o formato de uma categoria de receita
export interface RecipeCategory {
  id: string;
  name: string;
  queryName: string; // Nome para a busca no banco
  image: any; // Usamos 'any' para aceitar imagens locais com require()
}

// Criamos uma lista de dados de exemplo (mock) que simula uma chamada de API
export const mockCategories: RecipeCategory[] = [
  {
    id: '1',
    name: 'Café da Manhã',
    queryName: 'cafe da manha',
    image: require('../../assets/images/cafemanha.jpg'), // Crie essa pasta e adicione as imagens
  },
  {
    id: '2',
    name: 'Almoço',
    queryName: 'almoco',
    image: require('../../assets/images/almoco.jpeg'),
  },
  {
    id: '3',
    name: 'Jantar',
    queryName: 'jantar',
    image: require('../../assets/images/janta.jpg'),
  },
  {
    id: '4',
    name: 'Lanches',
    queryName: 'lanches',
    image: require('../../assets/images/cafemanha.jpg'),
  },
];