export const mockAlerts = [
  {
    id: 1,
    title: 'Accidente de tránsito en Calzada Roosevelt',
    description: 'Colisión entre dos vehículos bloqueando carriles hacia el sur. Se recomienda tomar rutas alternas.',
    category: 'ACCIDENTE',
    location: 'Calzada Roosevelt, Zona 10',
    distance: 320,
    reportedBy: 'María López',
    date: new Date(Date.now() - 22 * 60000),
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'Congestión vehicular en Avenida La Reforma',
    description: 'Alto flujo de vehículos debido a accidente anterior. Tráfico lento en ambas direcciones.',
    category: 'TRAFICO',
    location: 'Avenida La Reforma, Zona 10',
    distance: 450,
    reportedBy: 'Carlos Mendez',
    date: new Date(Date.now() - 15 * 60000),
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=500&h=300&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'Trabajo de construcción en Calle Mariscal',
    description: 'Cierre de carril por trabajos de reparación vial. Reducción de carriles disponibles.',
    category: 'PELIGRO',
    location: 'Calle Mariscal, Zona 9',
    distance: 680,
    reportedBy: 'Municipalidad de Guatemala',
    date: new Date(Date.now() - 45 * 60000),
    image: 'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=500&h=300&fit=crop&q=60'
  },
  {
    id: 4,
    title: 'Lluvia intensa en zona central',
    description: 'Precipitaciones fuertes en la zona. Conducir con precaución, visibilidad reducida.',
    category: 'PELIGRO',
    location: 'Zona 1, Centro de la ciudad',
    distance: 1200,
    reportedBy: 'Sistema meteorológico',
    date: new Date(Date.now() - 8 * 60000),
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a4c817?w=500&h=300&fit=crop&q=60'
  },
  {
    id: 5,
    title: 'Evento: Marcha sobre Avenida Simón Bolívar',
    description: 'Se realizará una marcha programada que afectará el tránsito en la avenida principal.',
    category: 'OTROS',
    location: 'Avenida Simón Bolívar, Zona 2',
    distance: 2100,
    reportedBy: 'Policía de Tránsito',
    date: new Date(Date.now() - 120 * 60000),
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop&q=60'
  },
  {
    id: 6,
    title: 'Accidente de motocicleta en Anillo Periférico',
    description: 'Choque de motocicleta contra vehículo particular. Emergencias en el lugar.',
    category: 'ACCIDENTE',
    location: 'Anillo Periférico, Zona 12',
    distance: 3400,
    reportedBy: 'Juan García',
    date: new Date(Date.now() - 5 * 60000),
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=500&h=300&fit=crop&q=60'
  }
]
