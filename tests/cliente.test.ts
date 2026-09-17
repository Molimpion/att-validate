import { describe, expect, it } from "vitest";
import { Cliente } from "../src/cliente";

describe("RN01 — Cliente", () => {
  it("cria um cliente com nome válido", () => {
    const cliente = new Cliente("Ana");
    expect(cliente.nome).toBe("Ana");
  });

  it("rejeita nome vazio", () => {
    expect(() => new Cliente("")).toThrowError(/não pode estar vazio/);
  });

  it("rejeita nome composto apenas por espaços", () => {
    expect(() => new Cliente("   ")).toThrowError(/não pode estar vazio/);
  });

  it("rejeita nome com menos de 3 caracteres", () => {
    expect(() => new Cliente("Jo")).toThrowError(/pelo menos 3 caracteres/);
  });

  it("aceita nome com exatamente 3 caracteres (borda)", () => {
    expect(new Cliente("Ana").nome).toBe("Ana");
  });

  it("não conta espaços das pontas no tamanho mínimo", () => {
    expect(() => new Cliente("  Jo  ")).toThrowError(/pelo menos 3 caracteres/);
  });

  it("normaliza o nome removendo espaços das pontas", () => {
    expect(new Cliente("  Manoel  ").nome).toBe("Manoel");
  });
});
