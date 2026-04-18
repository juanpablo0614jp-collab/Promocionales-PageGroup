CREATE TYPE "public"."cash_movement_type" AS ENUM('salida', 'entrada_reposicion');--> statement-breakpoint
CREATE TYPE "public"."funding_source_type" AS ENUM('tarjeta_credito', 'efectivo_propio');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('en_produccion', 'entregado', 'facturado', 'cobrado');--> statement-breakpoint
CREATE TYPE "public"."purchase_payment_status" AS ENUM('pendiente', 'pagado');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('pendiente_respuesta', 'aprobada', 'rechazada', 'vencida');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"nombre" text NOT NULL,
	"url" text NOT NULL,
	"tipo" text NOT NULL,
	"tamano" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" "cash_movement_type" NOT NULL,
	"funding_source_id" integer NOT NULL,
	"monto" integer NOT NULL,
	"fecha" timestamp NOT NULL,
	"purchase_id" integer,
	"payment_received_id" integer,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text,
	"cargo" text,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funding_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"tipo" "funding_source_type" NOT NULL,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"quote_id" integer NOT NULL,
	"fecha_aprobacion" timestamp NOT NULL,
	"estado" "job_status" DEFAULT 'en_produccion' NOT NULL,
	"numero_cuenta_cobro" text,
	"fecha_emision_cc" timestamp,
	"fecha_real_pago" timestamp,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "payments_received" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"monto" integer NOT NULL,
	"fecha" timestamp NOT NULL,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"descripcion" text NOT NULL,
	"monto" integer NOT NULL,
	"fecha_compra" timestamp NOT NULL,
	"funding_source_id" integer,
	"estado_pago_proveedor" "purchase_payment_status" DEFAULT 'pendiente' NOT NULL,
	"fecha_pago_proveedor" timestamp,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"fecha_solicitud" timestamp NOT NULL,
	"contact_id" integer,
	"descripcion" text NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" integer NOT NULL,
	"precio_total" integer NOT NULL,
	"estado" "quote_status" DEFAULT 'pendiente_respuesta' NOT NULL,
	"fecha_vencimiento" timestamp,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"contacto" text,
	"telefono" text,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_payment_received_id_payments_received_id_fk" FOREIGN KEY ("payment_received_id") REFERENCES "public"."payments_received"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments_received" ADD CONSTRAINT "payments_received_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;