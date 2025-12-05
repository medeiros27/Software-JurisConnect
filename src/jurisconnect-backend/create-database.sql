-- Script para criar database no PostgreSQL local
CREATE DATABASE "software-jurisconnect"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE "software-jurisconnect"
    IS 'Banco de dados do sistema JurisConnect';
