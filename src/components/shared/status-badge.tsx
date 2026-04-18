import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const quoteStatusConfig: Record<string, { label: string; className: string }> = {
  pendiente_respuesta: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  aprobada: {
    label: "Aprobada",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  rechazada: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  vencida: {
    label: "Vencida",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

const jobStatusConfig: Record<string, { label: string; className: string }> = {
  en_produccion: {
    label: "En produccion",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  entregado: {
    label: "Entregado",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  facturado: {
    label: "Facturado",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  cobrado: {
    label: "Cobrado",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = quoteStatusConfig[status] ?? {
    label: status,
    className: "",
  };
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function JobStatusBadge({ status }: { status: string }) {
  const config = jobStatusConfig[status] ?? {
    label: status,
    className: "",
  };
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
