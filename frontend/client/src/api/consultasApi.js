import { getRequest } from './api';

const normalizeConsulta = (consulta = {}) => ({
  id: consulta.id ?? consulta._id ?? '',
  especialidade: consulta.especialidade ?? consulta.specialty ?? '',
  status: consulta.status ?? consulta.situacao ?? '',
  statusVariant: consulta.statusVariant ?? consulta.status_variant ?? 'gray',
  medico: consulta.medico ?? consulta.doctor ?? consulta.nome_medico ?? '',
  dataResumo: consulta.dataResumo ?? consulta.data_resumo ?? consulta.data ?? '',
  local: consulta.local ?? consulta.unidade ?? consulta.location ?? '',
});

// GET /consultas
// Response esperada:
// [
//   {
//     "id": 1,
//     "especialidade": "",
//     "status": "",
//     "statusVariant": "",
//     "medico": "",
//     "dataResumo": "",
//     "local": ""
//   }
// ]
export const getMinhasConsultas = async () => {
  try {
    const data = await getRequest('/consultas');

    if (Array.isArray(data)) {
      return data.map(normalizeConsulta);
    }

    if (data && Array.isArray(data.consultas)) {
      return data.consultas.map(normalizeConsulta);
    }

    return [];
  } catch (error) {
    throw new Error(error.message);
  }
};
