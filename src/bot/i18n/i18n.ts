import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";

export async function initI18n() {
    await i18next.use(Backend).init({
        lng: "ru",
        fallbackLng: "ru",
        preload: ["en", "ru", "kz"],
        ns: ["translation"],
        defaultNS: "translation",
        backend: {
            loadPath: path.join(process.cwd(), "src/bot/locales/{{lng}}/{{ns}}.json")
        },
        interpolation: {
            escapeValue: false,
        },
    });
    console.log("i18n инициализирован");
}

export default i18next;
