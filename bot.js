
// Documentação: https://docs.wwebjs.dev/
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth,MessageMedia } = require('whatsapp-web.js');

// Serve para indicar qual é o estágio da conversa.
// false=bem-vindo,1=inicio,2=meio,3=fim
global.sessoes = {};

// banco de dados de opções
// Segunda via do boleto
// 
//global.opcoes = ["Segunda Via do Boleto","Finalizar atendimento"];
global.opcoes = {"Segunda Via Boleto":["segunda via","segunda via boleto","boleto"],
"Encerrar Atendimento":["encerrar atendimento","encerrar","finalizar","fim","para","parar"]
};
global.opcoes = [
    ["Segunda Via Boleto","segunda via","boleto"],
    ["Encerrar Atendimento","encerrar atendimento","encerrar","finalizar","fim","para","parar"],
];

// db cpfs
global.cpfs = {"12345678911":"Marcelo"};

function montaOpcoes(){
    var textoOpcoes = "";
    var cont = global.opcoes.length;
    for (var i = 0;i < cont;i++){
        var indice = i+1
        textoOpcoes += "*"+indice+"*. "+global.opcoes[i][0]+"\n";
    }
    return textoOpcoes;
}

async function executaOpcao(message,opcao){
    if (opcao == 0){
        const media = MessageMedia.fromFilePath('./segunda_via_boleto.pdf');
        await message.reply(media);
        var opcoes = montaOpcoes();
        await client.sendMessage(message.from,
            "Atendimento encerrado. Até logo 😉"
        );
        global.sessoes[message.from] = 0;
        return;
    }
    if (opcao == 1){
        await client.sendMessage(message.from,
            "Atendimento encerrado. Até logo 😉"
        );
        global.sessoes[message.from] = 0;
        return;
    }
}

function entenderOpcao(message){
    var opcao = message.body;
    var cont = global.opcoes.length;
    console.log("cont: ",cont);
    for (var i = 0; i < cont;i++){
        if (global.opcoes[i].includes(opcao.toLowerCase())){
            return i;
        }
    }
    if (isNaN(opcao)){
        return false;
    }
    if (parseInt(opcao)-1 < global.opcoes.length && parseInt(opcao)-1 >= 0){
        return parseInt(opcao)-1;
    }

    return false;
}

function chat(message){
    console.log(global.sessoes);;
    // O bot não responderá mensagens de grupos
    if (message.from.includes("@g.us")){
        return;
    }
    if(message.from != "559889191062@c.us"){
        return;
    }
    console.log("mensagem: "+message.body);
    if (!global.sessoes.hasOwnProperty(message.from) || global.sessoes[message.from] == 0){
        //var opcoes = montaOpcoes();
        message.reply(
            "Olá! Tudo bom? Sou Assistente Virtual da Octarone Internet. "+
            "Antes de começar o atendimento, por favor, digite os números do seu *CPF*."
        );
        global.sessoes[message.from] = 1;
        return;
    }

    if (global.sessoes[message.from] == 1){
        //message.reply("Você disse: "+message.body.split(",").toString()+" ?");
        var cpf = message.body.replaceAll(".","").replaceAll("-","");

        if (!global.cpfs.hasOwnProperty(cpf)){
            message.reply("CPF Não encontrado no sistema. Por favor, digite o seu *CPF*.");
            return;
        }else{
            var nome_cliente = global.cpfs[cpf];
            var opcoes = montaOpcoes();
            message.reply(
                "Olá, "+nome_cliente+". Escolha uma opção abaixo: \n\n"+
                opcoes
            );
            global.sessoes[message.from] = 2;
            return;
        }
    }

    if (global.sessoes[message.from] == 2){
        var opcao = entenderOpcao(message);
        console.log("opcao: ",opcao);
        if (opcao === false){
            message.reply("Por favor, escolha uma opção válida!");
            return;
        }
        executaOpcao(message,parseInt(opcao));
    }

}

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

// message_create (also me)
client.on('message', (message) => {
    chat(message);
});

client.on('vote_update', (vote) => {
    console.log(vote);
});

client.initialize();

/*
if (message.body.startsWith('!ping')) {
        message.reply('*pong*');
    }
*/

/*
var opcao = message.body;
        // Não é número
        if (isNaN(opcao)){
            message.reply("Escolha uma opção válida!");
            return;
        }else{
            if (global.opcoes.length < parseInt(opcao)){
                message.reply("Escolha uma opção válida!");
                return;
            }else{
                message.reply("Você escolheu: "+global.opcoes[parseInt(opcao)-1]);
                executaOpcao(message,parseInt(opcao)-1);
                return;
            }
        }
*/