import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

let fleetData: Vehicle[] | null = null;

export function getFleetData(): Vehicle[] {
  if (fleetData) {
    return fleetData;
  }

  // Procura o arquivo rj.json na raiz do projeto.
  const filePath = path.join(process.cwd(), 'rj.json');
  let allVehicles: Vehicle[] = [];

  try {
    // Verifica se o arquivo existe antes de tentar ler.
    if (!fs.existsSync(filePath)) {
      console.warn("Arquivo 'rj.json' não encontrado na raiz do projeto. O dashboard estará vazio.");
      fleetData = [];
      return fleetData;
    }

    console.log("Arquivo 'rj.json' encontrado na raiz. Lendo...");
    
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Usa o PapaParse para ler o conteúdo (que é texto separado por ';')
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
    });

    if (parsed.errors.length > 0) {
      console.warn(`Erros encontrados ao analisar o arquivo 'rj.json':`, parsed.errors);
    }

    // Mapeia cada linha para o formato Vehicle
    const vehicles = parsed.data.map((row: any, index: number) => ({
        id: `rj-${index}`,
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
    
    if (allVehicles.length === 0) {
       console.warn("O arquivo 'rj.json' foi encontrado, mas nenhum registro válido foi lido.");
    } else {
      console.log(`Sucesso! ${allVehicles.length} registros lidos de 'rj.json'.`);
    }
    
    fleetData = allVehicles;
    
  } catch (error) {
    console.error(`Erro ao ler ou processar o arquivo 'rj.json'. Erro: ${(error as Error).message}`);
    fleetData = []; // Retorna um array vazio em caso de erro.
  }

  return fleetData;
}