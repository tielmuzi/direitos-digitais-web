// Configuração do cliente Supabase
const supabaseUrl = 'SUA_URL_SUPABASE';
const supabaseKey = 'SUA_CHAVE_SUPABASE';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Funções específicas para interação com o Supabase
async function getSurveyStats() {
    try {
        const { data, error } = await supabase
            .rpc('get_estatisticas');
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return null;
    }
}

async function submitSurvey(surveyData) {
    try {
        const { data, error } = await supabase
            .from('questionarios')
            .insert([surveyData]);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao enviar questionário:', error);
        throw error;
    }
}

async function submitReport(reportData) {
    try {
        const { data, error } = await supabase
            .from('relatos')
            .insert([reportData]);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao enviar relato:', error);
        throw error;
    }
}

async function exportAllData() {
    try {
        const { data: surveys, error: surveyError } = await supabase
            .from('questionarios')
            .select('*');
            
        if (surveyError) throw surveyError;
        
        const { data: reports, error: reportError } = await supabase
            .from('relatos')
            .select('*');
            
        if (reportError) throw reportError;
        
        return {
            surveys,
            reports,
            exportedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        throw error;
    }
}

// Exportar funções para uso em outros arquivos
export {
    supabase,
    getSurveyStats,
    submitSurvey,
    submitReport,
    exportAllData
};