import { sql } from "../connection";

export interface TranslatedRow {
  entity_type: string;
  entity_id: string;
  locale: string;
  field: string;
  value: string;
  is_fallback: boolean;
  is_stale: boolean;
  translation_status: string;
}

export async function getTranslated(
  entityType: string,
  entityId: string,
  locale: string,
): Promise<TranslatedRow[]> {
  return sql<TranslatedRow[]>`
    SELECT entity_type, entity_id, locale, field, value, is_fallback, is_stale, translation_status
    FROM infi_translated
    WHERE entity_type = ${entityType}
      AND entity_id = ${entityId}
      AND locale = ${locale}
  `;
}

export async function getTranslatedFields(
  entityType: string,
  entityIds: string[],
  locale: string,
  fields?: string[],
): Promise<TranslatedRow[]> {
  if (entityIds.length === 0) return [];

  if (fields && fields.length > 0) {
    return sql<TranslatedRow[]>`
      SELECT entity_type, entity_id, locale, field, value, is_fallback, is_stale, translation_status
      FROM infi_translated
      WHERE entity_type = ${entityType}
        AND entity_id = ANY(${entityIds})
        AND locale = ${locale}
        AND field = ANY(${fields})
    `;
  }

  return sql<TranslatedRow[]>`
    SELECT entity_type, entity_id, locale, field, value, is_fallback, is_stale, translation_status
    FROM infi_translated
    WHERE entity_type = ${entityType}
      AND entity_id = ANY(${entityIds})
      AND locale = ${locale}
  `;
}
