export interface Insumo {
  id: string;
  nombre: string;
  categoria: 'solido' | 'liquido' | 'empaque' | 'servicio';
  presentacionCompra: string;
  cantidadCompra: number; // en g, ml o unidades
  unidadCompra: 'g' | 'ml' | 'un';
  precioCompra: number; // en pesos argentinos
  unidadCosteo: 'g' | 'ml' | 'un';
  costoPorUnidad: number; // precio / cantidadCompra
  notas?: string;
}

export interface IngredienteReceta {
  insumoId: string;
  nombre: string;
  seccion: string; // ej. "Bizcocho Matilda", "Relleno Fudge", "Empaque"
  cantidad: number;
  unidad: 'g' | 'ml' | 'un';
}

export interface RecetaProducto {
  id: string;
  productoId: string;
  nombre: string;
  rendimiento: string; // ej. "1 torta (molde 20 cm - 14 porciones)"
  pesoAproximadoGramos: number;
  ingredientes: IngredienteReceta[];
  costosAdicionales: {
    concepto: string;
    monto: number;
  }[];
  margenSugeridoPorcentaje: number;
  instrucciones: {
    paso: number;
    titulo: string;
    descripcion: string;
  }[];
}

// ----------------------------------------------------
// HOJA 2: TABLA MAESTRA DE INSUMOS (Por Gramos y Mililitros)
// ----------------------------------------------------
export const INSUMOS_DEFAULT: Insumo[] = [
  // --- SÓLIDOS (Costos por Gramo) ---
  {
    id: 'harina-0000',
    nombre: 'Harina 0000 de Repostería',
    categoria: 'solido',
    presentacionCompra: 'Paquete 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 1200,
    unidadCosteo: 'g',
    costoPorUnidad: 1.2,
    notas: 'Harina de trigo pura para bizcochuelos aireados',
  },
  {
    id: 'azucar-comun',
    nombre: 'Azúcar Común Tipo A',
    categoria: 'solido',
    presentacionCompra: 'Paquete 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 1100,
    unidadCosteo: 'g',
    costoPorUnidad: 1.1,
  },
  {
    id: 'azucar-impalpable',
    nombre: 'Azúcar Impalpable (Glas)',
    categoria: 'solido',
    presentacionCompra: 'Paquete 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 2500,
    unidadCosteo: 'g',
    costoPorUnidad: 2.5,
    notas: 'Para glaseados, fudge sedoso y macarons',
  },
  {
    id: 'cacao-amargo',
    nombre: 'Cacao Amargo Alcalino 100% Puro',
    categoria: 'solido',
    presentacionCompra: 'Paquete 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 18000,
    unidadCosteo: 'g',
    costoPorUnidad: 18.0,
    notas: 'Sabor intenso característico de la Matilda',
  },
  {
    id: 'chocolate-semiamargo',
    nombre: 'Chocolate Cobertura Semiamargo 70%',
    categoria: 'solido',
    presentacionCompra: 'Tableta 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 22000,
    unidadCosteo: 'g',
    costoPorUnidad: 22.0,
    notas: 'Puro chocolate con manteca de cacao para ganache',
  },
  {
    id: 'manteca-primera',
    nombre: 'Manteca Sin Sal Extra Calidad',
    categoria: 'solido',
    presentacionCompra: 'Pan 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 11500,
    unidadCosteo: 'g',
    costoPorUnidad: 11.5,
    notas: '82% tenor graso para textura húmeda',
  },
  {
    id: 'dulce-de-leche',
    nombre: 'Dulce de Leche Repostero Premium',
    categoria: 'solido',
    presentacionCompra: 'Pote 1.000 g (1 kg)',
    cantidadCompra: 1000,
    unidadCompra: 'g',
    precioCompra: 6500,
    unidadCosteo: 'g',
    costoPorUnidad: 6.5,
  },
  {
    id: 'polvo-hornear',
    nombre: 'Polvo para Hornear Leudante',
    categoria: 'solido',
    presentacionCompra: 'Bote 250 g',
    cantidadCompra: 250,
    unidadCompra: 'g',
    precioCompra: 2200,
    unidadCosteo: 'g',
    costoPorUnidad: 8.8,
  },
  {
    id: 'bicarbonato',
    nombre: 'Bicarbonato de Sodio Alimentario',
    categoria: 'solido',
    presentacionCompra: 'Paquete 250 g',
    cantidadCompra: 250,
    unidadCompra: 'g',
    precioCompra: 1200,
    unidadCosteo: 'g',
    costoPorUnidad: 4.8,
    notas: 'Reacciona con el cacao y el café para color oscuro',
  },
  {
    id: 'sal-fina',
    nombre: 'Sal Fina Pura',
    categoria: 'solido',
    presentacionCompra: 'Paquete 500 g',
    cantidadCompra: 500,
    unidadCompra: 'g',
    precioCompra: 450,
    unidadCosteo: 'g',
    costoPorUnidad: 0.9,
    notas: 'Realzador de sabor para chocolates',
  },
  {
    id: 'huevos-frescos',
    nombre: 'Huevos de Granja Seleccionados (Grandes)',
    categoria: 'solido',
    presentacionCompra: 'Maple 30 Unidades',
    cantidadCompra: 30,
    unidadCompra: 'un',
    precioCompra: 7500,
    unidadCosteo: 'un',
    costoPorUnidad: 250.0,
  },

  // --- LÍQUIDOS (Costos por Mililitro) ---
  {
    id: 'leche-entera',
    nombre: 'Leche Entera Homogeneizada',
    categoria: 'liquido',
    presentacionCompra: 'Botella 1.000 ml (1 L)',
    cantidadCompra: 1000,
    unidadCompra: 'ml',
    precioCompra: 1400,
    unidadCosteo: 'ml',
    costoPorUnidad: 1.4,
  },
  {
    id: 'crema-de-leche',
    nombre: 'Crema de Leche Repostera (39% Grasa)',
    categoria: 'liquido',
    presentacionCompra: 'Pote 1.000 ml (1 L)',
    cantidadCompra: 1000,
    unidadCompra: 'ml',
    precioCompra: 7200,
    unidadCosteo: 'ml',
    costoPorUnidad: 7.2,
    notas: 'Para ganache brillante y untuosa',
  },
  {
    id: 'aceite-girasol',
    nombre: 'Aceite de Girasol Neutro',
    categoria: 'liquido',
    presentacionCompra: 'Botella 1.000 ml (1 L)',
    cantidadCompra: 1000,
    unidadCompra: 'ml',
    precioCompra: 2400,
    unidadCosteo: 'ml',
    costoPorUnidad: 2.4,
    notas: 'Garantiza que el bizcocho quede ultra húmedo en frío',
  },
  {
    id: 'esencia-vainilla',
    nombre: 'Extracto / Esencia Pura de Vainilla',
    categoria: 'liquido',
    presentacionCompra: 'Frasco 100 ml',
    cantidadCompra: 100,
    unidadCompra: 'ml',
    precioCompra: 3200,
    unidadCosteo: 'ml',
    costoPorUnidad: 32.0,
  },
  {
    id: 'cafe-expreso',
    nombre: 'Café Expreso Caliente / Filtro Intenso',
    categoria: 'liquido',
    presentacionCompra: 'Preparación 500 ml',
    cantidadCompra: 500,
    unidadCompra: 'ml',
    precioCompra: 1500,
    unidadCosteo: 'ml',
    costoPorUnidad: 3.0,
    notas: 'No da sabor a café; florece y potencia el cacao',
  },
  {
    id: 'agua-filtrada',
    nombre: 'Agua Purificada / Mineral',
    categoria: 'liquido',
    presentacionCompra: 'Botellón 5.000 ml (5 L)',
    cantidadCompra: 5000,
    unidadCompra: 'ml',
    precioCompra: 1500,
    unidadCosteo: 'ml',
    costoPorUnidad: 0.3,
  },

  // --- EMPAQUE & PRESENTACIÓN ---
  {
    id: 'caja-torta-alta',
    nombre: 'Caja Alta para Torta 25x25x15 cm con Visor',
    categoria: 'empaque',
    presentacionCompra: 'Paquete x 10 unidades',
    cantidadCompra: 10,
    unidadCompra: 'un',
    precioCompra: 18500,
    unidadCosteo: 'un',
    costoPorUnidad: 1850.0,
  },
  {
    id: 'disco-dorado',
    nombre: 'Disco Base Rígido Laminado Dorado 24 cm',
    categoria: 'empaque',
    presentacionCompra: 'Pack x 10 unidades',
    cantidadCompra: 10,
    unidadCompra: 'un',
    precioCompra: 9800,
    unidadCosteo: 'un',
    costoPorUnidad: 980.0,
  },
  {
    id: 'cinta-crise',
    nombre: 'Cinta Raso de Marca CRISÉ + Sticker Cierre',
    categoria: 'empaque',
    presentacionCompra: 'Rollo para 50 tortas',
    cantidadCompra: 50,
    unidadCompra: 'un',
    precioCompra: 22500,
    unidadCosteo: 'un',
    costoPorUnidad: 450.0,
  },

  // --- SERVICIOS / COSTE INDIRECTO ---
  {
    id: 'energia-horno',
    nombre: 'Consumo Energía / Gas por Horneada (45-50 min)',
    categoria: 'servicio',
    presentacionCompra: 'Por ciclo de horneado',
    cantidadCompra: 1,
    unidadCompra: 'un',
    precioCompra: 900,
    unidadCosteo: 'un',
    costoPorUnidad: 900.0,
  },
];

// ----------------------------------------------------
// HOJA 3: RECETAS TÉCNICAS CON CANTIDADES EXACTAS
// ----------------------------------------------------
export const RECETAS_DEFAULT: RecetaProducto[] = [
  {
    id: 'receta-torta-matilda',
    productoId: '3',
    nombre: 'Torta Matilda Chocolate Intenso CRISÉ',
    rendimiento: '1 Torta Redonda (Molde 20 cm - 3 Pisos - 14 Porciones)',
    pesoAproximadoGramos: 2400,
    margenSugeridoPorcentaje: 70, // 70% de ganancia neta sugerida
    ingredientes: [
      // 1. Bizcocho Matilda (Húmedo & Esponjoso)
      {
        insumoId: 'harina-0000',
        nombre: 'Harina 0000 de Repostería',
        seccion: 'Bizcocho Húmedo',
        cantidad: 280,
        unidad: 'g',
      },
      {
        insumoId: 'azucar-comun',
        nombre: 'Azúcar Común Tipo A',
        seccion: 'Bizcocho Húmedo',
        cantidad: 350,
        unidad: 'g',
      },
      {
        insumoId: 'cacao-amargo',
        nombre: 'Cacao Amargo Alcalino 100%',
        seccion: 'Bizcocho Húmedo',
        cantidad: 85,
        unidad: 'g',
      },
      {
        insumoId: 'polvo-hornear',
        nombre: 'Polvo para Hornear',
        seccion: 'Bizcocho Húmedo',
        cantidad: 10,
        unidad: 'g',
      },
      {
        insumoId: 'bicarbonato',
        nombre: 'Bicarbonato de Sodio',
        seccion: 'Bizcocho Húmedo',
        cantidad: 7,
        unidad: 'g',
      },
      {
        insumoId: 'sal-fina',
        nombre: 'Sal Fina',
        seccion: 'Bizcocho Húmedo',
        cantidad: 3,
        unidad: 'g',
      },
      {
        insumoId: 'huevos-frescos',
        nombre: 'Huevos de Granja',
        seccion: 'Bizcocho Húmedo',
        cantidad: 3,
        unidad: 'un',
      },
      {
        insumoId: 'leche-entera',
        nombre: 'Leche Entera',
        seccion: 'Bizcocho Húmedo',
        cantidad: 240,
        unidad: 'ml',
      },
      {
        insumoId: 'cafe-expreso',
        nombre: 'Café Expreso Caliente',
        seccion: 'Bizcocho Húmedo',
        cantidad: 240,
        unidad: 'ml',
      },
      {
        insumoId: 'aceite-girasol',
        nombre: 'Aceite de Girasol Neutro',
        seccion: 'Bizcocho Húmedo',
        cantidad: 120,
        unidad: 'ml',
      },
      {
        insumoId: 'esencia-vainilla',
        nombre: 'Esencia Pura de Vainilla',
        seccion: 'Bizcocho Húmedo',
        cantidad: 15,
        unidad: 'ml',
      },

      // 2. Relleno y Cobertura Fudge Matilda
      {
        insumoId: 'chocolate-semiamargo',
        nombre: 'Chocolate Cobertura Semiamargo 70%',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 400,
        unidad: 'g',
      },
      {
        insumoId: 'manteca-primera',
        nombre: 'Manteca Sin Sal Extra Calidad',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 250,
        unidad: 'g',
      },
      {
        insumoId: 'cacao-amargo',
        nombre: 'Cacao Amargo Alcalino 100%',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 50,
        unidad: 'g',
      },
      {
        insumoId: 'azucar-impalpable',
        nombre: 'Azúcar Impalpable (Glas)',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 200,
        unidad: 'g',
      },
      {
        insumoId: 'crema-de-leche',
        nombre: 'Crema de Leche Repostera',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 200,
        unidad: 'ml',
      },
      {
        insumoId: 'esencia-vainilla',
        nombre: 'Esencia de Vainilla',
        seccion: 'Relleno y Cobertura Fudge',
        cantidad: 10,
        unidad: 'ml',
      },

      // 3. Packaging y Presentación
      {
        insumoId: 'caja-torta-alta',
        nombre: 'Caja Alta con Visor 25x25 cm',
        seccion: 'Empaque y Presentación',
        cantidad: 1,
        unidad: 'un',
      },
      {
        insumoId: 'disco-dorado',
        nombre: 'Disco Base Rígido Dorado',
        seccion: 'Empaque y Presentación',
        cantidad: 1,
        unidad: 'un',
      },
      {
        insumoId: 'cinta-crise',
        nombre: 'Cinta Raso CRISÉ + Sello',
        seccion: 'Empaque y Presentación',
        cantidad: 1,
        unidad: 'un',
      },
      {
        insumoId: 'energia-horno',
        nombre: 'Consumo Energía / Horneado',
        seccion: 'Servicios',
        cantidad: 1,
        unidad: 'un',
      },
    ],
    costosAdicionales: [
      { concepto: 'Mano de Obra Artesanal (Tiempo de Decoración)', monto: 2500 },
    ],
    instrucciones: [
      {
        paso: 1,
        titulo: 'Tamizado de Secos',
        descripcion:
          'En un bowl amplio tamizar la harina 0000, el cacao amargo alcalino, el azúcar, el bicarbonato, el polvo de hornear y la sal. Mezclar con batidor de alambre para integrar.',
      },
      {
        paso: 2,
        titulo: 'Emulsión de Líquidos',
        descripcion:
          'En otro recipiente colocar los huevos, la leche, el aceite neutro y la esencia de vainilla. Batir ligeramente hasta homogeneizar sin incorporar exceso de aire.',
      },
      {
        paso: 3,
        titulo: 'Integración y Floración con Café',
        descripcion:
          'Unir los ingredientes líquidos a los secos batiendo a velocidad media durante 2 minutos. Finalmente, incorporar el café recién colado y caliente en forma de hilo continuo. La masa quedará líquida y brillante (esto garantiza la máxima humedad).',
      },
      {
        paso: 4,
        titulo: 'Horneado Perfecto',
        descripcion:
          'Dividir la masa equitativamente en 3 moldes de 20 cm engrasados y con papel manteca en la base. Hornear a 170°C (horno precalentado) durante 30 a 35 minutos. Dejar enfriar 15 minutos y desmoldar sobre rejilla.',
      },
      {
        paso: 5,
        titulo: 'Fudge Sedoso Matilda',
        descripcion:
          'Derretir el chocolate cobertura a baño María junto con la manteca. Incorporar la crema de leche tibia, el cacao tamizado y el azúcar impalpable tamizada. Batir hasta obtener una textura espesa, sedosa y untable.',
      },
      {
        paso: 6,
        titulo: 'Montaje y Decorado',
        descripcion:
          'Fijar la primera capa sobre el disco rígido dorado con un poco de fudge. Rellenar con capas generosas de fudge chocolate. Cubrir la torta completamente con espátula creando las ondas artesanales rústicas características de CRISÉ.',
      },
    ],
  },
];
