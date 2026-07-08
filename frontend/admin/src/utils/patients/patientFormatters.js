export const formatCpf = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length !== 11) {
    return value.trim();
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return value.trim();
};

export const isPhoneValid = (value = '') => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
};
