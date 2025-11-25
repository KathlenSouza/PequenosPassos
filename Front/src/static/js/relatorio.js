// SRC/STATIC/JS/relatorio.js
import { get } from "./conectaApi.js";

// ======================================================
// 🔹 CONTEXTO DA CRIANÇA (ID + nome + idade)
// ======================================================
function obterCriancaContexto() {
  // info detalhada
  let crianca = null;
  try {
    const raw = localStorage.getItem("pp_crianca");
    crianca = raw ? JSON.parse(raw) : null;
  } catch {
    crianca = null;
  }

  // id usada no resto do sistema
  const criancaId =
    localStorage.getItem("criancaSelecionadaId") ||
    (crianca && crianca.id) ||
    null;

  return {
    id: criancaId,
    nome: crianca?.nome || "Criança",
    dataNascimento: crianca?.dataNascimento || crianca?.nascimento || null,
  };
}

function calcularIdadeTexto(dataNascimento) {
  if (!dataNascimento) return "";

  const nasc = new Date(dataNascimento);
  const hoje = new Date();

  if (Number.isNaN(nasc.getTime())) return "";

  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  if (anos < 0) return "";

  if (anos === 0) return `${meses} mês(es)`;
  if (meses === 0) return `${anos} ano(s)`;
  return `${anos} ano(s) e ${meses} mês(es)`;
}

// ======================================================
// 🔹 CHAMADAS DE API POR CRIANÇA
// ======================================================
async function buscarHistorico(criancaCtx) {
  if (!criancaCtx.id) throw new Error("Nenhuma criança encontrada.");
  return await get(`/historico/crianca/${criancaCtx.id}`);
}

async function buscarPendentes(criancaCtx) {
  if (!criancaCtx.id) throw new Error("Nenhuma criança encontrada.");
  return await get(`/tarefas/pendentes/crianca/${criancaCtx.id}`);
}

async function buscarDiario(criancaCtx) {
  if (!criancaCtx.id) throw new Error("Nenhuma criança encontrada.");
  return await get(`/diario/crianca/${criancaCtx.id}`);
}

// Vacinas: ainda sem endpoint real (placeholder)
async function buscarVacinas() {
  return [];
}

// ======================================================
// 🔹 Helpers para montar HTML
// ======================================================
function montarSecao(titulo, conteudoHTML) {
  return `
    <section style="margin-top:28px;">
      <h2 style="
        margin:0 0 8px 0;
        font-size:18px;
        color:#2b3352;
        border-left:4px solid #6dd3f1ff;
        padding-left:8px;
      ">
        ${titulo}
      </h2>
      <div style="
        background:#fafbff;
        border-radius:12px;
        padding:12px 16px;
        border:1px solid #eef0ff;
        font-size:12px;
      ">
        ${conteudoHTML || "<em>Sem registros.</em>"}
      </div>
    </section>
  `;
}

function montarLista(lista, itemFn) {
  if (!lista || lista.length === 0) return "<em>Sem dados.</em>";
  return `<ul style="padding-left:18px; margin:0;">${lista
    .map(itemFn)
    .join("")}</ul>`;
}

function formatarDataHoraBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

function formatarDataBR(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

// ======================================================
// 🔹 Gerar Relatório (HTML para o PDF)
// ======================================================
async function gerarRelatorio() {
  const incluirConcluidas = document.getElementById("rDone").checked;
  const incluirPendentes = document.getElementById("rTodo").checked;
  const incluirDiario = document.getElementById("rDiary").checked;
  const incluirVacinas = document.getElementById("rVax").checked;

  const criancaCtx = obterCriancaContexto();

  if (!criancaCtx.id) {
    alert("Nenhuma criança selecionada. Volte ao início e selecione uma criança.");
    return;
  }

  const idadeTexto = calcularIdadeTexto(criancaCtx.dataNascimento);

  try {
    const resultados = await Promise.all([
      incluirConcluidas ? buscarHistorico(criancaCtx) : [],
      incluirPendentes ? buscarPendentes(criancaCtx) : [],
      incluirDiario ? buscarDiario(criancaCtx) : [],
      incluirVacinas ? buscarVacinas() : [],
    ]);

    const [concluidas, pendentes, diario, vacinas] = resultados;

    const html = `
      <div style="font-family:'Poppins',sans-serif; padding:32px; max-width:800px; color:#222;">

        <!-- CAPA / HEADER -->
        <header style="
  border-radius:18px;
  padding:20px 22px;
  background:#6dd3f1ff;
  color:#0f2f3b;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
">

          <div>
            <h1 style="margin:0; font-size:24px; font-weight:700;">
               Relatório — Pequenos Passos
            </h1>
            <p style="margin:6px 0 0 0; font-size:12px;">
              Panorama geral do desenvolvimento, atividades e registros emocionais.
            </p>
            <p style="margin:6px 0 0 0; font-size:11px; opacity:0.9;">
              Gerado em ${new Date().toLocaleString("pt-BR")}
            </p>
          </div>
          <div style="
            background:rgba(255,255,255,0.9);
            padding:10px 14px;
            border-radius:14px;
            font-size:11px;
            min-width:160px;
          ">
            <div style="font-weight:600; margin-bottom:4px;">
               Criança
            </div>
            <div><strong>Nome:</strong> ${criancaCtx.nome}</div>
            ${idadeTexto
        ? `<div><strong>Idade:</strong> ${idadeTexto}</div>`
        : ""
      }
            <div><strong>ID:</strong> ${criancaCtx.id}</div>
          </div>
        </header>

        <!-- CONTEÚDO -->
        <main style="font-size:13px; line-height:1.5; margin-top:18px;">

          ${incluirConcluidas
        ? montarSecao(
          "Atividades Concluídas",
          montarLista(concluidas, (a) => `
                    <li style="margin-bottom:6px;">
                      <strong>${a.tarefaTitulo || "Atividade"}</strong><br>
                      <small>${formatarDataHoraBR(a.dataConclusao)}</small><br>
                      Categoria: ${a.categoria || "-"}<br>
                      Área: ${a.areaDesenvolvimento || "-"}
                    </li>
                  `)
        )
        : ""
      }

          ${incluirPendentes
        ? montarSecao(
          "Atividades Pendentes",
          montarLista(pendentes, (a) => `
                    <li style="margin-bottom:6px;">
                      <strong>${a.titulo}</strong><br>
                      Categoria: ${a.categoria || "-"}<br>
                      Área: ${a.areaDesenvolvimento || "-"}
                    </li>
                  `)
        )
        : ""
      }

          ${incluirDiario
        ? montarSecao(
          "Diário Emocional",
          montarLista(diario, (d) => `
                    <li style="margin-bottom:6px;">
                      <strong>${formatarDataBR(d.dataRegistro)}</strong><br>
                      Emoção: ${d.emocao || "-"}<br>
                      Descrição: ${d.descricao || "-"}
                    </li>
                  `)
        )
        : ""
      }

          ${incluirVacinas
        ? montarSecao(
          "Calendário de Vacinas",
          vacinas && vacinas.length
            ? montarLista(vacinas, (v) => `
                        <li style="margin-bottom:4px;">
                          <strong>${v.nome}</strong> — ${v.status || "pendente"}
                        </li>
                      `)
            : "<em>Recurso ainda não disponível na API. Em breve!</em>"
        )
        : ""
      }

        </main>

        <footer style="margin-top:24px; font-size:10px; color:#777;">
          <hr style="border:none; border-top:1px solid #eee; margin-bottom:8px;">
          <div>Fonte: Plataforma Pequenos Passos</div>
        </footer>
      </div>
    `;

    exportarPDF(html);
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    alert("Erro ao gerar relatório: " + err.message);
  }
}

// ======================================================
// 🔹 Exportar PDF com jsPDF (ou fallback para nova aba)
// ======================================================
function exportarPDF(html) {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;

  // Se jsPDF não estiver disponível, abre em nova aba/print
  if (!jsPDF) {
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.html(html, {
    x: 24,
    y: 24,
    width: 550,
    callback: () => doc.save("relatorio-pequenos-passos.pdf"),
  });
}

// ======================================================
// 🔹 Inicialização
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnReport");
  if (btn) {
    btn.addEventListener("click", gerarRelatorio);
  }
});