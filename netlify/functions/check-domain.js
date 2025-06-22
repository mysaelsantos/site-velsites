// Importa o módulo 'dgram' do Node.js, que é necessário para a comunicação UDP.
const dgram = require('dgram');

// Esta é a função principal que a Netlify irá executar.
exports.handler = async (event, context) => {
  // Pega o nome do domínio que o usuário digitou, que vem da URL.
  // Ex: /api/check-domain?domain=meusite
  const domain = event.queryStringParameters.domain;

  // Se o usuário não enviou um domínio, retorna um erro.
  if (!domain) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O nome do domínio é obrigatório.' }),
    };
  }

  // O endereço do servidor de consulta do Registro.br.
  const REGISTRO_BR_HOST = 'avail.registro.br';
  // A porta do serviço, conforme a documentação.
  const REGISTRO_BR_PORT = 43;

  // Criamos uma "promessa" para lidar com a comunicação, que é assíncrona.
  return new Promise((resolve, reject) => {
    // Cria um socket UDP.
    const socket = dgram.createSocket('udp4');
    
    // Constrói a consulta que será enviada. Precisa terminar com uma quebra de linha.
    const query = `${domain}.com.br\r\n`;

    // Função para quando recebermos uma resposta do Registro.br.
    socket.on('message', (msg, rinfo) => {
      const response = msg.toString().trim();
      socket.close(); // Fecha a conexão após receber a resposta.
      
      // Retorna uma resposta de sucesso com o status do domínio.
      resolve({
        statusCode: 200,
        body: JSON.stringify({ response: response }),
      });
    });

    // Função para caso ocorra algum erro de conexão.
    socket.on('error', (err) => {
      socket.close();
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: `Erro ao consultar o domínio: ${err.message}` }),
      });
    });

    // Envia a nossa consulta para o servidor do Registro.br.
    socket.send(query, 0, query.length, REGISTRO_BR_PORT, REGISTRO_BR_HOST);

    // Adiciona um tempo limite (timeout) de 5 segundos. Se não houver resposta, retorna erro.
    setTimeout(() => {
        try {
            socket.close();
            reject({
                statusCode: 504, // Gateway Timeout
                body: JSON.stringify({ error: 'O servidor do Registro.br não respondeu a tempo.' }),
            });
        } catch (e) { /* O socket pode já ter sido fechado, ignoramos o erro */ }
    }, 5000);
  });
};