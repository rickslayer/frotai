import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';

let fleetData: Vehicle[] | null = null;

export function getFleetData(): Vehicle[] {
  if (fleetData) {
    return fleetData;
  }

  // Caminho para o arquivo rj.json na raiz do projeto.
  const filePath = path.join(process.cwd(), 'rj.json');
  let allVehicles: Vehicle[] = [];

  try {
    if (!fs.existsSync(filePath)) {
      console.warn("Arquivo 'rj.json' não encontrado na raiz do projeto. O dashboard estará vazio.");
      fleetData = [];
      return fleetData;
    }

    console.log("Arquivo 'rj.json' encontrado na raiz. Lendo como JSON...");
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    if (!Array.isArray(jsonData)) {
        console.warn("O arquivo 'rj.json' não contém um array de objetos JSON válido.");
        fleetData = [];
        return fleetData;
    }

    // Mapeia cada objeto JSON para o formato Vehicle
    const vehicles = jsonData.map((row: any, index: number) => ({
        id: row.ID || `vehicle-${index}`,
        manufacturer: row.Marca || 'N/A',
        model: row.Modelo || 'N/A',
        state: row.UF || 'N/A',
        city: row.Município || 'N/A',
        quantity: parseInt(row.Quantidade, 10) || 0,
        year: parseInt(row.Ano, 10) || 0,
    })) as Vehicle[];
    
    allVehicles = vehicles.filter(v => v.manufacturer && v.model && v.year);
    
    if (allVehicles.length === 0) {
       console.warn("O arquivo 'rj.json' foi lido, mas nenhum registro válido foi processado.");
    } else {
      console.log(`Sucesso! ${allVehicles.length} registros lidos de 'rj.json'.`);
    }
    
    fleetData = allVehicles;
    
  } catch (error) {
    console.error(`Erro ao ler ou processar o arquivo 'rj.json'. Verifique se é um JSON válido. Erro: ${(error as Error).message}`);
    fleetData = []; // Retorna um array vazio em caso de erro.
  }

  return fleetData;
}
