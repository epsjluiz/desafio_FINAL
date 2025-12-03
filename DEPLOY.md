# Guia de Deploy - GitHub Pages

## Pré-requisitos

1. Conta no GitHub
2. Repositório criado no GitHub
3. Node.js instalado
4. Projeto Angular configurado

## Método 1: Deploy Manual

### Passo 1: Build do Projeto

```bash
npm run build -- --base-href="/angular-project/"
```

**Nota**: Substitua `/angular-project/` pelo nome do seu repositório no GitHub.

### Passo 2: Instalar gh-pages (se necessário)

```bash
npm install --save-dev angular-cli-ghpages
```

### Passo 3: Deploy

```bash
npx angular-cli-ghpages --dir=dist/cosmeticos-angular
```

### Passo 4: Configurar GitHub Pages

1. Acesse seu repositório no GitHub
2. Vá em **Settings** > **Pages**
3. Em **Source**, selecione a branch `gh-pages`
4. Clique em **Save**

### Passo 5: Acessar o Site

O site estará disponível em:
```
https://[seu-usuario].github.io/angular-project/
```

## Método 2: Deploy Automático (GitHub Actions)

O projeto já inclui um workflow configurado (`.github/workflows/deploy.yml`).

### Passo 1: Fazer Push para GitHub

```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### Passo 2: Verificar o Workflow

1. Acesse seu repositório no GitHub
2. Vá na aba **Actions**
3. Verifique se o workflow foi executado com sucesso

### Passo 3: Configurar GitHub Pages

1. Vá em **Settings** > **Pages**
2. Selecione a branch `gh-pages` como source
3. Salve

## Importante: Backend

⚠️ **Atenção**: O GitHub Pages hospeda apenas arquivos estáticos. O backend (Express.js) não funcionará no GitHub Pages.

### Soluções para o Backend:

1. **Usar um serviço de backend separado**:
   - Heroku
   - Vercel
   - Railway
   - Render

2. **Para apresentação local**:
   - Execute o backend localmente: `npm run server`
   - Execute o frontend: `npm start`
   - Acesse: `http://localhost:4200`

3. **Para demonstração**:
   - Use dados mockados no frontend
   - Ou configure um backend em um serviço de hospedagem

## Troubleshooting

### Erro: "base-href not found"
- Certifique-se de usar o caminho correto do seu repositório
- O base-href deve corresponder ao nome do repositório

### Erro: "gh-pages branch not found"
- Execute o comando de deploy novamente
- Verifique se você tem permissões no repositório

### Site não carrega
- Verifique se a branch `gh-pages` foi criada
- Verifique se o GitHub Pages está configurado corretamente
- Aguarde alguns minutos para a propagação

## Estrutura de Arquivos no Deploy

Após o deploy, a estrutura será:
```
gh-pages/
├── index.html
├── main.[hash].js
├── polyfills.[hash].js
├── runtime.[hash].js
├── styles.[hash].css
└── assets/
    └── image/
        └── ...
```

## Atualizar o Deploy

Para atualizar o site após fazer mudanças:

1. Faça as alterações no código
2. Execute o build novamente
3. Execute o deploy novamente
4. Ou faça push para `main` (se usar GitHub Actions)

```bash
npm run build -- --base-href="/angular-project/"
npx angular-cli-ghpages --dir=dist/cosmeticos-angular
```

