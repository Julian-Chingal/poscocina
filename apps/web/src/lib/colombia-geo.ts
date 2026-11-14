export interface DepartmentData {
  id: string;
  name: string;
  defaultCoords: [number, number];
  zoom: number;
  municipalities: Array<{
    name: string;
    coords: [number, number];
  }>;
}

export const COLOMBIA_DEPARTMENTS: DepartmentData[] = [
  {
    id: 'bogota',
    name: 'Bogotá D.C.',
    defaultCoords: [4.7110, -74.0721],
    zoom: 12,
    municipalities: [
      { name: 'Bogotá D.C.', coords: [4.7110, -74.0721] },
    ],
  },
  {
    id: 'antioquia',
    name: 'Antioquia',
    defaultCoords: [6.2442, -75.5812],
    zoom: 12,
    municipalities: [
      { name: 'Medellín', coords: [6.2442, -75.5812] },
      { name: 'Bello', coords: [6.3373, -75.5579] },
      { name: 'Itagüí', coords: [6.1846, -75.5991] },
      { name: 'Envigado', coords: [6.1759, -75.5917] },
      { name: 'Sabaneta', coords: [6.1515, -75.6164] },
      { name: 'Rionegro', coords: [6.1551, -75.3737] },
      { name: 'La Estrella', coords: [6.1578, -75.6431] },
      { name: 'Caldas', coords: [6.0911, -75.6357] },
      { name: 'Copacabana', coords: [6.3469, -75.5106] },
      { name: 'Marinilla', coords: [6.1748, -75.3344] },
      { name: 'Guarne', coords: [6.2801, -75.4429] },
      { name: 'Apartadó', coords: [7.8829, -76.6258] },
      { name: 'Turbo', coords: [8.0926, -76.7262] },
      { name: 'Caucasia', coords: [7.9865, -75.1935] },
    ],
  },
  {
    id: 'cundinamarca',
    name: 'Cundinamarca',
    defaultCoords: [4.8617, -74.0325],
    zoom: 12,
    municipalities: [
      { name: 'Chía', coords: [4.8617, -74.0325] },
      { name: 'Soacha', coords: [4.5794, -74.2169] },
      { name: 'Zipaquirá', coords: [5.0264, -74.0041] },
      { name: 'Cajicá', coords: [4.9189, -74.0275] },
      { name: 'Facatativá', coords: [4.8142, -74.3547] },
      { name: 'Fusagasugá', coords: [4.3372, -74.3644] },
      { name: 'Mosquera', coords: [4.7059, -74.2302] },
      { name: 'Madrid', coords: [4.7327, -74.2642] },
      { name: 'Funza', coords: [4.7170, -74.2117] },
      { name: 'Cota', coords: [4.8117, -74.1017] },
      { name: 'Girardot', coords: [4.3015, -74.8039] },
      { name: 'Sopó', coords: [4.9083, -73.9397] },
      { name: 'Tocancipá', coords: [4.9667, -73.9167] },
      { name: 'La Calera', coords: [4.7208, -73.9706] },
    ],
  },
  {
    id: 'valle',
    name: 'Valle del Cauca',
    defaultCoords: [3.4516, -76.5320],
    zoom: 12,
    municipalities: [
      { name: 'Cali', coords: [3.4516, -76.5320] },
      { name: 'Palmira', coords: [3.5394, -76.3036] },
      { name: 'Buenaventura', coords: [3.8801, -77.0312] },
      { name: 'Tuluá', coords: [4.0847, -76.1954] },
      { name: 'Yumbo', coords: [3.5822, -76.4914] },
      { name: 'Cartago', coords: [4.7464, -75.9117] },
      { name: 'Buga (Guadalajara de Buga)', coords: [3.9009, -76.2978] },
      { name: 'Jamundí', coords: [3.2606, -76.5414] },
      { name: 'Candelaria', coords: [3.4061, -76.3497] },
    ],
  },
  {
    id: 'atlantico',
    name: 'Atlántico',
    defaultCoords: [10.9685, -74.7813],
    zoom: 12,
    municipalities: [
      { name: 'Barranquilla', coords: [10.9685, -74.7813] },
      { name: 'Soledad', coords: [10.9184, -74.7646] },
      { name: 'Malambo', coords: [10.8592, -74.7739] },
      { name: 'Puerto Colombia', coords: [11.0219, -74.9547] },
      { name: 'Sabanalarga', coords: [10.6331, -74.9208] },
      { name: 'Baranoa', coords: [10.7936, -74.9164] },
    ],
  },
  {
    id: 'santander',
    name: 'Santander',
    defaultCoords: [7.1193, -73.1227],
    zoom: 12,
    municipalities: [
      { name: 'Bucaramanga', coords: [7.1193, -73.1227] },
      { name: 'Floridablanca', coords: [7.0622, -73.0864] },
      { name: 'Girón', coords: [7.0682, -73.1698] },
      { name: 'Piedecuesta', coords: [6.9886, -73.0497] },
      { name: 'Barrancabermeja', coords: [7.0653, -73.8547] },
      { name: 'San Gil', coords: [6.5594, -73.1367] },
      { name: 'Socorro', coords: [6.4678, -73.2608] },
    ],
  },
  {
    id: 'bolivar',
    name: 'Bolívar',
    defaultCoords: [10.3910, -75.4794],
    zoom: 12,
    municipalities: [
      { name: 'Cartagena', coords: [10.3910, -75.4794] },
      { name: 'Turbaco', coords: [10.3292, -75.4128] },
      { name: 'Arjona', coords: [10.2583, -75.3444] },
      { name: 'Magangué', coords: [9.2422, -74.7547] },
      { name: 'El Carmen de Bolívar', coords: [9.7172, -75.1211] },
    ],
  },
  {
    id: 'risaralda',
    name: 'Risaralda',
    defaultCoords: [4.8133, -75.6961],
    zoom: 12,
    municipalities: [
      { name: 'Pereira', coords: [4.8133, -75.6961] },
      { name: 'Dosquebradas', coords: [4.8344, -75.6811] },
      { name: 'Santa Rosa de Cabal', coords: [4.8689, -75.6214] },
      { name: 'La Virginia', coords: [4.9003, -75.8825] },
    ],
  },
  {
    id: 'caldas',
    name: 'Caldas',
    defaultCoords: [5.0689, -75.5174],
    zoom: 12,
    municipalities: [
      { name: 'Manizales', coords: [5.0689, -75.5174] },
      { name: 'Villamaría', coords: [5.0456, -75.5147] },
      { name: 'Chinchiná', coords: [4.9814, -75.6042] },
      { name: 'La Dorada', coords: [5.4547, -74.6644] },
      { name: 'Riosucio', coords: [5.4214, -75.7036] },
    ],
  },
  {
    id: 'quindio',
    name: 'Quindío',
    defaultCoords: [4.5339, -75.6811],
    zoom: 12,
    municipalities: [
      { name: 'Armenia', coords: [4.5339, -75.6811] },
      { name: 'Calarcá', coords: [4.5297, -75.6419] },
      { name: 'Montenegro', coords: [4.5658, -75.7508] },
      { name: 'Quimbaya', coords: [4.6231, -75.7644] },
      { name: 'La Tebaida', coords: [4.4539, -75.7917] },
      { name: 'Salento', coords: [4.6375, -75.5703] },
    ],
  },
  {
    id: 'tolima',
    name: 'Tolima',
    defaultCoords: [4.4389, -75.2322],
    zoom: 12,
    municipalities: [
      { name: 'Ibagué', coords: [4.4389, -75.2322] },
      { name: 'Espinal', coords: [4.1492, -74.8842] },
      { name: 'Melgar', coords: [4.2047, -74.6408] },
      { name: 'Chaparral', coords: [3.7239, -75.4831] },
      { name: 'Mariquita', coords: [5.1989, -74.8964] },
    ],
  },
  {
    id: 'huila',
    name: 'Huila',
    defaultCoords: [2.9273, -75.2819],
    zoom: 12,
    municipalities: [
      { name: 'Neiva', coords: [2.9273, -75.2819] },
      { name: 'Pitalito', coords: [1.8542, -76.0508] },
      { name: 'Garzón', coords: [2.1958, -75.6278] },
      { name: 'La Plata', coords: [2.3878, -75.8925] },
    ],
  },
  {
    id: 'norte_santander',
    name: 'Norte de Santander',
    defaultCoords: [7.8939, -72.5078],
    zoom: 12,
    municipalities: [
      { name: 'Cúcuta', coords: [7.8939, -72.5078] },
      { name: 'Los Patios', coords: [7.8344, -72.5072] },
      { name: 'Villa del Rosario', coords: [7.8339, -72.4744] },
      { name: 'Ocaña', coords: [8.2389, -73.3547] },
      { name: 'Pamplona', coords: [7.3758, -72.6483] },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    defaultCoords: [4.1420, -73.6266],
    zoom: 12,
    municipalities: [
      { name: 'Villavicencio', coords: [4.1420, -73.6266] },
      { name: 'Acacías', coords: [3.9875, -73.7578] },
      { name: 'Granada', coords: [3.5461, -73.7067] },
      { name: 'Puerto López', coords: [4.0847, -72.9558] },
    ],
  },
  {
    id: 'magdalena',
    name: 'Magdalena',
    defaultCoords: [11.2408, -74.1990],
    zoom: 12,
    municipalities: [
      { name: 'Santa Marta', coords: [11.2408, -74.1990] },
      { name: 'Ciénaga', coords: [11.0069, -74.2497] },
      { name: 'Fundación', coords: [10.5208, -74.1844] },
      { name: 'Plato', coords: [9.7903, -74.7825] },
    ],
  },
  {
    id: 'cesar',
    name: 'Cesar',
    defaultCoords: [10.4631, -73.2532],
    zoom: 12,
    municipalities: [
      { name: 'Valledupar', coords: [10.4631, -73.2532] },
      { name: 'Aguachica', coords: [8.3083, -73.6167] },
      { name: 'Agustín Codazzi', coords: [10.0336, -73.2356] },
      { name: 'Bosconia', coords: [9.9753, -73.8839] },
    ],
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    defaultCoords: [8.7479, -75.8814],
    zoom: 12,
    municipalities: [
      { name: 'Montería', coords: [8.7479, -75.8814] },
      { name: 'Cereté', coords: [8.8847, -75.7908] },
      { name: 'Lorica', coords: [9.2392, -75.8139] },
      { name: 'Sahagún', coords: [8.9472, -75.4431] },
      { name: 'Montelíbano', coords: [7.9789, -75.4194] },
    ],
  },
  {
    id: 'boyaca',
    name: 'Boyacá',
    defaultCoords: [5.5353, -73.3678],
    zoom: 12,
    municipalities: [
      { name: 'Tunja', coords: [5.5353, -73.3678] },
      { name: 'Duitama', coords: [5.8267, -73.0336] },
      { name: 'Sogamoso', coords: [5.7144, -72.9339] },
      { name: 'Chiquinquirá', coords: [5.6178, -73.8164] },
      { name: 'Paipa', coords: [5.7806, -73.1172] },
      { name: 'Villa de Leyva', coords: [5.6331, -73.5275] },
    ],
  },
  {
    id: 'narino',
    name: 'Nariño',
    defaultCoords: [1.2136, -77.2811],
    zoom: 12,
    municipalities: [
      { name: 'Pasto', coords: [1.2136, -77.2811] },
      { name: 'Ipiales', coords: [0.8286, -77.6378] },
      { name: 'Tumaco', coords: [1.7986, -78.8156] },
      { name: 'Túquerres', coords: [1.0858, -77.6167] },
    ],
  },
  {
    id: 'cauca',
    name: 'Cauca',
    defaultCoords: [2.4448, -76.6147],
    zoom: 12,
    municipalities: [
      { name: 'Popayán', coords: [2.4448, -76.6147] },
      { name: 'Santander de Quilichao', coords: [3.0094, -76.4847] },
      { name: 'Puerto Tejada', coords: [3.2289, -76.4172] },
    ],
  },
  {
    id: 'sucre',
    name: 'Sucre',
    defaultCoords: [9.3047, -75.3978],
    zoom: 12,
    municipalities: [
      { name: 'Sincelejo', coords: [9.3047, -75.3978] },
      { name: 'Corozal', coords: [9.3172, -75.2939] },
      { name: 'Tolú', coords: [9.5256, -75.5819] },
      { name: 'San Marcos', coords: [8.6594, -75.1322] },
    ],
  },
  {
    id: 'la_guajira',
    name: 'La Guajira',
    defaultCoords: [11.5444, -72.9072],
    zoom: 12,
    municipalities: [
      { name: 'Riohacha', coords: [11.5444, -72.9072] },
      { name: 'Maicao', coords: [11.3806, -72.2417] },
      { name: 'Uribia', coords: [11.7139, -72.0156] },
      { name: 'Fonseca', coords: [10.8872, -72.8467] },
    ],
  },
  {
    id: 'casanare',
    name: 'Casanare',
    defaultCoords: [5.3378, -72.3958],
    zoom: 12,
    municipalities: [
      { name: 'Yopal', coords: [5.3378, -72.3958] },
      { name: 'Aguazul', coords: [5.1728, -72.5456] },
      { name: 'Villanueva', coords: [4.6075, -72.9272] },
    ],
  },
  {
    id: 'caqueta',
    name: 'Caquetá',
    defaultCoords: [1.6144, -75.6064],
    zoom: 12,
    municipalities: [
      { name: 'Florencia', coords: [1.6144, -75.6064] },
      { name: 'San Vicente del Caguán', coords: [2.1158, -74.7672] },
    ],
  },
  {
    id: 'putumayo',
    name: 'Putumayo',
    defaultCoords: [1.1478, -76.6467],
    zoom: 12,
    municipalities: [
      { name: 'Mocoa', coords: [1.1478, -76.6467] },
      { name: 'Puerto Asís', coords: [0.5133, -76.5008] },
    ],
  },
  {
    id: 'choco',
    name: 'Chocó',
    defaultCoords: [5.6919, -76.6583],
    zoom: 12,
    municipalities: [
      { name: 'Quibdó', coords: [5.6919, -76.6583] },
      { name: 'Istmina', coords: [5.1606, -76.6853] },
    ],
  },
  {
    id: 'arauca',
    name: 'Arauca',
    defaultCoords: [7.0847, -70.7592],
    zoom: 12,
    municipalities: [
      { name: 'Arauca', coords: [7.0847, -70.7592] },
      { name: 'Tame', coords: [6.4608, -71.7303] },
      { name: 'Saravena', coords: [6.9536, -71.8767] },
    ],
  },
  {
    id: 'san_andres',
    name: 'San Andrés y Providencia',
    defaultCoords: [12.5847, -81.7006],
    zoom: 13,
    municipalities: [
      { name: 'San Andrés', coords: [12.5847, -81.7006] },
      { name: 'Providencia', coords: [13.3561, -81.3719] },
    ],
  },
  {
    id: 'amazonas',
    name: 'Amazonas',
    defaultCoords: [-4.2153, -69.9406],
    zoom: 12,
    municipalities: [
      { name: 'Leticia', coords: [-4.2153, -69.9406] },
      { name: 'Puerto Nariño', coords: [-3.7708, -70.3831] },
    ],
  },
  {
    id: 'guaviare',
    name: 'Guaviare',
    defaultCoords: [2.5728, -72.6417],
    zoom: 12,
    municipalities: [
      { name: 'San José del Guaviare', coords: [2.5728, -72.6417] },
    ],
  },
  {
    id: 'guainia',
    name: 'Guainía',
    defaultCoords: [3.8653, -67.9239],
    zoom: 12,
    municipalities: [
      { name: 'Inírida', coords: [3.8653, -67.9239] },
    ],
  },
  {
    id: 'vaupes',
    name: 'Vaupés',
    defaultCoords: [1.2514, -70.2333],
    zoom: 12,
    municipalities: [
      { name: 'Mitú', coords: [1.2514, -70.2333] },
    ],
  },
  {
    id: 'vichada',
    name: 'Vichada',
    defaultCoords: [6.1894, -67.4858],
    zoom: 12,
    municipalities: [
      { name: 'Puerto Carreño', coords: [6.1894, -67.4858] },
    ],
  },
];

export function findDepartmentByName(name?: string): DepartmentData | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return COLOMBIA_DEPARTMENTS.find(
    (d) => d.name.toLowerCase() === clean || d.id === clean
  );
}

export function findMunicipality(deptName?: string, muniName?: string) {
  const dept = findDepartmentByName(deptName);
  if (!dept || !muniName) return undefined;
  const cleanMuni = muniName.trim().toLowerCase();
  return dept.municipalities.find((m) => m.name.toLowerCase() === cleanMuni);
}
