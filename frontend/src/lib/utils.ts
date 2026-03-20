export const formatCurrency = (amount: number, currency = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const formatMonth = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? '';
  }

  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';

  return `${first}${last}`.toUpperCase();
};

export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
