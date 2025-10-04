export interface AtividadeFisica {
  id: string;
  nome: string;
  imagem: any; 
}

export const mockAtividades: AtividadeFisica[] = [
  {
    id: '1',
    nome: 'Academia',
    imagem: require('../../assets/images/image 40.png'),
  },
  {
    id: '2',
    nome: 'Caminhada',
    // Placeholder - replace with your actual image
    imagem: require('../../assets/images/almoco.jpeg'),
  },
  {
    id: '3',
    nome: 'Ciclismo',
    // Placeholder - replace with your actual image
    imagem: require('../../assets/images/janta.jpg'),
  },
  {
    id: '4',
    nome: 'Corrida',
    // Placeholder - replace with your actual image
    imagem: require('../../assets/images/cafemanha.jpg'),
  },
];