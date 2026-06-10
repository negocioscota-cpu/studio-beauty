# Design de Integração — Emissão de NFS-e via Focus NFe

Este documento descreve a arquitetura, o fluxo de dados e as alterações na interface do usuário (UI) para integrar o provedor de nota fiscal **Focus NFe** ao sistema **Studio Beauty**.

---

## 📌 Visão Geral

A integração permitirá que cada estúdio emita Notas Fiscais de Serviço Eletrônicas (NFS-e) de forma controlada (manual sob demanda) diretamente a partir de agendamentos concluídos.

No modelo escolhido:
1. Cada estúdio contrata o serviço da **Focus NFe** de forma independente.
2. O estúdio faz o upload de seu próprio **Certificado Digital A1** diretamente no painel da Focus NFe.
3. O estúdio obtém seu **Token de API** no painel da Focus NFe e o insere no painel de configurações do **Studio Beauty**.
4. O **Studio Beauty** gerencia a coleta de dados cadastrais de clientes e fornece o botão de disparo de notas sob demanda.

---

## 🏛️ Arquitetura e Modelagem de Dados

### 1. Extensão de `studioConfig` (Firestore)
Armazenaremos as credenciais e parâmetros fiscais do estúdio em `/studioConfig/{studioUid}` sob o nó `focusNfeConfig`:

```json
{
  "focusNfeConfig": {
    "enabled": true,
    "token": "TOKEN_API_FOCUS_NFE_AQUI",
    "environment": "sandbox", // ou "production"
    "defaultCnae": "9602502", // Estética e outros serviços de cuidados com a beleza
    "defaultServiceDescription": "Prestação de serviços de embelezamento e cuidados com a beleza estética.",
    "issRate": 2.0, // Alíquota tributária padrão (em %)
    "taxRegime": 1 // 1: Simples Nacional, 2: MEI, 3: Lucro Presumido, etc.
  }
}
```

### 2. Extensão do Cadastro de Clientes (Firestore)
Adicionaremos dados opcionais de faturamento na ficha do cliente em `/studios/{studioUid}/clients/{clientId}`:

```json
{
  "fiscalData": {
    "cpfCnpj": "123.456.789-00",
    "address": {
      "zipCode": "01001-000",
      "street": "Praça da Sé",
      "number": "100",
      "complement": "Apto 12",
      "neighborhood": "Sé",
      "city": "São Paulo",
      "state": "SP"
    }
  }
}
```

### 3. Registro da Nota no Agendamento (Firestore)
Quando uma nota for emitida para um agendamento, salvaremos as informações de rastreamento no próprio documento do agendamento `/studios/{studioUid}/bookings/{bookingId}`:

```json
{
  "invoice": {
    "provider": "focus_nfe",
    "reference": "ref_booking_focus_123456",
    "status": "processing", // "authorized", "error", "processing"
    "pdfUrl": "https://api.focusnfe.com.br/...pdf",
    "xmlUrl": "https://api.focusnfe.com.br/...xml",
    "issuedAt": "2026-06-01T14:00:00Z",
    "errorMessage": null
  }
}
```

---

## 🎨 Alterações de Interface (UI)

### Módulo 1: Aba "Fiscal" nas Configurações (`pages/settings.js`)
Será adicionada uma nova seção chamada **"🧾 Emissão de Notas Fiscais (NFS-e)"** após o card de Pagamento Online:
*   **Toggle:** Ativar emissão de Notas Fiscais.
*   **Token Focus NFe:** Input do tipo senha (com botão de exibir/ocultar) para colar o token de API obtido no painel da Focus.
*   **Ambiente:** Select entre "Homologação (Testes)" e "Produção".
*   **Regime Tributário:** Select com as opções (Simples Nacional, MEI, Sociedade Profissional, etc.).
*   **CNAE de Serviço Padrão:** Input de texto ou select com os códigos de beleza mais comuns (ex: 9602-5/02).
*   **Alíquota ISS Padrão (%):** Input numérico para cálculo tributário básico.
*   **Descrição de Serviço Padrão:** Textarea contendo o texto padrão que irá constar na nota caso a profissional não altere na hora.

---

### Módulo 2: Dados Fiscais na Ficha de Clientes (`pages/clients.js`)
*   Na ficha de cadastro/edição de clientes, haverá uma aba ou subseção chamada **"Dados de Faturamento (Opcional para Nota Fiscal)"**.
*   Incluirá campos para: **CPF/CNPJ**, **CEP**, **Endereço**, **Número**, **Complemento**, **Bairro**, **Cidade** e **Estado (UF)**.
*   Um botão "Buscar CEP" automático (usando API pública ViaCEP) para preenchimento ágil.

---

### Módulo 3: Modal de Emissão nos Detalhes do Agendamento (`pages/schedule.js`)
Quando a profissional abrir um agendamento finalizado:
1. Se a Focus NFe estiver ativa, exibiremos um botão **"🧾 Emitir NFS-e"** próximo às informações de pagamento.
2. Ao clicar, abrirá um modal de confirmação:
   *   **Tomador (Cliente):** Exibe Nome, E-mail, CPF/CNPJ e Cidade/UF. Se o cliente não tiver CPF ou endereço cadastrado, os campos estarão vazios e habilitados para edição rápida diretamente no modal. Ao emitir, esses dados inseridos serão **salvos automaticamente** na ficha do cliente para emissões futuras.
   *   **Serviço:** Exibe o valor do agendamento (editável caso queira emitir nota de valor parcial ou diferente) e a descrição (ex: "Serviços de beleza e estética prestados em 01/06").
   *   **Ação:** Botão de destaque **"Confirmar e Enviar para Focus NFe"**.
3. Enquanto a nota estiver sendo processada, mostramos um status de **"Processando nota..."**. Quando autorizada, mostramos o ícone verde de sucesso e os botões de **"Ver PDF"** e **"Ver XML"**.

---

## ⚡ Fluxo de Integração e Cloud Functions

Implementaremos uma Cloud Function chamada `emitFocusNFSe`:

```
[Painel do Studio] ──► Chama Cloud Function [emitFocusNFSe] (com dados da nota e do cliente)
                                   │
                                   ▼
    [Cloud Function] ──► Consulta `focusNfeConfig` do estúdio no Firestore
                                   │
                                   ▼
    [Cloud Function] ──► Envia requisição POST para Focus NFe API (`/v2/nfse?ref=REF`)
                                   │
                                   ▼
          [Focus NFe] ──► Retorna código `201 Created` e status "processando"
                                   │
                                   ▼
    [Cloud Function] ──► Atualiza o booking com o status `processing` e a referência
```

Como as prefeituras podem demorar de alguns segundos a minutos para retornar o status final, a Cloud Function poderá consultar ou receber via Webhook o status definitivo e atualizar o Firestore para o estado final (`authorized` ou `error`).

---

## 🧪 Plano de Validação e Testes

1.  **Modo Homologação (Sandbox):** Testaremos todas as requisições usando o Token de Homologação da Focus NFe, que emite notas em ambiente de testes sem valor fiscal oficial.
2.  **Tratamento de Erros:** Validar a experiência visual quando a Focus NFe retornar erro (ex: CPF inválido, CNAE incompatível) garantindo que a profissional saiba exatamente o que corrigir.
