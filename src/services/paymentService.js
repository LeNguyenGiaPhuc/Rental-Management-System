class BankTransferStrategy {
    process(amount) {
        // Logic giả lập xử lý chuyển khoản ngân hàng
        return { success: true, method: 'Bank Transfer', message: `Chuyển khoản thành công: $${amount}` };
    }
}

class CreditCardStrategy {
    process(amount) {
        // Logic giả lập xử lý thẻ tín dụng
        return { success: true, method: 'Credit Card', message: `Thanh toán thẻ thành công: $${amount}` };
    }
}

class PaymentContext {
    constructor(method) {
        // Áp dụng Strategy Pattern dựa trên lựa chọn từ giao diện 
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