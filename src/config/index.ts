import { config } from 'dotenv';

config();

const envFile = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`;

config({ path: envFile });

const {
    //General
    NODE_ENV,
    PORT,

    //Frontend URL
    FRONTEND_ADMIN_UI_URL,
    FRONTEND_CLIENT_UI_URL,
    MAIN_DOMAIN,

    //PostgreSQL
    POSTGRESQL_HOST,
    POSTGRESQL_PORT,
    POSTGRESQL_USERNAME,
    POSTGRESQL_PASSWORD,
    POSTGRESQL_DATABASE,

    //Token
    REFRESH_TOKEN,

    JWKS_URI,

    MONGO_URI,
} = process.env;

export const Config = {
    //General
    NODE_ENV,
    PORT,

    //URL
    FRONTEND_ADMIN_UI_URL,
    FRONTEND_CLIENT_UI_URL,
    MAIN_DOMAIN,

    //PostgreSQL
    POSTGRESQL_HOST,
    POSTGRESQL_PORT,
    POSTGRESQL_USERNAME,
    POSTGRESQL_PASSWORD,
    POSTGRESQL_DATABASE,

    //Token
    REFRESH_TOKEN,

    JWKS_URI,

    //MongoDB
    MONGO_URI,
};
