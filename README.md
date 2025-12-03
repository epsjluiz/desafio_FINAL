# Projeto Cosméticos - Angular

Este é um projeto Angular convertido do projeto Vue.js original. É uma aplicação de e-commerce para produtos de cosméticos.

## Funcionalidades

- **Home**: Página inicial com produtos em destaque
- **Shop**: Listagem de todos os produtos disponíveis
- **Login**: Sistema de autenticação (admin/123456)
- **Cadastro**: Cadastro de novos produtos (requer autenticação)
- **Listagem**: Lista de produtos com opções de editar e excluir (requer autenticação)
- **Editar Produto**: Edição de produtos existentes (requer autenticação)

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor backend (em um terminal separado):
```bash
npm run server
```

3. Inicie o servidor de desenvolvimento Angular (em outro terminal):
```bash
npm start
```

4. Acesse a aplicação em `http://localhost:4200`

## Credenciais de Login

- **Usuário**: admin
- **Senha**: 123456

## Estrutura do Projeto

```
angular-project/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes da aplicação
│   │   ├── services/        # Serviços (Auth, Produto)
│   │   ├── guards/          # Guards de autenticação
│   │   └── app.module.ts   # Módulo principal
│   ├── assets/             # Imagens e recursos estáticos
│   └── styles.css          # Estilos globais
├── server.js              # Servidor backend Express
└── produtos.db            # Banco de dados SQLite
```

## Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run server`: Inicia o servidor backend

## Deploy no GitHub Pages

### Passo a Passo

1. **Build do projeto para produção**:
```bash
npm run build -- --base-href="/angular-project/"
```

2. **Instalar o gh-pages** (se necessário):
```bash
npm install --save-dev angular-cli-ghpages
```

3. **Deploy**:
```bash
npx angular-cli-ghpages --dir=dist/cosmeticos-angular
```

4. **Configurar no GitHub**:
   - Vá em Settings > Pages
   - Selecione a branch `gh-pages` como source
   - O site estará disponível em: `https://[seu-usuario].github.io/angular-project/`

### Deploy Automático (GitHub Actions)

O projeto inclui um workflow do GitHub Actions (`.github/workflows/deploy.yml`) que faz o deploy automaticamente quando você faz push na branch `main`.

## Tecnologias Utilizadas

- Angular 17
- TypeScript
- Bootstrap 5
- Express.js
- SQLite3
- Font Awesome
- Material Icons

## Estrutura de Aprendizados

O projeto demonstra conhecimentos em:
- ✅ Matemática aplicada (cálculos de preços)
- ✅ Inglês técnico (terminologia)
- ✅ Versionamento (Git/GitHub)
- ✅ HTML5 & CSS3 (estrutura e estilização)
- ✅ JavaScript/TypeScript (programação)
- ✅ LGPD (proteção de dados)
- ✅ Angular Framework (componentes, serviços, roteamento)

## Documentação de Apresentação

Consulte o arquivo `APRESENTACAO.md` para um guia completo de apresentação do projeto.

