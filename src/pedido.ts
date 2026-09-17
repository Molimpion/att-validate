import { Cliente } from "./cliente";
import { aplicarDesconto, arredondarMoeda, calcularDesconto } from "./desconto";

export type StatusPedido =
  | "CRIADO"
  | "EM_PREPARACAO"
  | "PRONTO"
  | "ENTREGUE"
  | "CANCELADO";

export interface Produto {
  nome: string;
  preco: number;
}

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
}

/** Cardápio da lanchonete. */
export const CARDAPIO = {
  HAMBURGUER: { nome: "Hambúrguer", preco: 20 },
  BATATA: { nome: "Batata", preco: 10 },
  REFRIGERANTE: { nome: "Refrigerante", preco: 7 },
  SOBREMESA: { nome: "Sobremesa", preco: 8 },
} as const satisfies Record<string, Produto>;

/**
 * RN05/RN06/RN07 — máquina de estados.
 * ENTREGUE só é alcançável a partir de PRONTO (RN07).
 * ENTREGUE não tem transição para CANCELADO (RN06).
 * ENTREGUE e CANCELADO são estados finais.
 */
const TRANSICOES_PERMITIDAS: Record<StatusPedido, readonly StatusPedido[]> = {
  CRIADO: ["EM_PREPARACAO", "CANCELADO"],
  EM_PREPARACAO: ["PRONTO", "CANCELADO"],
  PRONTO: ["ENTREGUE", "CANCELADO"],
  ENTREGUE: [],
  CANCELADO: [],
};

export class Pedido {
  readonly cliente: Cliente;
  private readonly itens: ItemPedido[] = [];
  private status: StatusPedido = "CRIADO";

  constructor(cliente: Cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error("O pedido precisa estar vinculado a um cliente válido.");
    }
    this.cliente = cliente;
  }

  adicionarProduto(produto: Produto, quantidade = 1): void {
    if (this.status !== "CRIADO") {
      throw new Error(
        "Só é possível adicionar produtos a um pedido com status CRIADO.",
      );
    }

    // RN04 — não aceitar preço ou quantidade menor que zero.
    if (!produto || typeof produto.preco !== "number" || !Number.isFinite(produto.preco)) {
      throw new Error("O produto precisa possuir um preço válido.");
    }
    if (produto.preco < 0) {
      throw new Error("O preço do produto não pode ser negativo.");
    }
    if (!Number.isInteger(quantidade)) {
      throw new Error("A quantidade deve ser um número inteiro.");
    }
    if (quantidade <= 0) {
      throw new Error("A quantidade deve ser maior que zero.");
    }

    const existente = this.itens.find((item) => item.produto.nome === produto.nome);
    if (existente) {
      existente.quantidade += quantidade;
      return;
    }

    this.itens.push({ produto: { ...produto }, quantidade });
  }

  listarItens(): ReadonlyArray<ItemPedido> {
    return this.itens.map((item) => ({ ...item, produto: { ...item.produto } }));
  }

  quantidadeDeItens(): number {
    return this.itens.length;
  }

  calcularSubtotal(): number {
    const subtotal = this.itens.reduce(
      (acumulado, item) => acumulado + item.produto.preco * item.quantidade,
      0,
    );
    return arredondarMoeda(subtotal);
  }

  calcularDesconto(): number {
    return calcularDesconto(this.calcularSubtotal());
  }

  calcularValorFinal(): number {
    // RN02 — um pedido precisa possuir pelo menos um produto.
    this.garantirQueTemProduto();
    return aplicarDesconto(this.calcularSubtotal());
  }

  consultarStatus(): StatusPedido {
    return this.status;
  }

  alterarStatus(novoStatus: StatusPedido): void {
    const permitidos = TRANSICOES_PERMITIDAS[this.status];

    if (!permitidos) {
      throw new Error(`Status inválido: ${String(this.status)}.`);
    }
    if (!TRANSICOES_PERMITIDAS[novoStatus]) {
      throw new Error(`Status inválido: ${String(novoStatus)}.`);
    }

    // RN06 — um pedido entregue não pode ser cancelado.
    if (this.status === "ENTREGUE" && novoStatus === "CANCELADO") {
      throw new Error("Um pedido ENTREGUE não pode ser cancelado.");
    }

    // RN07 — só vai para ENTREGUE quem já está PRONTO.
    if (novoStatus === "ENTREGUE" && this.status !== "PRONTO") {
      throw new Error(
        "Um pedido só pode ser marcado como ENTREGUE depois de estar PRONTO.",
      );
    }

    if (!permitidos.includes(novoStatus)) {
      throw new Error(
        `Transição inválida: de ${this.status} para ${novoStatus}.`,
      );
    }

    // RN02 — não avança um pedido sem produtos (cancelar continua permitido).
    if (novoStatus !== "CANCELADO") {
      this.garantirQueTemProduto();
    }

    this.status = novoStatus;
  }

  cancelar(): void {
    this.alterarStatus("CANCELADO");
  }

  private garantirQueTemProduto(): void {
    if (this.itens.length === 0) {
      throw new Error("Um pedido precisa possuir pelo menos um produto.");
    }
  }
}
