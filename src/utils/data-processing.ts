import { parse, isValid, isBefore, startOfToday, differenceInDays } from 'date-fns';

// Formato esperado: dd/MM/yyyy
const DATE_FORMAT = 'dd/MM/yyyy';

export const parseDateString = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  try {
    const date = parse(dateString, DATE_FORMAT, new Date());
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

export const isDateBeforeToday = (dateString: string | undefined): boolean => {
    const date = parseDateString(dateString);
    if (!date) return false;
    return isBefore(date, startOfToday());
};

export const calculateLeadTime = (startDateString: string, endDateString: string): number | null => {
    const startDate = parseDateString(startDateString);
    const endDate = parseDateString(endDateString);

    if (!startDate || !endDate || isBefore(endDate, startDate)) {
        return null;
    }
    
    return differenceInDays(endDate, startDate);
};

export const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatNumber = (value: number): string => {
    // Formata números inteiros ou decimais com separador de milhar
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
};