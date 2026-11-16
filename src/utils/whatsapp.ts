/** wa.me wants digits only, with the country code; a bare 10-digit number is an Indian mobile. */
export const whatsAppHref = (phone: string | null | undefined): string | null => {
  const digits = (phone ?? '').replace(/\D/g, '');
  const full = digits.length === 10 ? `91${digits}` : digits;
  return full.length >= 11 ? `https://wa.me/${full}` : null;
};
