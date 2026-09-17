import { beforeEach, describe, expect, it } from "vitest";
import { Cliente } from "../src/cliente";
import { CARDAPIO, Pedido, StatusPedido } from "../src/pedido";

function novoPedido(): Pedido {
  return new Pedido(new Cliente("Manoel"));
}

/** Avança o pedido até o status desejado por um caminho válido. */
function levarAte(pedido: Pedido, alvo: StatusPedido): Pedido {
  const caminho: StatusPedido[] = ["EM_PREPARACAO", "PRONTO", "ENTREGUE"];
  for (const status of caminho) {
    pedido.alterarStatus(status);
    if (status === alvo) break;
  }
  return pedido;
}

describe("Pedido — criação e itens", () => {
  let pedido: Pedido;

  beforeEach(() => {
    pedido = novoPedido();
  });

  it("nasce com status CRIADO e sem itens", () => {
    expect(pedido.consultarStatus()).toBe("CRIADO");
    expect(pedido.quantidadeDeItens()).toBe(0);
  });

  it("exige um cliente válido", () => {
    // @ts-expect-error validação em tempo de execução
    expect(() => new Pedido(null)).toThrowError(/cliente válido/);
  });

  it("adiciona um produto ao pedido", () => {
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER);
    expect(pedido.quantidadeDeItens()).toBe(1);
    expect(pedido.listarItens()[0].quantidade).toBe(1);
  });

  it("agrupa o mesmo produto somando a quantidade", () => {
    pedido.adicionarProduto(CARDAPIO.BATATA, 2);
    pedido.adicionarProduto(CARDAPIO.BATATA, 3);
    expect(pedido.quantidadeDeItens()).toBe(1);
    expect(pedido.listarItens()[0].quantidade).toBe(5);
  });

  it("não permite alterar os itens por fora da classe", () => {
    pedido.adicionarProduto(CARDAPIO.BATATA, 1);
    const itens = pedido.listarItens();
    itens[0].quantidade = 999;
    expect(pedido.listarItens()[0].quantidade).toBe(1);
  });

  it("não aceita adicionar produtos depois que o pedido saiu de CRIADO", () => {
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER);
    pedido.alterarStatus("EM_PREPARACAO");
    expect(() => pedido.adicionarProduto(CARDAPIO.BATATA)).toThrowError(
      /status CRIADO/,
    );
  });
});

describe("RN04 — Valor negativo", () => {
  let pedido: Pedido;

  beforeEach(() => {
    pedido = novoPedido();
  });

  it("rejeita produto com preço negativo", () => {
    expect(() =>
      pedido.adicionarProduto({ nome: "Combo quebrado", preco: -1 }),
    ).toThrowError(/preço do produto não pode ser negativo/);
  });

  it("rejeita quantidade negativa", () => {
    expect(() => pedido.adicionarProduto(CARDAPIO.BATATA, -2)).toThrowError(
      /quantidade deve ser maior que zero/,
    );
  });

  it("rejeita quantidade zero", () => {
    expect(() => pedido.adicionarProduto(CARDAPIO.BATATA, 0)).toThrowError(
      /quantidade deve ser maior que zero/,
    );
  });

  it("rejeita quantidade fracionada", () => {
    expect(() => pedido.adicionarProduto(CARDAPIO.BATATA, 1.5)).toThrowError(
      /número inteiro/,
    );
  });

  it("nada é adicionado quando a validação falha", () => {
    expect(() => pedido.adicionarProduto(CARDAPIO.BATATA, -1)).toThrow();
    expect(pedido.quantidadeDeItens()).toBe(0);
  });
});

describe("Cálculo de subtotal e valor final", () => {
  let pedido: Pedido;

  beforeEach(() => {
    pedido = novoPedido();
  });

  it("calcula o subtotal somando preço × quantidade", () => {
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER, 2); // 40
    pedido.adicionarProduto(CARDAPIO.REFRIGERANTE, 2); // 14
    expect(pedido.calcularSubtotal()).toBe(54);
  });

  it("não aplica desconto quando o subtotal é exatamente R$ 100,00", () => {
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER, 5); // 100
    expect(pedido.calcularDesconto()).toBe(0);
    expect(pedido.calcularValorFinal()).toBe(100);
  });

  it("aplica 10% quando o subtotal passa de R$ 100,00", () => {
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER, 3); // 60
    pedido.adicionarProduto(CARDAPIO.BATATA, 2); // 20
    pedido.adicionarProduto(CARDAPIO.REFRIGERANTE, 2); // 14
    pedido.adicionarProduto(CARDAPIO.SOBREMESA, 1); // 8
    expect(pedido.calcularSubtotal()).toBe(102);
    expect(pedido.calcularDesconto()).toBe(10.2);
    expect(pedido.calcularValorFinal()).toBe(91.8);
  });

  it("RN02 — não calcula valor final de pedido sem produtos", () => {
    expect(() => pedido.calcularValorFinal()).toThrowError(
      /pelo menos um produto/,
    );
  });
});

describe("RN05/RN07 — Status e fluxo do pedido", () => {
  let pedido: Pedido;

  beforeEach(() => {
    pedido = novoPedido();
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER);
  });

  it("consulta o status atual", () => {
    expect(pedido.consultarStatus()).toBe("CRIADO");
  });

  it("percorre o fluxo feliz CRIADO → EM_PREPARACAO → PRONTO → ENTREGUE", () => {
    pedido.alterarStatus("EM_PREPARACAO");
    expect(pedido.consultarStatus()).toBe("EM_PREPARACAO");
    pedido.alterarStatus("PRONTO");
    expect(pedido.consultarStatus()).toBe("PRONTO");
    pedido.alterarStatus("ENTREGUE");
    expect(pedido.consultarStatus()).toBe("ENTREGUE");
  });

  it("RN07 — não entrega um pedido que ainda está CRIADO", () => {
    expect(() => pedido.alterarStatus("ENTREGUE")).toThrowError(
      /depois de estar PRONTO/,
    );
    expect(pedido.consultarStatus()).toBe("CRIADO");
  });

  it("RN07 — não entrega um pedido que está EM_PREPARACAO", () => {
    pedido.alterarStatus("EM_PREPARACAO");
    expect(() => pedido.alterarStatus("ENTREGUE")).toThrowError(
      /depois de estar PRONTO/,
    );
  });

  it("não pula etapas de CRIADO para PRONTO", () => {
    expect(() => pedido.alterarStatus("PRONTO")).toThrowError(
      /Transição inválida/,
    );
  });

  it("não volta de PRONTO para EM_PREPARACAO", () => {
    levarAte(pedido, "PRONTO");
    expect(() => pedido.alterarStatus("EM_PREPARACAO")).toThrowError(
      /Transição inválida/,
    );
  });

  it("rejeita status inexistente", () => {
    // @ts-expect-error validação em tempo de execução
    expect(() => pedido.alterarStatus("FINALIZADO")).toThrowError(
      /Status inválido/,
    );
  });

  it("RN02 — pedido sem produtos não sai de CRIADO", () => {
    const vazio = novoPedido();
    expect(() => vazio.alterarStatus("EM_PREPARACAO")).toThrowError(
      /pelo menos um produto/,
    );
  });
});

describe("RN06 — Cancelamento", () => {
  let pedido: Pedido;

  beforeEach(() => {
    pedido = novoPedido();
    pedido.adicionarProduto(CARDAPIO.HAMBURGUER);
  });

  it("cancela um pedido CRIADO", () => {
    pedido.cancelar();
    expect(pedido.consultarStatus()).toBe("CANCELADO");
  });

  it("cancela um pedido EM_PREPARACAO", () => {
    levarAte(pedido, "EM_PREPARACAO");
    pedido.cancelar();
    expect(pedido.consultarStatus()).toBe("CANCELADO");
  });

  it("cancela um pedido PRONTO", () => {
    levarAte(pedido, "PRONTO");
    pedido.cancelar();
    expect(pedido.consultarStatus()).toBe("CANCELADO");
  });

  it("cancela um pedido vazio (RN02 não bloqueia cancelamento)", () => {
    const vazio = novoPedido();
    vazio.cancelar();
    expect(vazio.consultarStatus()).toBe("CANCELADO");
  });

  it("não cancela um pedido ENTREGUE", () => {
    levarAte(pedido, "ENTREGUE");
    expect(() => pedido.cancelar()).toThrowError(
      /ENTREGUE não pode ser cancelado/,
    );
    expect(pedido.consultarStatus()).toBe("ENTREGUE");
  });

  it("não reativa um pedido CANCELADO", () => {
    pedido.cancelar();
    expect(() => pedido.alterarStatus("EM_PREPARACAO")).toThrowError(
      /Transição inválida/,
    );
  });
});
