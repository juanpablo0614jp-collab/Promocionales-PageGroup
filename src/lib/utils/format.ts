import { format as fnsFormat, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatCOP(value: number): string {
  return (
    "$ " +
    new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  );
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return fnsFormat(d, "dd MMM yyyy", { locale: es });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return fnsFormat(d, "dd/MM/yyyy", { locale: es });
}
