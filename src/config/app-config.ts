import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Alisson ERP",
  version: packageJson.version,
  copyright: `© ${currentYear}, Alisson Joias.`,
  meta: {
    title: "Alisson ERP",
    description:
      "Sistema de gestão da Alisson Joias — vendas, estoque, produção e financeiro.",
  },
};
