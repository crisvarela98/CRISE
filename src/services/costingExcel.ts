import * as XLSX from 'xlsx';
import { Insumo, RecetaProducto, INSUMOS_DEFAULT, RECETAS_DEFAULT } from '../data/costingData';

export function generateCostingWorkbook(
  insumos: Insumo[] = INSUMOS_DEFAULT,
  recetas: RecetaProducto[] = RECETAS_DEFAULT,
  margenPersonalizado: number = 70
) {
  const wb = XLSX.utils.book_new();

  // -----------------------------------------------------------
  // HOJA 1: PRODUCTOS, ESCANDALLO DE COSTOS Y GANANCIA
  // -----------------------------------------------------------
  const insumosMap = new Map<string, Insumo>();
  insumos.forEach((i) => insumosMap.set(i.id, i));

  const recetaMatilda = recetas[0] || RECETAS_DEFAULT[0];
  const margen = margenPersonalizado || recetaMatilda.margenSugeridoPorcentaje;

  // Calculate detailed items for Matilda
  const rowsSheet1: (string | number)[][] = [
    ['CRISE PATISSERIE - HOJA 1: ESCANDALLO DE COSTOS Y CALCULO DE GANANCIA'],
    ['Producto:', recetaMatilda.nombre],
    ['Rendimiento:', recetaMatilda.rendimiento],
    ['Fecha de Actualización:', new Date().toLocaleDateString('es-AR')],
    [],
    [
      'Sección',
      'Insumo / Material Requerido',
      'Cantidad Necesaria',
      'Unidad',
      'Costo Unitario ($)',
      'Subtotal Costo Materia Prima ($)',
      'Origen Costo (Hoja 2)',
    ],
  ];

  let totalMateriaPrima = 0;
  let totalEmpaqueServicios = 0;

  recetaMatilda.ingredientes.forEach((ing) => {
    const insumo = insumosMap.get(ing.insumoId);
    const costoUnit = insumo ? insumo.costoPorUnidad : 0;
    const subtotal = ing.cantidad * costoUnit;

    if (insumo?.categoria === 'empaque' || insumo?.categoria === 'servicio') {
      totalEmpaqueServicios += subtotal;
    } else {
      totalMateriaPrima += subtotal;
    }

    rowsSheet1.push([
      ing.seccion,
      ing.nombre,
      ing.cantidad,
      ing.unidad,
      Number(costoUnit.toFixed(2)),
      Number(subtotal.toFixed(2)),
      `Hoja 2 (Insumos ${insumo?.categoria === 'solido' ? 'g' : insumo?.categoria === 'liquido' ? 'ml' : 'un'})`,
    ]);
  });

  const totalCostosAdicionales = recetaMatilda.costosAdicionales.reduce(
    (acc, curr) => acc + curr.monto,
    0
  );
  const costoTotalElaboracion = totalMateriaPrima + totalEmpaqueServicios + totalCostosAdicionales;
  const precioSugerido = costoTotalElaboracion * (1 + margen / 100);
  const gananciaNeta = precioSugerido - costoTotalElaboracion;

  rowsSheet1.push([]);
  rowsSheet1.push(['--- RESUMEN FINANCIERO Y RENTABILIDAD ---', '', '', '', '', '']);
  rowsSheet1.push(['1. Subtotal Materia Prima (Harina, Manteca, Chocolates, Leche, etc.):', '', '', '', '', Number(totalMateriaPrima.toFixed(2))]);
  rowsSheet1.push(['2. Subtotal Empaque & Servicios (Caja, Disco rígido, Cinta, Gas):', '', '', '', '', Number(totalEmpaqueServicios.toFixed(2))]);
  rowsSheet1.push(['3. Mano de Obra Artesanal Estimada:', '', '', '', '', Number(totalCostosAdicionales.toFixed(2))]);
  rowsSheet1.push(['COSTO TOTAL DE FABRICACION (1 + 2 + 3):', '', '', '', '', Number(costoTotalElaboracion.toFixed(2))]);
  rowsSheet1.push(['Margen de Ganancia Configurado (%):', '', '', '', '', `${margen}%`]);
  rowsSheet1.push(['PRECIO SUGERIDO DE VENTA AL CLIENTE ($):', '', '', '', '', Number(precioSugerido.toFixed(2))]);
  rowsSheet1.push(['GANANCIA NETA POR TORTA ($):', '', '', '', '', Number(gananciaNeta.toFixed(2))]);

  const ws1 = XLSX.utils.aoa_to_sheet(rowsSheet1);
  ws1['!cols'] = [
    { wch: 25 },
    { wch: 38 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 32 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '1-Costos_y_Ganancia');

  // -----------------------------------------------------------
  // HOJA 2: TABLA DE COSTOS DE INSUMOS (Por Gramos y Mililitros)
  // -----------------------------------------------------------
  const rowsSheet2: (string | number)[][] = [
    ['CRISE PATISSERIE - HOJA 2: TABLA DE INSUMOS Y COSTO POR GRAMO / MILILITRO'],
    ['Referencia:', 'Esta tabla alimenta automáticamente los costos de cada receta'],
    [],
    [
      'ID Insumo',
      'Nombre del Insumo',
      'Categoría',
      'Presentación de Compra',
      'Cantidad Compra',
      'Unidad de Compra',
      'Precio de Compra ($)',
      'Unidad de Costeo (Receta)',
      'Costo Exacto Unitario ($/g o $/ml)',
      'Fórmula Aplicada',
      'Notas de Calidad',
    ],
  ];

  insumos.forEach((ins) => {
    rowsSheet2.push([
      ins.id,
      ins.nombre,
      ins.categoria === 'solido'
        ? 'SÓLIDO (Costo x Gramo)'
        : ins.categoria === 'liquido'
        ? 'LÍQUIDO (Costo x Mililitro)'
        : ins.categoria === 'empaque'
        ? 'EMPAQUE (Costo x Unidad)'
        : 'SERVICIO / GASTO',
      ins.presentacionCompra,
      ins.cantidadCompra,
      ins.unidadCompra,
      ins.precioCompra,
      ins.unidadCosteo,
      Number(ins.costoPorUnidad.toFixed(3)),
      `=Precio_Compra / Cantidad_Compra`,
      ins.notas || '',
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(rowsSheet2);
  ws2['!cols'] = [
    { wch: 20 },
    { wch: 36 },
    { wch: 26 },
    { wch: 26 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 },
    { wch: 30 },
    { wch: 30 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '2-Insumos_g_y_ml');

  // -----------------------------------------------------------
  // HOJA 3: RECETA CON CANTIDADES EXACTAS E INSTRUCCIONES
  // -----------------------------------------------------------
  const rowsSheet3: (string | number)[][] = [
    ['CRISE PATISSERIE - HOJA 3: FICHA TÉCNICA Y RECETA CON CANTIDADES EXACTAS'],
    ['Receta Oficial:', recetaMatilda.nombre],
    ['Rendimiento Estándar:', recetaMatilda.rendimiento],
    ['Peso Total Elaborado:', `${recetaMatilda.pesoAproximadoGramos} g aprox.`],
    [],
    ['DESGLOSE DE INGREDIENTES Y CANTIDADES:'],
    ['Sección de la Receta', 'Ingrediente Exacto', 'Cantidad en Gramos / Mililitros', 'Unidad de Medida'],
  ];

  recetaMatilda.ingredientes.forEach((ing) => {
    rowsSheet3.push([ing.seccion, ing.nombre, ing.cantidad, ing.unidad]);
  });

  rowsSheet3.push([]);
  rowsSheet3.push(['PROCEDIMIENTO PASO A PASO PARA LA PASTELERÍA:']);
  rowsSheet3.push(['Paso N°', 'Fase de Elaboración', 'Detalle de Ejecución Artesanal']);

  recetaMatilda.instrucciones.forEach((inst) => {
    rowsSheet3.push([`Paso ${inst.paso}`, inst.titulo, inst.descripcion]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(rowsSheet3);
  ws3['!cols'] = [{ wch: 26 }, { wch: 38 }, { wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, '3-Receta_Cantidades');

  return wb;
}

export function downloadCostingExcel(
  insumos: Insumo[] = INSUMOS_DEFAULT,
  recetas: RecetaProducto[] = RECETAS_DEFAULT,
  margen: number = 70
) {
  const wb = generateCostingWorkbook(insumos, recetas, margen);
  const filename = `CRISE_Patisserie_Costos_Insumos_Receta_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
