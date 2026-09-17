# Projeto Testes — Controle de Pedidos de Lanchonete

Sistema em TypeScript com testes unitários (Vitest) cobrindo as regras de negócio RN01 a RN07.

## Como rodar

```bash
npm install
npm test              # roda a suíte uma vez
npm run test:watch    # modo watch
npm run test:coverage # relatório de cobertura
npm run typecheck     # checagem de tipos
```

## Estrutura

```
projeto-testes/
├── src/
│   ├── cliente.ts    # RN01 — validação do nome
│   ├── pedido.ts     # RN02, RN04, RN05, RN06, RN07 — itens, cálculo e máquina de estados
│   └── desconto.ts   # RN03 — regra de desconto isolada
├── tests/
│   ├── cliente.test.ts
│   ├── pedido.test.ts
│   └── desconto.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Cardápio

| Produto      | Preço     |
| ------------ | --------- |
| Hambúrguer   | R$ 20,00  |
| Batata       | R$ 10,00  |
| Refrigerante | R$ 7,00   |
| Sobremesa    | R$ 8,00   |

## Máquina de estados (RN05, RN06, RN07)

```
CRIADO ──────► EM_PREPARACAO ──────► PRONTO ──────► ENTREGUE (final)
   │                 │                  │
   └─────────────────┴──────────────────┴──────────► CANCELADO (final)
```

- `ENTREGUE` só é alcançável a partir de `PRONTO` (RN07).
- `ENTREGUE` não possui transição para `CANCELADO` (RN06).
- `ENTREGUE` e `CANCELADO` são estados finais: não há retorno nem reativação.

## Decisões de interpretação

O enunciado deixa alguns pontos em aberto. Foram fechados assim:

1. **RN03 — "acima de R$ 100,00"** foi lido como estritamente maior (`subtotal > 100`).
   R$ 100,00 exatos não recebem desconto. Há teste dedicado para essa borda e para R$ 100,01.
2. **RN04 — quantidade zero** é rejeitada. O texto proíbe apenas valores "menores que zero",
   mas um item com quantidade 0 não representa nada no domínio. Preço 0 continua válido
   (brinde/cortesia). Quantidade fracionada também é rejeitada.
3. **RN02 — momento da validação.** Um pedido nasce vazio, então a regra não pode ser
   aplicada na construção. Ela é verificada ao avançar o status e ao calcular o valor final.
   O cancelamento de um pedido vazio continua permitido (é o caminho natural de descarte).
4. **Itens são imutáveis após sair de `CRIADO`.** Editar o carrinho de um pedido já em
   preparação mudaria o valor cobrado depois do fechamento.
5. **Arredondamento monetário** para 2 casas em toda operação de valor, evitando resíduo de
   ponto flutuante (ex.: `133.33 * 0.9 = 119.99999…`). Para um sistema real com dinheiro,
   o correto seria trabalhar com centavos em inteiro ou uma biblioteca decimal.

## Cobertura de testes

43 testes distribuídos em:

- **RN01**: nome vazio, só espaços, 2 caracteres, exatamente 3 (borda), normalização.
- **RN02**: pedido vazio não avança de status nem calcula valor final; cancelamento permitido.
- **RN03**: abaixo, exatamente em R$ 100,00 (borda), logo acima (borda), arredondamento.
- **RN04**: preço negativo, quantidade negativa, zero e fracionada; estado não é corrompido.
- **RN05**: fluxo feliz completo, salto de etapa, retrocesso, status inexistente.
- **RN06**: cancelamento em cada estado permitido e bloqueio após entrega.
- **RN07**: tentativa de entrega a partir de `CRIADO` e de `EM_PREPARACAO`.
