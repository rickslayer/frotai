import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

let fleetData: Vehicle[] | null = null;

export function getFleetData(): Vehicle[] {
  // Se já tivermos os dados em memória, retornamos para evitar releituras.
  if (fleetData) {
    return fleetData;
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');
  let allVehicles: Vehicle[] = [];

  try {
    // Encontra todos os arquivos .json na pasta, exceto o de exemplo.
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json') && file !== 'sample-data.json');
    
    if (files.length === 0) {
      console.warn("Nenhum arquivo de dados .json encontrado em src/data. O dashboard estará vazio.");
      fleetData = []; // Define como array vazio se nenhum arquivo for encontrado.
      return fleetData;
    }
    
    console.log(`Encontrados ${files.length} arquivos de dados em src/data. Lendo...`);

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Usa o PapaParse para ler o conteúdo (que é texto separado por ';')
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';',
      });

      // Mapeia cada linha para o formato Vehicle
      const vehicles = parsed.data.map((row: any, index: number) => ({
          id: `${file}-${index}`,
          manufacturer: row.montadora || row.manufacturer || 'N/A',
          model: row.modelo || row.model || 'N/A',
          version: row.versao || row.version || 'N/A',
          category: row.categoria || row.category || 'N/A',
          state: row.uf || row.state || 'N/A',
          city: row.cidade || row.city || 'N/A',
          quantity: parseInt(row.quantidade || row.quantity, 10) || 0,
          year: parseInt(row.ano_fabricacao || row.year, 10) || 0,
      })) as Vehicle[];
      
      // Adiciona os veículos válidos ao array principal
      allVehicles = allVehicles.concat(vehicles.filter(v => v.manufacturer && v.model && v.year));
    });

    if (allVehicles.length === 0) {
       console.warn("Os arquivos de dados foram encontrados, mas nenhum registro válido foi lido.");
    } else {
      console.log(`Sucesso! ${allVehicles.length} registros lidos de todos os arquivos.`);
    }
    
    fleetData = allVehicles;
    
  } catch (error) {
    console.error(`Erro ao ler ou processar os arquivos de dados. O dashboard estará vazio. Erro: ${(error as Error).message}`);
    fleetData = []; // Retorna um array vazio em caso de erro.
  }

  return fleetData;
}
