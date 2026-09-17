import { describe, expect, it } from "vitest";
import {
  aplicarDesconto,
  calcularDesconto,
  temDireitoADesconto,
} from "../src/desconto";

describe("RN03 — Desconto", () => {
  it("não aplica desconto em subtotal menor que R$ 100,00", () => {
    expect(calcularDesconto(99.99)).toBe(0);
    expect(aplicarDesconto(99.99)).toBe(99.99);
  });

  it("não aplica desconto em subtotal exatamente igual a R$ 100,00 (borda)", () => {
    expect(temDireitoADesconto(100)).toBe(false);
    expect(calcularDesconto(100)).toBe(0);
    expect(aplicarDesconto(100)).toBe(100);
  });

  it("aplica 10% logo acima de R$ 100,00 (borda)", () => {
    expect(temDireitoADesconto(100.01)).toBe(true);
    expect(aplicarDesconto(100.01)).toBe(90.01);
  });

  it("aplica 10% em subtotal de R$ 150,00", () => {
    expect(calcularDesconto(150)).toBe(15);
    expect(aplicarDesconto(150)).toBe(135);
  });

  it("não deixa resíduo de ponto flutuante no valor final", () => {
    expect(aplicarDesconto(133.33)).toBe(120);
  });

  it("aceita subtotal zero sem aplicar desconto", () => {
    expect(aplicarDesconto(0)).toBe(0);
  });

  it("RN04 — rejeita subtotal negativo", () => {
    expect(() => calcularDesconto(-1)).toThrowError(/não pode ser negativo/);
  });
});
