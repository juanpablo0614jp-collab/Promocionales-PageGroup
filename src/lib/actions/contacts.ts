"use server";

import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { contactSchema } from "@/lib/validations/contacts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getContacts() {
  return db.select().from(contacts).orderBy(contacts.nombre);
}

export async function getContact(id: number) {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id));
  return contact ?? null;
}

export async function createContact(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db.insert(contacts).values({
    nombre: data.nombre,
    email: data.email || null,
    cargo: data.cargo || null,
    notas: data.notas || null,
  });

  revalidatePath("/contactos");
  return { success: true };
}

export async function updateContact(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db
    .update(contacts)
    .set({
      nombre: data.nombre,
      email: data.email || null,
      cargo: data.cargo || null,
      notas: data.notas || null,
    })
    .where(eq(contacts.id, id));

  revalidatePath("/contactos");
  return { success: true };
}

export async function deleteContact(id: number) {
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/contactos");
  return { success: true };
}
