const userLanguages = new Map<number, string>();

export function getUserLanguage(userId: number): string | undefined{
    return userLanguages.get(userId);
}

export function setUserLanguage(userId: number, lang: string): void {
    userLanguages.set(userId, lang);
}
