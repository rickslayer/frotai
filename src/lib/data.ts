import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';

// Helper to split model name into base and version
const splitModelAndVersion = (modelName: string): { model: string, version: string } => {
  const parts = modelName.split(' ');
  if (parts.length > 1) {
    const model = parts[0];
    const version = parts.slice(1).join(' ');
    // Handle cases like "HB20" vs "HB20S"
    if (parts.length > 1 && parts[0].toUpperCase() === 'HB20' && (parts[1].toUpperCase().startsWith('S') || parts[1].toUpperCase().startsWith('X'))) {
        return { model: `${parts[0]} ${parts[1]}`, version: parts.slice(2).join(' ') };
    }
    return { model, version };
  }
  return { model: modelName, version: '' };
};


export function getFleetData(): Vehicle[] {
  // Caminho para o arquivo rj.json na raiz do projeto.
  const filePath = path.join(process.cwd(), 'rj.json');
  let allVehicles: Vehicle[] = [];

  try {
    if (!fs.existsSync(filePath)) {
      console.warn("Arquivo 'rj.json' não encontrado na raiz do projeto. O dashboard estará vazio.");
      return [];
    }

    console.log("Arquivo 'rj.json' encontrado na raiz. Lendo como JSON...");
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    if (!Array.isArray(jsonData)) {
        console.warn("O arquivo 'rj.json' não contém um array de objetos JSON válido.");
        return [];
    }

    // Mapeia cada objeto JSON para o formato Vehicle
    const vehicles = jsonData.map((row: any, index: number) => {
        const originalModelName = row.Modelo || 'N/A';
        const { model, version } = splitModelAndVersion(originalModelName);
        
        return {
            id: row.ID || `vehicle-${index}`,
            manufacturer: row.Marca || 'N/A',
            model: model,
            version: version,
            fullName: originalModelName,
            state: row.UF || 'N/A',
            city: row.Município || 'N/A',
            quantity: parseInt(row.Quantidade, 10) || 0,
            year: parseInt(row.Ano, 10) || 0,
        };
    }) as Vehicle[];
    
    allVehicles = vehicles.filter(v => v.manufacturer && v.model && v.year);
    
    if (allVehicles.length === 0) {
       console.warn("O arquivo 'rj.json' foi lido, mas nenhum registro válido foi processado.");
    } else {
      console.log(`Sucesso! ${allVehicles.length} registros lidos de 'rj.json'.`);
    }
    
  } catch (error) {
    console.error(`Erro ao ler ou processar o arquivo 'rj.json'. Verifique se é um JSON válido. Erro: ${(error as Error).message}`);
    return []; // Retorna um array vazio em caso de erro.
  }

  return allVehicles;
}
