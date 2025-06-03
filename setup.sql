-- supabase/setup.sql
CREATE TABLE questionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    faixa_etaria TEXT NOT NULL,
    escolaridade TEXT NOT NULL,
    genero TEXT NOT NULL,
    conhecimento_direitos_humanos INTEGER NOT NULL,
    conhecimento_declaracao TEXT NOT NULL,
    aplicacao_direitos_digital TEXT NOT NULL,
    direitos_mais_ameacados TEXT[] NOT NULL,
    preocupacao_dados INTEGER NOT NULL,
    experiencia_negativa TEXT NOT NULL,
    educacao_direitos_digital TEXT NOT NULL,
    responsabilidade_protecao TEXT[] NOT NULL,
    regulamentacoes_suficientes TEXT NOT NULL,
    preocupacao_ia INTEGER NOT NULL,
    aspectos_preocupantes_ia TEXT[] NOT NULL
);

CREATE TABLE relatos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_violacao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    faixa_etaria TEXT,
    genero TEXT
);

-- Função para estatísticas
CREATE OR REPLACE FUNCTION get_estatisticas()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_questionarios', (SELECT COUNT(*) FROM questionarios),
        'total_relatos', (SELECT COUNT(*) FROM relatos),
        'violacoes_por_tipo', (SELECT json_object_agg(tipo_violacao, count) 
                              FROM (SELECT tipo_violacao, COUNT(*) 
                                    FROM relatos 
                                    GROUP BY tipo_violacao) t),
        'conhecimento_medio', (SELECT AVG(conhecimento_direitos_humanos) 
                              FROM questionarios),
        'preocupacao_dados_media', (SELECT AVG(preocupacao_dados) 
                                   FROM questionarios)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;