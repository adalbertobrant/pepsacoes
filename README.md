# Calculadora de Preço Médio de Ações (PEPS)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)

Uma aplicação web para análise de carteira de ações que utiliza o método PEPS (Primeiro que Entra, Primeiro que Sai), desenvolvida para o mercado de ações brasileiro.

O frontend é construído com **React (Vite) e TypeScript**, e o backend com **Python e FastAPI**.

## ✨ Funcionalidades

- **Upload de Arquivo CSV:** Envie seu histórico de transações (compras e vendas).
- **Cálculo PEPS:** Processa as transações e calcula a posição atual da carteira.
- **Cotações em Tempo Real:** O backend busca os preços atuais das ações na B3.
- **Análise Completa de Portfólio:** Resumo da carteira com quantidade, valor investido, preço médio e lucro/prejuízo.
- **Visualização Detalhada:** Tabela de posições e histórico completo de transações.

## 🚀 Guia de Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Python](https://www.python.org/) (versão 3.9 ou superior)

### 1. Clone o Repositório

```bash
git clone https://github.com/adalbertobrant/pepsacoes.git
cd pepsacoes
```

### 2. Configure o Backend (Servidor Python)

```bash
# Navegue até o diretório do backend
cd backend

# Crie e ative um ambiente virtual
python3 -m venv .venv
source .venv/bin/activate  # No Windows, use: .venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Volte para a raiz do projeto
cd ..
```

### 3. Configure o Frontend (Cliente React)

```bash
# Instale as dependências do Node.js (já na raiz do projeto)
npm install
```

### 4. Execute a Aplicação (Modo Desenvolvimento)

Após a instalação, você pode iniciar os servidores frontend e backend com um único comando. Este comando utilizará o `concurrently` para gerenciar os dois processos.

```bash
npm run dev:full
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:8000`.

---

## 🛠️ Execução Manual

Se preferir iniciar os servidores separadamente:

- **Para o Backend:**
  ```bash
  cd backend
  source .venv/bin/activate
  uvicorn main:app --reload
  ```

- **Para o Frontend:**
  ```bash
  npm run dev
  ```

---

## ⚠️ Considerações de Segurança

Este projeto é uma ferramenta de análise. Antes de usar em produção ou com dados sensíveis, é fundamental considerar os seguintes pontos:

**1. Auditoria de Dependências (MUITO IMPORTANTE)**
As dependências de software podem conter vulnerabilidades. Audite regularmente os pacotes do projeto para identificar e corrigir falhas de segurança conhecidas.

- **Frontend:**
  ```bash
  npm audit
  ```

- **Backend:**
  ```bash
  # Dentro do ambiente virtual ativado
  pip install pip-audit
  pip-audit
  ```

**2. Variáveis de Ambiente para Segredos**
Nunca adicione chaves de API, senhas ou outros segredos diretamente no código. Se o projeto evoluir para usar serviços externos, utilize arquivos `.env` para carregar essas informações de forma segura no ambiente, especialmente no backend.

**3. Configuração de CORS em Produção**
O backend (`backend/main.py`) está configurado para permitir requisições de `localhost`. Em um ambiente de produção, você **deve** restringir as origens permitidas (`allow_origins`) apenas ao domínio do seu frontend para evitar o uso não autorizado da sua API.
