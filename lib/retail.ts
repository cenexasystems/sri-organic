export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateLineTotal = (
  quantity: number,
  unitType: string,
  packMultiplier: number,
  basePrice: number
) => {
  return quantity * packMultiplier * basePrice;
};

export const formatCompactQuantity = (quantity: number, unit: string) => {
  return `${quantity}${unit}`;
};
