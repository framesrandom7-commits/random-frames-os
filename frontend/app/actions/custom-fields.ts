"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomFields(entityType?: string) {
  try {
    const whereClause = entityType ? { entityType } : {};
    const fields = await prisma.customFieldDefinition.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
    });
    return fields;
  } catch (error) {
    console.error("Failed to fetch custom fields:", error);
    return [];
  }
}

export async function createCustomField(data: any) {
  try {
    const field = await prisma.customFieldDefinition.create({
      data: {
        entityType: data.entityType,
        name: data.name,
        label: data.label,
        fieldType: data.fieldType,
        options: data.options || null,
        isRequired: data.isRequired || false,
        order: data.order || 0,
      },
    });
    revalidatePath("/settings/forms");
    return field;
  } catch (error) {
    console.error("Failed to create custom field:", error);
    return null;
  }
}

export async function updateCustomField(id: string, data: any) {
  try {
    const field = await prisma.customFieldDefinition.update({
      where: { id },
      data: {
        label: data.label,
        fieldType: data.fieldType,
        options: data.options || null,
        isRequired: data.isRequired,
        order: data.order,
      },
    });
    revalidatePath("/settings/forms");
    return field;
  } catch (error) {
    console.error("Failed to update custom field:", error);
    return null;
  }
}

export async function deleteCustomField(id: string) {
  try {
    await prisma.customFieldDefinition.delete({
      where: { id },
    });
    revalidatePath("/settings/forms");
    return true;
  } catch (error) {
    console.error("Failed to delete custom field:", error);
    return false;
  }
}
