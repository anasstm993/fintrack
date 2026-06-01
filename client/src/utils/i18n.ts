import type { TranslationKeys } from '../i18n/translations';

/**
 * Translates a category name using the i18n translation keys.
 * Falls back to the original name if no translation is found.
 */
export function getTranslatedCategory(t: TranslationKeys, name: string): string {
  return (t.categories as Record<string, Record<string, string>>)?.default?.[name] || name;
}

/**
 * Translates a budget insight message, substituting the category name.
 * Used in Dashboard and DashboardLayout notification panels.
 */
export function translateInsight(
  t: TranslationKeys,
  insight: { key: string; message: string; data?: { categoryName?: string } }
): string {
  const categoryName = getTranslatedCategory(t, insight.data?.categoryName || '');
  const customMsgs: Record<string, string> = {
    budget_danger:
      t.dashboard?.budgetDanger?.replace('{cat}', categoryName) ||
      `You have exceeded your budget for ${categoryName}.`,
    budget_warning:
      t.dashboard?.budgetWarning?.replace('{cat}', categoryName) ||
      `You are close to exceeding your budget for ${categoryName}.`,
  };
  return customMsgs[insight.key] || insight.message;
}
