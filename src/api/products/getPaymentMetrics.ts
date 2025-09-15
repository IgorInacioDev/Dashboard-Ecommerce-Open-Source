// Funcionalidade de métricas de pagamento removida
// Será implementada no futuro

export interface PaymentMetrics {
  message: string;
  implemented: boolean;
}

/**
 * Placeholder para métricas de pagamento
 * @returns Promise<PaymentMetrics> Mensagem de implementação futura
 */
export async function getPaymentMetrics(): Promise<PaymentMetrics> {
  return {
    message: "Funcionalidade de métricas de pagamento será implementada em breve",
    implemented: false
  };
}