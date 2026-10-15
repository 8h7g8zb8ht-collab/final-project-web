/**
 * Centralized instructor settings.
 * Edit instructor name and photo assets here in one place.
 */
export const TEACHER_CONFIG = {
  // Teacher name (Cyrillic for Russian & Tajik, Latin for English)
  nameCyrillic: 'Карина Бек-Назарова',
  nameLatin: 'Karina Bek-Nazarova',

  /**
   * Helper to get instructor name based on active language code.
   * On English ('en') returns Latin, otherwise Cyrillic.
   */
  getName(language: string): string {
    return language === 'en' ? this.nameLatin : this.nameCyrillic;
  },

  // Direct teacher photo URL
  photoUrl: 'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/IMAGE%202026-10-06%2011:30:43%20PM.jpg',
  photoPlaceholderAlt: 'Фото преподавателя',
};
