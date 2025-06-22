exports.handler = async (event) => {
  const domain = event.queryStringParameters.domain;

  if (!domain) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O nome do domínio é obrigatório.' }),
    };
  }

  const fullDomain = `${domain}.com.br`;
  const rdapUrl = `https://rdap.registro.br/domain/${fullDomain}`;

  try {
    const response = await fetch(rdapUrl);

    // Se a resposta for 404 (Not Found), o domínio está DISPONÍVEL.
    if (response.status === 404) {
      return {
        statusCode: 200,
        body: JSON.stringify({ available: true }),
      };
    }
    
    // Se a resposta for 200 (OK), o domínio está em USO.
    if (response.status === 200) {
      return {
        statusCode: 200,
        body: JSON.stringify({ available: false }),
      };
    }

    // Para qualquer outro caso, consideramos como um erro.
    throw new Error(`Status inesperado: ${response.status}`);

  } catch (error) {
    console.error('Erro na consulta RDAP:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao consultar o serviço de domínios.' }),
    };
  }
};
