const stripe = require('stripe')(process.env.StripeSecretKey);

const constantObj = require("../config/Constants");

exports.AddCreditCard = async function (req, res) {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(
            req.body.paymentMethod,
            { customer: req.body.customerId }
        );

        return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.CreditCard
        });
    } catch (error) {
        return res.jsonp({
            'status': 'error',
            'messageId': 201,
            'message': error.message
        })
    }
}

exports.DeleteCreditCard = async function (req, res) {
    try {
        const paymentMethod = await stripe.paymentMethods.detach(
            req.body.paymentMethod
        );
        return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.CreditCardDelete
        });
    } catch (error) {
        return res.jsonp({
            'status': 'error',
            'messageId': 201,
            'message': error.message
        })
    }
}

exports.GetCreditCards = async function (req, res) {
    try {
        const cards = await stripe.paymentMethods.list({
            customer: req.body.customerId,
            type: 'card'
        });
        return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.SuccessRetreivingData,
            'data': cards.data
        });
    } catch (error) {
        return res.jsonp({
            'status': 'error',
            'messageId': 201,
            'message': error.message
        })
    }
}