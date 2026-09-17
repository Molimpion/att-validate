/**
 * RN03 — Desconto
 * Pedidos ACIMA de R$ 100,00 recebem 10% de desconto.
 * Pedidos de R$ 100,00 ou menos não recebem desconto.
 */

export const LIMITE_PARA_DESCONTO = 100;
export const PERCENTUAL_DESCONTO = 0.1;

/** Arredonda para 2 casas, evitando ruído de ponto flutuante (ex.: 0.1 + 0.2). */
export function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function temDireitoADesconto(subtotal: number): boolean {
  validarSubtotal(subtotal);
  return subtotal > LIMITE_PARA_DESCONTO;
}

/** Retorna apenas o valor abatido (0 quando não há direito ao desconto). */
export function calcularDesconto(subtotal: number): number {
  if (!temDireitoADesconto(subtotal)) {
    return 0;
  }
  return arredondarMoeda(subtotal * PERCENTUAL_DESCONTO);
}

/** Retorna o valor final já com o desconto aplicado. */
export function aplicarDesconto(subtotal: number): number {
  return arredondarMoeda(subtotal - calcularDesconto(subtotal));
}

function validarSubtotal(subtotal: number): void {
  if (!Number.isFinite(subtotal)) {
    throw new Error("O subtotal deve ser um número válido.");
  }
  // RN04 — o sistema não aceita valores negativos.
  if (subtotal < 0) {
    throw new Error("O subtotal não pode ser negativo.");
  }
}
