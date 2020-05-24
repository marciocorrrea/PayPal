# PayPal
Facil integração PayPal + Node
 	Processo

1.	Criação da conta

Deve-se acessar a página de desenvolvedor do Paypal em:

•	https://developer.paypal.com
Será necessário possuir um conta na plantaforma. Após estar logado deve-se criar uma conta de teste para logar no ambiente de teste paypal, no link:
•	https://developer.paypal.com/developer/accounts

Será possível criar um conta pessoal e uma conta de negocio, recomendo criar uma de cada para debugs: 
  
Após isso devemos acessar o seguinte link para criar um conta de negocio de teste: 
•	https://developer.paypal.com/developer/applications/create
 
 Após a criação da conta serão gerados dados para a integração no node.















2.	 Integração

Agora conta a conta criada podemosn iniciar o projeto, será necessário instalar a seguinte biblioteca e seguir os passos:

•	Npm install paypal-rest-sdk

Importar no projeto:
1.	const paypal = require("paypal-rest-sdk")

Depois de importar será necessário importar no projeto:
2.	paypal.configure({
3.	'mode': 'sandbox', //sandbox or live
4.	'client_id': 'ARyxr-iH54M-OkqtjUMkt-lTNuOZN0oocLkUgNh1lnFq4NMu4jgl-W6u4thlYbBe6QSDC1D1kLeZh_Fc',
5.	'client_secret': 'EIU3U-KkgfPt2rW312Ea4GDghYzJ0iuzmzNdkV7497yIMPnp8jYsL4xlbIPXGzO5WZ0B_VT4xyMTPd8g'
6.	});

Perceba que o “mode” pode ser de duas formas:
•	“sandbox”: Para testes, os procedimentos feitos nessa conta não serão com dinheiro real.
•	“live”: Devemos colocar este modo quando concluirmos a aplicação, pois as vendas feitas nesse módulo serão autorizadas.
Além do mode devemos informar  ID e SECRET gerados no momento da criação da conta paypal. 

3.	Rota para pagamento

Para criar a rota de pagamento devemos:
o	Criar criar o formulário apóntando para a rota, perceba que o exemplo é de apenas o botão, que que fique claro como funciona a integração:
1.	<form action="/comprar" method="POST">
2.	<button>Comprar</button>
3.	</form>

o	Criar a tora de destino:
2.	app.post("/comprar", (req, res) =>{})

o	Enserir dentro da rota de destino a seguinte configuração do paypal:
3.	    var create_payment_json = {
4.	        "intent": "sale",
5.	        "payer": {
6.	            "payment_method": "paypal"
7.	        },
8.	        "redirect_urls": {
9.	            "return_url": "http://return.url",
10.	            "cancel_url": "http://cancel.url"
11.	        },
12.	        "transactions": [{
13.	            "item_list": {
14.	                "items": [{
15.	                    "name": "item",
16.	                    "sku": "item",
17.	                    "price": "1.00",
18.	                    "currency": "BRL",
19.	                    "quantity": 1
20.	                }]
21.	            },
22.	            "amount": {
23.	                "currency": "BRL",
24.	                "total": "1.00"
25.	            },
26.	            "description": "This is the payment description."
27.	        }]
28.	    };



Essas configurações são padrões e não podem ser auteradas, deste modo vamos entender oque é cada uma:
1.	“invent”: Informar a intenção da operação, no caso será venda”sale”:
2.	“payer”: Informar o método de pagamento será o paypal.
3.	“redirect_urls”: São as URL de redirecionamentos que o paypal retornará em caso de sucesso na operação ou de acontecer algum problema.
4.	“transations”: Recebe um array com os itens da operação, que no caso é a vensa, estes itens devem obrigatoriamenter conter os seguintes campos:
a.	“name”: nome do produto;
b.	“sku”: Código identificador do item;
c.	“price”: Preço unitário do produto;
d.	“currency”: moeda da operação;
e.	“quantity”: Quantidade de do determinado produto.
5.	“amount”:Dados totais da operação, que são:
a.	“currency”: moeda final de toda a venda;
b.	“total”: Deve ser equivalente ao total dos itens ;
6.	“description”: Descrição que vai aparecer na telado do usuário.

Após criar a estrutura de pagamento, devemos criar esse pagamento, da seguinte forma:

1.	paypal.payment.create(create_payment_json, (error, payment) =>{
2.	 	if (error) {
3.	 		console.log(error)
4.	 	}else{
5.	 		res.json(payment)
6.	 	}
7.	})

Usando o “paypal.payment.create” pódemos enviar a estrutura de pagamento criada anteriormente e um, callback, o callback receberá um possivel erro e o retorno do pagamento, usamos no exemplo um if para saber se terá algum erro, caso não, como é apenas um exemplo renderizamos o json do pagamento apenas para fim de teste, vejamos o retorno:


 
	
Dentro do retorno temos os dados da estrutura de pagamento que criamos anteriormente, um id do pagamento, o statuscode de resposta e os links de direcionamento do paypal.
Destre as rotas de direcionamento, recebemos a rota que devemos encaminhar o usuário no momento do pagamento, ao clicar no rota 1 o usuário será direcionado ao pagamento, sendo assim podemos fazer o seguinte procedimento:

1.	paypal.payment.create(create_payment_json, (error, payment) =>{
2.	 	if (error) {
3.	 	 	console.log(error)
4.	 	} else {
5.	   let pay = payment.links.find(pay => pay.rel == "approval_url")
6.	  	res.redirect(pay.href)
7.	 	}
8.	})

Como a resposta recebe um lin que é um array, podemos usar o metodo find para encontrar o link que tenha o “rel: aproval_url”

	E após receber este lik, podemos usar o metodo “res.redirect()”
	Para direcionar o usuário ao link especifico.

O usuário irá para a tela de login e aós isso entrara na seguinte tela: 
 


Recomento fazer login na conta pessoal do paypal que criamos no inicio desta documentação.

O paypal já adiciona um cartão ficticio para debug, mas perceba que ao clicar em continuar para finalizar o pagamento, não obtivemos resposta, isso se deve ao fato de ainda não termos adicionado na configuração do paypal a url de retorno.




4.	Rota de confirmação de pagamento

No tópico anterior vimos que ao confirmar o pagamento através da URL de retorno, antes de fazermos a rota precisamos entender que o paypal envia alguns dados na requisição que serão importantes para nós no momento da validação, vejamos:
http://return.url/?paymentId=PAYID-L3EYDLA47T51058RM862931R&token=EC-4YE48242TM104234R&PayerID=V5VTMXUD8QEZE 
Perceba nas duas duas partes destacadas na URL acima que recebemos o paymentid e o PayerID, e para conformar o pagamento precisaremos destes dados.

Agora que sabemos disso podemos dizer ao paypal qual será o url de retorno após p pagamento:
"redirect_urls": {
            "return_url": "http://mc:8000/final",
            "cancel_url": "http://cancel.url"
        },

Após isso criamos nossa rota, vejamos:
1.	app.get("/final", (req, res) =>{
2.	 	let payerId = req.query.PayerID
3.	 	let paymentId = req.query.paymentId
4.	 	let final = {
5.	 		"payer_id": payerId,
6.	 		"transactions": [{
7.	 		"amount": {
8.	 		"currency": "BRL",
9.	 		"total": "1.00"
10.	 		}
11.	 	  }]
12.	   }
13.	 	paypal.payment.execute(paymentId, final, (error, payment)=>{
14.	 		if (error) {
15.	 		console.log(error)
16.	 		}else{
17.	 		res.json(payment)
18.	 		}
19.	 	})
20.	})
Na linha 1 criamos um arquivo exatamente com a mesma rota indormado no arquivo de configuração, a pós isso criamos duas variaveis que recebem os valores informadoes nos parametros da URL informados pelo paypal, atraves do caminho “req.query.NOME ”, note que o nome deve ser o mesmo informado na URL.

Após isso devemos criar um unjeto que tenha exatamente essa estrutura, veja na linha 4, ele recebe o payerID e um array de tansations que recebe exatamente a mesma informação “amount” do arquivos de configurações.

Após isso usamos a função paypal.paymant.execute que recebe, o paymantid, o objeto recem criado e uma função de callback, essa função é capaz de receber o erro e o retorno do pagamento, novamente fazemos uma tratativa para saber se houve algum erro, caso não vamos printar na tela o json do pagamento:

 

Esse é o retorno, com dados da venda, status, dados do usuario, links entre outros. 


5.	Recebendo dados
Para receber dados de pagamento basta enserir os dados que deseja no formulário: 
6.	<form action="/comprar" method="POST">
7.	 	<input type="text" name="name" id="name">
8.	 	<input type="number" name="price" id="price">
9.	 	<input type="number" name="amount" id="amount">
10.	 	<input type="email" name="email" id="email">
11.	 	<input type="number" name="id" id="id">
12.	 	<button>Comprar</button>
13.	</form>

Depois disso receber essas informações na rota, e ensirir no arquivo de configurações:

1.	app.post("/comprar", (req, res) =>{
2.	let email = req.body.email
3.	let id = req.body.id
4.	let name = req.body.name
5.	let price = req.body.price
6.	let amount = req.body.amount
7.	let total= price * amount
8.	var create_payment_json = {
9.	 	"intent": "sale",
10.	 	"payer": {
11.	 	"payment_method": "paypal"
12.	 	},
13.	 	"redirect_urls": {
14.	 		"return_url": `http://mc:8000/final?total=${total}`,
15.	 		"cancel_url": "http://cancel.url"
16.	 	},
17.	 	"transactions": [{
18.	 		"item_list": {
19.	 		"items": [{
20.	 		"name": name,
21.	 		"sku": name,
22.	 		"price": price,
23.	 		"currency": "BRL",
24.	 		"quantity": amount
25.	 		}]
26.	 		},
27.	  		"amount": {
28.	 		"currency": "BRL",
29.	 		"total": total
30.	},
31.	 		"description": "This is the payment description."
32.	}]
33.	};


Perceba que entre as linhas 2 e 7 recebemos dados do formulário e criamos uma vriavel que receberá o valor do total, note agora que em todo a parte das configurações enserimos os dados do formulário recebido.

Atenção na linha 14, lá usamos o query params para enviar dados pela URL, como vamos precisar saber o valor total na rota de finalizar o pagamento, enserimos este valor lá, a partir disso basta receber esse valor na na proxima rota: 

1.	let total = req.query.total
2.	let final = {
3.	 	"payer_id": payerId,
4.	 	"transactions": [{
5.	 	"amount": {
6.	 	"currency": "BRL",
7.	 	"total": total
8.	 	 }
9.	 	}]
10.	 }

Agora o valor total do pagamento ficou dinâmico.











14.	Assinatura de planos
O processo de planos no paypal consiste em duas etapas, o primeiro é criar o plano, e depois a assinatura do mesmo, neste tópico vamos falar sobre a criação do plano.

Tal como na criação de um meio de pagamento, será necessário que criamos um JSON de configuração antes de enviar o mesmo ao paypal, vale ressaltar que o nome dos camps devem ter exatamente o mesmo nome informado abaixo, então vejamos:


15.	app.get("/create", (req, res)=>{
16.	 	var plan = {
17.	 		"name": "Plano",
18.	 		"description": "O melhor!",
19.	 		"merchant_preferences": {
20.	 		"auto_bill_amount": "yes",
21.	 		"cancel_url": "http://www.cancel.com",
22.	 		"initial_fail_amount_action": "continue",
23.	 		"max_fail_attempts": "1",
24.	 		"return_url": "http://www.success.com",
25.	 		"setup_fee": {
26.	 		"currency": "BRL",
27.	 		"value": "0"
28.	 		}
29.	 	 },
30.	 		"payment_definitions": [
31.	 	{
32.	 	"amount": {
33.	 	"currency": "BRL",
34.	 	"value": "0"
35.	 	},
36.	 	"cycles": "7",
37.	 	"frequency": "DAY",
38.	 	"frequency_interval": "1",
39.	 	"name": "Teste gratis",
40.	 	"type": "TRIAL"
41.	 	},
42.	 	{
43.	 	"amount": {
44.	 	"currency": "BRL",
45.	 	"value": "24"
46.	 	},
47.	 	"cycles": "12",
48.	 	"frequency": "MONTH",
49.	 	"frequency_interval": "1",
50.	 	"name": "Regular Prata",
51.	 	"type": "REGULAR"
52.	 	}
53.	 	],
54.	 	"type": "FIXED"
55.	}
56.	})

•	Na linha 17 o primeiro dado que informamos é o nome do plano.
•	Na linha 18 informamos a descrição do plano.
•	Na linha 19 iniciamosum novo objeto que conten: 
	Auto bill: Se o valor será cobrado automaticamento do cliente, por padrão deve-se sempre enserir yes, 
	URL de cancelamento: Para qual página o cliente será redirecionado caso ele cancelo o pagamento.
	Initial fail e max fail: são a quantidade de tentativas em passas o cartão antes de cancelar o plano, da maneira que está configurado o paipal tentará fazer a venda uma vez e então continuará.
	Retono url: é a url de retorno para quando o cliente pagar o plano.
	Setup fee: é um objeto que se aquivale a uma taxa extra que pode ser cobrada do cliente.
	Paymant definition é um array que recebe os siclos de pagamento do seu plano, exemplo, por vezes ao fazer uma assinatura você pode ganhar um periodo gratis antes da assinar, é aqui neste local que informamos o periodo e se será cobrado ou não, podemos ter ciclos regulares e ciclos triais, sendo que o cliclo trial voce pode ter apenas 1 e o ciclo regular você pode ter quantos desejar, esse array recebe um objeto que recebe:
•	 Amount: valor do plano;
•	Cycles: periodo;
•	Frequency: tipo de periodo;
•	Frequenci interval: Intervalo de cobrança;
•	Name: nome do ciclo;
•	Type: Tipo do clico.

	Type: Se será um siclo fixo ou infinito, caso o tipo seja infinito deveremos colocar 0 na opção cyclos do plano.

Para sincronizar o plano podemos usar a função: paypal.billing.create, a mesma receberá o objeto de configurações recem criado, e um callback que recebe o erro e o plano caso seja criado. 

1.	paypal.billingPlan.create(plan,(err, plan)=>{
2.	 	if (err) {
3.	 	res.json(err)
4.	} else {
5.	 	res.json(plan)
6.	 	}
7.	})

Ao acessar a rota do ultimo exemplo temos acesso ao plano criado.


 

15.Listar planos

57.	app.get("/list", (req, res)=>{
58.	 	paypal.billingPlan.list({}, (error, plans)=>{
59.	 	if (error) {
60.	 	 	res.json(error)
61.	 	}else{
62.	 	 	res.json(plans)
63.	 	 	}
64.	 	})
65.	 })


Para listar os planos podemos usar a função: paypal.billingplan.list, a mesma recebe um objeto que pode ser usado para filtrar os planos, e um callback que recebe os erros e os planos recebidos.
Ao Acessar a rota /list objtivemos o plano criado anteriormente.

  

16.	Atualizar planos

Para atualziar planos pode-se criar uma rota, recebem o o id do parametro na rota, dentro da rota criamos novamente um arquivo JSON com o os dados que devem ser alterados

1.	app.get("/active/:id", (req,res)=>{
2.	var update = [{
3.	 	"op": "replace",
4.	 	"path": "/",
5.	 	"value": {
6.	 	"state": "ACTIVE"
7.	 	}
8.	 }]
9.	paypal.billingPlan.update(req.params.id, update, (error, result)=>{
10.	if (error) {
11.	 	res.json(error)
12.	 	}else{
13.	 	res.json(result)
14.	 		}
15.	 	})
16.	 })

Este Json deve sempre receber:
•	Op: é o tipo de operação que sera feita.
•	Path: é onde essa informação deve ser incluida, como sabemos o arquivo de configuração tem varias profundidades, quando informamos “/” dizemos que a auteração que vamos fazer deverá ser feita na primeira profundidade do arquivo.
•	Value: receberá um objeto com todas as informaççoes que desejamos alterar. 

Basta acessar a rota acima com o ID do plano que o mesmo será acessado.




17.	Assinar planos

Para arrinar planos é umm processo bastante similar ao de efetirar uma venda, primeiro devemos receber os dados do formulário:

1.	<form action="/sub" method="POST">
2.	
3.	    <input type="email" name="email" id="email">
4.	
5.	    <button>Assinar</button>
6.	</form>

Como se trata de apenas um exemplo vamos informar apenas o email para prossegui, depois disso devemos criar a rota que assinará o plano:

1.	app.post("/sub", (req, res) => {
2.	    var email = req.body.email
3.	    let idPlane = "P-2S011666TK6719514IOHATRA"
4.	
5.	    var isoDate = new Date(Date.now())
6.	    isoDate.setSeconds(isoDate.getSeconds() + 4)
7.	    isoDate.toISOString().slice(0, 19) + 'Z'
8.	
9.	    let assign = {
10.	        "name": "Assinatura do plano prata",
11.	        "description": "Adiquiriu ao plano",
12.	        "start_date": isoDate,
13.	        "payer": {
14.	            "payment_method": "paypal"
15.	        },
16.	        "plan": {
17.	            "id": idPlane
18.	        },
19.	        "override_merchant_preferences":{
20.	            "return_url": `http://mc:8000/subreturn?email=${email}`,
21.	            "cancel_url": "http://mc:8000/"
22.	        }
23.	    }
24.	
25.	
26.	    paypal.billingAgreement.create(assign, (error, assign)=>{
27.	        if (error) {
28.	            res.json(error)
29.	        }else{
30.	            let link = assign.links.find(link => link.rel == "approval_url")
31.	            res.redirect(link.href)
32.	        }
33.	    })
34.	
35.	})
36.	


Perceba que nas linhas 2 e 3 salvamos o email e o id do plano em váriaveis, neste presente exemplo o plano tem o id fixo, mas logicamente em um caso real será importado tal como o emai.

Depois disso criamos uma data no modelo isoDate, pois é o único modelo que será aceito na validação.

O proximo passo será criar o JSON de configuração, este recebe o mesmo tipo de configuração que os demais citados neste documento, são eles: 
•	Name: nome do plano;
•	Description: Descrição do plano que aparecerá para o usuário no momento de adiquirir.
•	Start_date: A partir de quanto o o olano comelara a valer, vale ressaltar que spo aceitta o modelo isso date.
•	Payer: merodo que sera usado para o pagamemto.
•	Plan: informamos o id do plano.
•	“everride”: rotas de sucesso e de cancelamento no momento de assinar o contrato.

Após isso na linha 26 fazemos uso da função paypal.billing.create() para enviar os dados para a paypal, essa função recebe o arquivo de configuração e um callback, a função de callback pode receber o possível erro e o objeto de retorno, que no caso será:
 

Sendo assim como mostramos na linha 30 e 31, podemos percorrer o array links para obeter o link de aprovado para redirecionarmos o cliente para tela do paypal. 

Como mostrado no exxemplo anterior, configuramos a url de retorno para o caminho “subreturn”, então vamos a rota:

1.	app.get("/subreturn", (req, res)=>{
2.	    var email = req.query.email
3.	    var token = req.query.token
4.	
5.	    paypal.billingAgreement.execute(token, {}, (error, assign)=>{
6.	        if (error) {
7.	            res.json(error)
8.	        }else{
9.	            res.json(assign)
10.	        }
11.	    })
12.	    
13.	})

Buscamos o email e token a partir da url  e iniciamos a função paypal.billingAgreement.execute() para acessar assinar o plano no paypal, a mesma recebe o tolen, um objeto de filtro e um callback.

18.	Listando assinatura

19.	app.get("/info/:id", (req, res) => {
20.	    let id = req.params.id 
21.	
22.	    paypal.billingAgreement.get(id, (error, assign) =>{
23.	        if (error) {
24.	            res.json(error)
25.	        }else{
26.	            res.json(assign)
27.	        }
28.	    })
29.	})

Basta acessarmos uma rota com e informar o ID do plano, usamos a função paypal.billing.get e informamos o id e teremos o seguinte retorno:

 

 


30.	Cancelando assinatura
31.	app.get("/info/:id", (req, res) => {
32.	    let id = req.params.id 
33.	
34.	paypal.billingAgreement.cancel(id,{"note":"nota de esclarecidmento"}, (error, assign)
35.	=>{
36.	        if (error) {
37.	            res.json(error)
38.	        }else{
39.	            res.json(assign)
40.	        }
41.	    })
42.	})

Basta acessarmos uma rota com e informar o ID do plano, usamos a função paypal.billing.get e informamos o id,uma nota de esclarecimento e teremos o seguinte retorno e teremos o seguinte retorno:

