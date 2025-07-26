const userSeguro = "558587636157@c.us"
const mandaCartela = "Mande as cartelas de hoje"
const apagaCartela = "Apague as cartelas de hoje"
const listaDeTime = "Lista de times no grupo"
const retiraTimeGrupo = "Retirar time do grupo"
const cadastraTime = "Add times ao grupo"
const corteCodigo = "Corte suporte codigo"
const apagaCodigo = "Apagar codigo de suporte"
// const sim = "Sim, quero cadastrar"
// const nao = "Não"
// const criaMensagem = "Cadastrar mensagem de suporte"
// const apagaMensagem = "Apagar mensagem de suporte"

const rgxCorteCodigoSuporte = /Corte suporte codigo/gmi

const rgxClube = /clube:|time:/gmi
const rgxCapturaClube = /clube:.+|time:.+/gmi
const regexEmoji = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\u200B-\u200D\uFEFF]|[\r])|[~_+()]|⬜/g
const rgxAsterisco = /_|\*|,/gmi
const rgxBenfica = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/gm
const rgxNome = /([A-Za-zÀ-ÿ.]+\s{1,2}){1,5}[A-Za-zÀ-ÿ.]+|[A-Za-zÀ-ÿ.]+/gmi
const rgxCapturaTudo = /.*/s
const rgxLimpeza = new RegExp(`${regexEmoji.source}|${rgxAsterisco.source}|${rgxBenfica.source}`, 'gmi')

const venom = require('venom-bot');

venom.create({
    browserPathExecutable: "C:\Program Files\Google\Chrome\Application\chrome.exe",
    session: "session-name"
})
    .then(client => start(client))
    .catch(erro => console.log(erro))

const timesCadastradosPorGrupo = {};
const timesPorGrupo = {};
const cartelaPorGrupo = {};
const timesEnviadoGrupo = {};
const informacoes = {dados:[]}

const informacoesSuperUser = `UserSeguro = ${userSeguro}\nMandaCartela = ${mandaCartela}\nApagaCartela = ${apagaCartela}\nRetiraTimeGrupo = ${retiraTimeGrupo}
CadastraTime = ${cadastraTime}\nListaDeTime = ${listaDeTime}\nCorte Codigo Suporte = ${corteCodigo}\nApagar codigo de suporte = ${apagaCodigo}`

const start = (client) => {
    client.onMessage((message) => {
        let grupoId = message.from
        let timeAnalisado = nomeClube(message.body).join()
        const zeraLista = message.body.match(apagaCartela)
        const remocao = message.body.match(retiraTimeGrupo)
        const cadastro = message.body.match(cadastraTime)
        const grupo = message.isGroupMsg === true
        const autorizado = message.author === userSeguro
        const pegaClube = message.body.match(rgxCapturaClube)
        const cortaCodigoSuporte = message.body.match(corteCodigo)
        const apagaCodigoSuporte = message.body.match(apagaCodigo)

        //Bot
        if (message.body.toLowerCase().match("help bot")){
            let codigos = `Lista de codigos disponiveis\n\n`
            
            for (let i = 0; i < informacoes.dados.length; i++) {
               codigos += `${informacoes.dados[i][0]}\n`
            }

            codigos += `\nPara escolher um codigo digite o comando *Bot fmw + comando*\n\nExemplo Bot fmw Regras`

            if(autorizado){
                client.sendText(message.from, `${informacoesSuperUser}\n${codigos}`)
                } else if (!autorizado && grupo) {
                    client.sendText(message.from, codigos)
        }
        }

        //Envio de informaçoes
        if (message.body.match(/bot fmw/gi) && grupo){
            let codigo = message.body.replace(/bot fmw/gi, "").trim()
            for (let i = 0; i < informacoes.dados.length; i++) {
                                
                if (informacoes.dados[i][0].toLowerCase() === codigo.toLowerCase()){
                    client.sendText(message.from, informacoes.dados[i][1])
                }
            }
        }

        //Cadastrando informaçoes
        if (autorizado){
        if (message.body.match(cortaCodigoSuporte)) {
            let mensagemBruta = message.body.split(rgxCorteCodigoSuporte)
            
            let codigo = mensagemBruta[0].trim()
            let mensagem = mensagemBruta[1].trim()
            informacoes.dados.push([codigo, mensagem])
            }

            if (apagaCodigoSuporte) {
                let codigo = message.body.replace(apagaCodigo, "").trim()
                
                for (let i = 0; i < informacoes.dados.length; i++) {
                    if(informacoes.dados[i][0].match(codigo.trim())){
                        informacoes.dados[i] = ["mensagem deletada pelo adilço", "> ⓘ _Este usuário foi temporariamente suspenso do WhatsApp por participação em grupos criminosos. Por ordem judiciária vigente, o WhatsApp Inc vê-se na obrigação legal de restringir mensagens encaminhadas a este contato e reserva-se o direito de fornecer informações ao Ministério da Segurança Pública. Todos os grupos que este usuario está presente estão sobre investigação._"] 
                    }                 
                }
            }
        }

        //cria os grupos
        if (!timesCadastradosPorGrupo[grupoId]) {
            timesCadastradosPorGrupo[grupoId] = []   //salvo todos os times
            cartelaPorGrupo[grupoId] = [] //salva as cartelas
            timesPorGrupo[grupoId] = [] //salva quem envio
            timesEnviadoGrupo[grupoId] = [] //salva quem enviou
        }

        //cadastro e remoçao de time e envio de cartelas
        if (autorizado && grupo) {
         //cadastra times nos grupos
            if (cadastro) {
 
             if (timesCadastradosPorGrupo[grupoId].length <= 0) {
                 timesCadastradosPorGrupo[grupoId].push(cortaTimes(message.body))
 
             } else {
                 const novosTimes = cortaTimes(message.body)
                 for (let i = 0; i < novosTimes.length; i++) {
                     timesCadastradosPorGrupo[grupoId][0].push(novosTimes[i])
                 }
             }
 
             let listaTimes = viraString(timesCadastradosPorGrupo[grupoId][0])
 
             client.sendText(message.from, `Times cadastrados no grupo\n\n${listaTimes}`)
            }

            //remover times do grupoF
            if (remocao) {
            const timeParaRemover = cortaTimes(message.body) //certo
            const listaDeTimeCadastrado = timesCadastradosPorGrupo[grupoId][0] //certo

            const times = []
            for (let i = 0; i < listaDeTimeCadastrado.length; i++) {
                if (!timeParaRemover.includes(listaDeTimeCadastrado[i])) {
                    times.push(listaDeTimeCadastrado[i])
                }
            }

            timesCadastradosPorGrupo[grupoId][0] = times
            let listaTimes = viraString(timesCadastradosPorGrupo[grupoId][0])

            client.sendText(message.from, `Times cadastrados no grupo\n\n${listaTimes}`)
            }

        //Manda as cartelas enviadas
        if (message.body === mandaCartela) {

            let listaTimes = viraString(cartelaPorGrupo[message.from])
            console.log(cartelaPorGrupo[message.from], 1)
           // console.log(cartelaPorGrupo[message.from][0], 2)//
            console.log(cartelaPorGrupo[grupoId], 3)
           // console.log(cartelaPorGrupo[grupoId][0], 4)
            client.sendText(message.from, `Cartelas enviadas:\n\n${listaTimes}`)

        } else if (message.body === mandaCartela && !autorizado && grupo) {
            client.sendText(message.from, `Acesso negado, fala com o Adilço`)
        }
        }

         //listar os times cadastrados no grupo
        if (message.body.match(listaDeTime) && grupo) {

            let listaTimes = viraString(timesCadastradosPorGrupo[grupoId][0])

            client.sendText(message.from, `Times cadastrados nesse grupo\n\n${listaTimes}`)
        }
        
        //cartelas enviadas nos grupos e apaga as cartelas
        if (!cadastro && grupo ) {//(pegaClube | zeraLista) && 

            timesEnviadoGrupo[grupoId].push(nomeClube(message.body).join())
            const timesEnviadosHoje = timesEnviadoGrupo[grupoId].filter(x => x)// cartelas enviadas hoje
            let listaHoje = timesCadastradosPorGrupo[grupoId][0].filter(x => x).map(x => `⚪ clube: ${x}`)//lista cadastrados no grupo
            let listaAtualizada = timesCadastradosPorGrupo[grupoId][0].filter(x => x).map(x => `⚪ ${x}`)// lista cadastrados no grupo

            if(pegaClube) {
            cartelaPorGrupo[grupoId].push(`${horaAtual()}\n${message.body}\n\n`)
            timesPorGrupo[grupoId].push(`${nomeClube(message.body)} - ${horaAtual()}\n`)
            console.log(cartelaPorGrupo[grupoId])
            console.log(timesPorGrupo[grupoId])
            }

            if (pegaClube && timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado)) {

            for (let i = 0; i < listaHoje.length; i++) {
                for (let j = 0; j < timesEnviadoGrupo[grupoId].length; j++) {
                    if (nomeClube(listaHoje[i]).join() === timesEnviadosHoje[j]) {
                        listaAtualizada.splice(i, 1, `✅ ${timesEnviadosHoje[j]} - ${horaAtual()}`)
                    }
                }
            }


            let timesEnviados = ""
            for (let i = 0; i < listaAtualizada.length; i++) {
                timesEnviados += `${listaAtualizada[i]}\n`
            }

            client.sendText(message.from, `*Lista de cartelas enviadas hoje*\n\n${timesEnviados}\n*Boa sorte a TODES e que perca o pior.*`)

            } else if (pegaClube && !timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado)) {
                const timesNaoListados = []
                timesNaoListados.push(`✅ ${timeAnalisado}\n`)
                const times = viraString(timesNaoListados)
                
                client.sendText(message.from, `*Lista de cartelas enviadas hoje*\n\n${times}\n*Não estão na lista dos cadastrados por algum motivo, fala com o adilço*`)     
            }

            if (zeraLista && autorizado) {
                cartelaPorGrupo[message.from] = []
                timesEnviadoGrupo[message.from] = ''
                listaHoje = timesCadastradosPorGrupo[grupoId][0].filter(x => x).map(x => `⚪ clube: ${x}`)
                listaAtualizada = timesCadastradosPorGrupo[grupoId][0].filter(x => x).map(x => `⚪ ${x}`)
                timesEnviadoGrupo[grupoId] = []
                
                client.sendText(message.from, 'A lista foi reiniciada')
                
            } else if (zeraLista && !autorizado) {
                client.sendText(message.from, `Acesso negado, fala com o Adilço`)
            }
        }
  
    })
}

function viraString(grupo) {
    let listaTimes = ''
    for (let i = 0; i < grupo.length; i++) {
        listaTimes += `${grupo[i]}\n`
    }
    return listaTimes
}

function horaAtual() {
    const dataHora = new Date();
    const horaExata = dataHora.toLocaleTimeString("pt-BR", { timeZone: "America/Fortaleza", hour: "2-digit", minute: "2-digit" })
    return horaExata
}

function cortaTimes(time) {
    const listaDeTimes = time.match(rgxCapturaClube)
    const timesCortados = []
    for (let i = 0; i < listaDeTimes.length; i++) {
        timesCortados.push(nomeClube(listaDeTimes[i]).join())
    }
    //console.log(timesCortados)
    return timesCortados
}

function nomeClube(cartela) {
    let clube = cartela.replace(rgxLimpeza, '').match(rgxCapturaClube) || ['clube: Nome do time']
    clube = clube.join().replace(rgxClube, '').replace(rgxAsterisco, '').match(rgxNome)

    !clube ? clube = ['Nome do time'] : clube
    clube.length > 1 ? clube = clube.join().replace(',', ' ').split() : clube

    clube = padronizaNome(clube.join())
    return clube
}

function padronizaNome(nomes) {
    let nomePadronizado = []
    let nomesMinusculo = nomes.toLowerCase()
    nomesMinusculo = nomesMinusculo.length < 2 ? nomesMinusculo + nomesMinusculo : nomesMinusculo
    const dividiNome = nomesMinusculo.split('') // armazena o array do nome

    const letraInicio = dividiNome[0].toUpperCase()
    dividiNome.splice(0, 1, letraInicio)
    nomePadronizado.push(dividiNome.join('').trim())

    return nomePadronizado
}

   // //apaga as cartelas
        // if (message.body === apagaCartela && autorizado && grupo) {
            
        //     cartelaPorGrupo[message.from] = ''
        //     timesEnviadoGrupo[message.from] = ''
        //     listaHoje = timesCadastradosPorGrupo[grupoId][0].map(x => `⚪ clube: ${x}`)
            
        //     client
        //     .sendText(message.from, 'A lista foi reiniciada')
        // } else if (message.body === apagaCartela && message.author !== userSeguro && grupo) {
        //     client
        //     .sendText(message.from, `Acesso negado, fala com o Adilço`)
        // }
        

  // if (message.body.match(rgxCapturaClube) && timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado) && !cadastro && !zeraLista && grupo) {

        //     //const timeEnviado = []
        //     // console.log(timesCadastradosPorGrupo[grupoId].includes(timeAnalisado), 1)
        //     // console.log(timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado), 2)
        //     // console.log(timeAnalisado, 3)
        //     timeEnviado[grupoId].push(nomeClube(message.body).join())
        //     const timesEnviadosHoje = timeEnviado[grupoId]
        //     const listaHoje = timesCadastradosPorGrupo[grupoId][0].map(x => `⚪ clube: ${x}`)
        //     const listaAtualizada = timesCadastradosPorGrupo[grupoId][0].map(x => `⚪ ${x}`)

        //     for (let i = 0; i < listaHoje.length; i++) {
        //         for (let j = 0; j < timeEnviado[grupoId].length; j++) {
        //             if (nomeClube(listaHoje[i]).join() === timesEnviadosHoje[j]) {
        //                 listaAtualizada.splice(i, 1, `✅ ${timesEnviadosHoje[j]} - ${horaAtual()}`)
        //             }
        //         }
        //     }

        //     let timesEnviados = `Lista de cartelas enviadas hoje\n\n`
        //     for (let i = 0; i < listaAtualizada.length; i++) {
        //         timesEnviados += `${listaAtualizada[i]}\n`
        //     }

        //     client.sendText(message.from, `Cartelas enviadas: \n\n${timesEnviados}\n*Boa sorte a TODES e que perca o pior.*`)
        // }

        // erros de cartela enviadas
        // if (message.body.match(rgxCapturaClube) && !timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado) && !cadastro && !zeraLista && grupo) {
        //     console.log(timeAnalisado)
        //     if (timeAnalisado === 'Nome do time') {
        //         client.sendText(message.from, `Cartela sem nome`)

        //     } else if (!timesCadastradosPorGrupo[grupoId][0].includes(timeAnalisado)) {
        //         client.sendText(message.from, `Time nao cadastrado`)
        //     }
        // }