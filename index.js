const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const paypal = require("paypal-rest-sdk")

// View engine
app.set('view engine','ejs');

//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARyxr-iH54M-OkqtjUMkt-lTNuOZN0oocLkUgNh1lnFq4NMu4jgl-W6u4thlYbBe6QSDC1D1kLeZh_Fc',
    'client_secret': 'EIU3U-KkgfPt2rW312Ea4GDghYzJ0iuzmzNdkV7497yIMPnp8jYsL4xlbIPXGzO5WZ0B_VT4xyMTPd8g'
  });

app.get("/",(req, res) => {

    res.render("index");

});

app.post("/comprar", (req, res) =>{
    let email = req.body.email
    let id = req.body.id
    let name = req.body.name
    let price = req.body.price
    let amount = req.body.amount
    let total= price * amount
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://mc:8000/final?email=${email}&id=${id}&total=${total}`,
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": name,
                    "sku": name,
                    "price": price,
                    "currency": "BRL",
                    "quantity": amount
                }]
            },
            "amount": {
                "currency": "BRL",
                "total": total
            },
            "description": "This is the payment description."
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) =>{
        if (error) {
            console.log(error)
        }else{
            let pay = payment.links.find(pay => pay.rel == "approval_url")
            res.redirect(pay.href)
        }
    })

})


app.get("/final", (req, res) =>{
    let payerId = req.query.PayerID
    let paymentId = req.query.paymentId

    let clientId = req.query.id
    let clientEmail = req.query.email
    let total = req.query.total
    
    let final = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "BRL",
                "total": total
            }
        }]
    }
    paypal.payment.execute(paymentId, final, (error, payment)=>{
        if (error) {
            console.log(error)
        }else{
            res.json(payment)
        }
    })
})

app.get("/create", (req, res)=>{
    
    var plan = {
        "name": "Plano",
        "description": "O melhor!",
        "merchant_preferences": {
            "auto_bill_amount": "yes",
            "cancel_url": "http://www.cancel.com",
            "initial_fail_amount_action": "continue",
            "max_fail_attempts": "1",
            "return_url": "http://www.success.com",
            "setup_fee": {
                "currency": "BRL",
                "value": "0"
             }
        },
        "payment_definitions": [
            {
                "amount": {
                    "currency": "BRL",
                    "value": "0"
                },
                "cycles": "7",
                "frequency": "DAY",
                "frequency_interval": "1",
                "name": "Teste gratis",
                "type": "TRIAL"
            },
            {
                "amount": {
                    "currency": "BRL",
                    "value": "24"
                },
                "cycles": "12",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "name": "Regular Prata",
                "type": "REGULAR"
            }
        ],
        "type": "FIXED"
    }

    paypal.billingPlan.create(plan,(err, plan)=>{
        if (err) {
            res.json(err)
        }else{
            res.json(plan)
        }
    })
})

app.get("/list", (req, res)=>{

    paypal.billingPlan.list({'status': "ACTIVE"}, (error, plans)=>{
        if (error) {
            res.json(error)
        }else{
            res.json(plans)
        }
    })
})

app.get("/active/:id", (req,res)=>{

    var update = [{
        "op": "replace",
        "path": "/",
        "value": {
            "state": "ACTIVE"
        }
    }]
    paypal.billingPlan.update(req.params.id, update, (error, result)=>{
        if (error) {
            res.json(error)
        }else{
            res.json(result)
        }
    })
})



app.post("/sub", (req, res) => {
    var email = req.body.email
    let idPlane = "P-2S011666TK6719514IOHATRA"

    var isoDate = new Date(Date.now())
    isoDate.setSeconds(isoDate.getSeconds() + 4)
    isoDate.toISOString().slice(0, 19) + 'Z'

    let assign = {
        "name": "Assinatura do plano prata",
        "description": "Adiquiriu ao plano",
        "start_date": isoDate,
        "payer": {
            "payment_method": "paypal"
        },
        "plan": {
            "id": idPlane
        },
        "override_merchant_preferences":{
            "return_url": `http://mc:8000/subreturn?email=${email}`,
            "cancel_url": "http://mc:8000/"
        }

    }

    paypal.billingAgreement.create(assign, (error, assign)=>{
        if (error) {
            res.json(error)
        }else{
            let link = assign.links.find(link => link.rel == "approval_url")
            res.redirect(link.href)
        }
    })

})

app.get("/subreturn", (req, res)=>{
    let email = req.query.email
    let token = req.query.token

    paypal.billingAgreement.execute(token, {}, (error, assign)=>{
        if (error) {
            res.json(error)
        }else{
            res.json(assign)
        }
    })
    
})

app.get("/info/:id", (req, res) => {
    let id = req.params.id 

    paypal.billingAgreement.get(id, (error, assign) =>{
        if (error) {
            res.json(error)
        }else{
            res.json(assign)
        }
    })
})

app.get("/cancel/:id", (req, res) => {
    let id = req.params.id 

    paypal.billingAgreement.cancel(id,{"note":"nota de esclarecidmento"}, (error, assign) => {
        if (error) {
            res.json(error)
        }else{
            res.json("Assinatura cancelada")
        }
    })
})


app.listen(8000, () => {
    console.log("Running 8000!")
})

//I-Y46K0CF1WTJR