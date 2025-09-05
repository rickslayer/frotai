import Papa from 'papaparse';
import type { Vehicle } from '@/types';

/**
 * Parses raw CSV string data into an array of Vehicle objects.
 * This function is designed to handle large datasets by processing the data as a stream.
 *
 * @param csvData The raw CSV string data.
 * @returns An array of Vehicle objects.
 */
export function parseVehicleData(csvData: string): Vehicle[] {
  const vehicles: Vehicle[] = [];
  let idCounter = 1;

  // Assuming the CSV headers are: ano_fabricacao,montadora,modelo,versao,categoria,uf,cidade,quantidade
  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
    step: (results) => {
      const row = results.data as any;
      
      const year = parseInt(row.ano_fabricacao, 10);
      const quantity = parseInt(row.quantidade, 10);

      // Basic validation to skip malformed rows
      if (
        !isNaN(year) &&
        !isNaN(quantity) &&
        row.montadora &&
        row.modelo &&
        row.cidade
      ) {
        vehicles.push({
          id: (idCounter++).toString(),
          year,
          manufacturer: row.montadora,
          model: row.modelo,
          version: row.versao || 'N/A',
          category: row.categoria || 'N/A',
          state: row.uf || 'N/A',
          city: row.cidade,
          quantity,
        });
      } else {
         // console.warn('Skipping malformed row:', row);
      }
    },
    complete: () => {
      console.log('CSV parsing completed.');
    },
    error: (error: Error) => {
      console.error('Error during CSV parsing:', error.message);
    },
  });

  return vehicles;
}
