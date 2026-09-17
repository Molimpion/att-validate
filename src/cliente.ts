/**
 * RN01 — Cliente
 * O nome do cliente não pode estar vazio e deve possuir ao menos 3 caracteres.
 */

export const NOME_TAMANHO_MINIMO = 3;

export class Cliente {
  readonly nome: string;

  constructor(nome: string) {
    const nomeNormalizado = typeof nome === "string" ? nome.trim() : "";

    if (nomeNormalizado.length === 0) {
      throw new Error("O nome do cliente não pode estar vazio.");
    }

    if (nomeNormalizado.length < NOME_TAMANHO_MINIMO) {
      throw new Error(
        `O nome do cliente deve possuir pelo menos ${NOME_TAMANHO_MINIMO} caracteres.`,
      );
    }

    this.nome = nomeNormalizado;
  }
}
