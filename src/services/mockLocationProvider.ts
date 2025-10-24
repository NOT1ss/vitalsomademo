type LatLng = {
  latitude: number;
  longitude: number;
};

// Rota de simulação (ex: uma volta em um parque)
const mockRoute: LatLng[] = [
  { latitude: -23.58690, longitude: -46.66080 },
  { latitude: -23.58691, longitude: -46.66081 },
  { latitude: -23.58692, longitude: -46.66082 },
  { latitude: -23.58693, longitude: -46.66083 },
  { latitude: -23.58694, longitude: -46.66084 },
  { latitude: -23.58695, longitude: -46.66085 },
  { latitude: -23.58696, longitude: -46.66086 },
  { latitude: -23.58697, longitude: -46.66087 },
  { latitude: -23.58698, longitude: -46.66088 },
  { latitude: -23.58699, longitude: -46.66089 },
];

let intervalId: NodeJS.Timeout | null = null;
let currentCallback: ((location: { coords: LatLng }) => void) | null = null;
let currentIndex = 0;

// Simula o Location.watchPositionAsync
export const startMockTracking = (callback: (location: { coords: LatLng }) => void) => {
  stopMockTracking(); // Garante que não haja intervalos anteriores rodando

  currentCallback = callback;
  currentIndex = 0; // Reinicia o índice para uma nova "corrida"

  intervalId = setInterval(() => {
    if (currentCallback && mockRoute.length > 0) {
      currentCallback({ coords: mockRoute[currentIndex] });
      currentIndex = (currentIndex + 1) % mockRoute.length; // Loop a rota
    }
  }, 100); // Envia uma nova coordenada a cada 0.1 segundos

  // Retorna um objeto compatível com a subscrição do Expo Location
  return {
    remove: () => stopMockTracking(),
  };
};

export const stopMockTracking = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  currentCallback = null;
};