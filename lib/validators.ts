export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function allDigitsEqual(value: string) {
  return /^([0-9])\1+$/.test(value);
}

export function isValidCPF(input: string) {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;

  return remainder === Number(cpf[10]);
}

export function isValidCNPJ(input: string) {
  const cnpj = onlyDigits(input);
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;

  const calcDigit = (base: string, factors: number[]) => {
    const total = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstFactor = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondFactor = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calcDigit(cnpj.slice(0, 12), firstFactor);
  const secondDigit = calcDigit(cnpj.slice(0, 12) + String(firstDigit), secondFactor);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidCpfOrCnpj(input: string) {
  const digits = onlyDigits(input);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

export function isValidPhone(input: string) {
  const digits = onlyDigits(input);
  return digits.length >= 10 && digits.length <= 13;
}
