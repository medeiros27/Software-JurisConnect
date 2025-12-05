-- 06_functions.sql
-- Functions para cálculos complexos

-- Tabela de feriados (necessária para dias_uteis)
CREATE TABLE IF NOT EXISTS feriados (
    data DATE PRIMARY KEY,
    descricao TEXT
);

-- Calcular dias úteis entre duas datas
CREATE OR REPLACE FUNCTION dias_uteis(p_inicio DATE, p_fim DATE)
RETURNS INTEGER 
LANGUAGE plpgsql AS $$
DECLARE v_dias INTEGER := 0;
BEGIN
  IF p_fim < p_inicio THEN RETURN 0; END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_dias
  FROM generate_series(p_inicio, p_fim, interval '1 day') d
  WHERE EXTRACT(ISODOW FROM d) < 6  -- 1=Monday ... 5=Friday
    AND NOT EXISTS (SELECT 1 FROM feriados f WHERE f.data = d::DATE);
    
  RETURN v_dias;
END;
$$;

-- Hash de senha (bcrypt)
CREATE OR REPLACE FUNCTION hash_senha(p_senha TEXT) 
RETURNS TEXT 
LANGUAGE sql AS $$
  SELECT crypt(p_senha, gen_salt('bf',12));
$$;

-- Verificar senha
CREATE OR REPLACE FUNCTION verifica_senha(p_hash TEXT, p_senha TEXT) 
RETURNS BOOLEAN 
LANGUAGE sql AS $$
  SELECT p_hash = crypt(p_senha, p_hash);
$$;

-- Formatar valor em centavos para reais
CREATE OR REPLACE FUNCTION formatar_valor(p_cents BIGINT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT 'R$ ' || TO_CHAR(p_cents / 100.0, 'FM999G999G999D00');
$$;
