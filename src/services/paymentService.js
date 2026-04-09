class BankTransferStrategy {
    process(amount) {
        return { success: true, method: 'Bank Transfer', message: `Bank transfer successful: $${amount}` };
    }
}

class CreditCardStrategy {
    process(amount) {
        return { success: true, method: 'Credit Card', message: `Card payment successful: $${amount}` };
    }
}

class PaymentContext {
    constructor(method) {
        if (method === 'Bank Transfer') {
            this.strategy = new BankTransferStrategy();
        } else if (method === 'Credit Card') {
            this.strategy = new CreditCardStrategy();
        } else {
            this.strategy = new BankTransferStrategy(); 
        }
    }

    execute(amount) {
        return this.strategy.process(amount);
    }
}

module.exports = PaymentContext;