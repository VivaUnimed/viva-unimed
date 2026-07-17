import { formatCpf, formatPhone } from './patientFormatters';

const formatDateInputValue = (value) => {
  if (!value) {
    return '';
  }

  const normalizedValue = String(value).trim();
  const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getPatientFormInitialValues = (patient = null) => ({
  name: patient?.name ?? '',
  cpf: patient?.cpf ? formatCpf(String(patient.cpf)) : '',
  phone: patient?.phone ? formatPhone(String(patient.phone)) : '',
  email: patient?.email ?? '',
  birth: formatDateInputValue(patient?.birth),
});
