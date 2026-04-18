import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  pgEnum,
  primaryKey,
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
// ── Auth.js (NextAuth v5) ────────────────────────────────────────────────────

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);