import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ───────────────────────────────────────────────────────────

export const fundingSourceTypeEnum = pgEnum("funding_source_type", [
  "tarjeta_credito",
  "efectivo_propio",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "pendiente_respuesta",
  "aprobada",
  "rechazada",
  "vencida",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "en_produccion",
  "entregado",
  "facturado",
  "cobrado",
]);

export const purchasePaymentStatusEnum = pgEnum("purchase_payment_status", [
  "pendiente",
  "pagado",
]);

export const cashMovementTypeEnum = pgEnum("cash_movement_type", [
  "salida",
  "entrada_reposicion",
]);

// ── Contactos ───────────────────────────────────────────────────────

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email"),
  cargo: text("cargo"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Fuentes de fondos ───────────────────────────────────────────────

export const fundingSources = pgTable("funding_sources", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  tipo: fundingSourceTypeEnum("tipo").notNull(),
  activo: boolean("activo").default(true).notNull(),
});

// ── Proveedores ─────────────────────────────────────────────────────

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  contacto: text("contacto"),
  telefono: text("telefono"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Cotizaciones ────────────────────────────────────────────────────

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  fechaSolicitud: timestamp("fecha_solicitud").notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  descripcion: text("descripcion").notNull(),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: integer("precio_unitario").notNull(),
  precioTotal: integer("precio_total").notNull(),
  estado: quoteStatusEnum("estado").default("pendiente_respuesta").notNull(),
  fechaVencimiento: timestamp("fecha_vencimiento"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Trabajos ────────────────────────────────────────────────────────

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  quoteId: integer("quote_id")
    .references(() => quotes.id)
    .notNull(),
  fechaAprobacion: timestamp("fecha_aprobacion").notNull(),
  estado: jobStatusEnum("estado").default("en_produccion").notNull(),
  numeroCuentaCobro: text("numero_cuenta_cobro"),
  fechaEmisionCc: timestamp("fecha_emision_cc"),
  fechaRealPago: timestamp("fecha_real_pago"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Compras ─────────────────────────────────────────────────────────

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id)
    .notNull(),
  supplierId: integer("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  fechaCompra: timestamp("fecha_compra").notNull(),
  fundingSourceId: integer("funding_source_id").references(
    () => fundingSources.id
  ),
  estadoPagoProveedor: purchasePaymentStatusEnum("estado_pago_proveedor")
    .default("pendiente")
    .notNull(),
  fechaPagoProveedor: timestamp("fecha_pago_proveedor"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Pagos recibidos ─────────────────────────────────────────────────

export const paymentsReceived = pgTable("payments_received", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id)
    .notNull(),
  monto: integer("monto").notNull(),
  fecha: timestamp("fecha").notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Movimientos de caja ─────────────────────────────────────────────

export const cashMovements = pgTable("cash_movements", {
  id: serial("id").primaryKey(),
  tipo: cashMovementTypeEnum("tipo").notNull(),
  fundingSourceId: integer("funding_source_id")
    .references(() => fundingSources.id)
    .notNull(),
  monto: integer("monto").notNull(),
  fecha: timestamp("fecha").notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  paymentReceivedId: integer("payment_received_id").references(
    () => paymentsReceived.id
  ),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
