# Migração do fnm para nvm no Servidor

## Passo 1: Instalar o nvm

Execute no servidor:

```bash
# Baixar e instalar o nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Ou usando wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

## Passo 2: Carregar o nvm no shell atual

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Passo 3: Adicionar nvm ao ~/.bashrc (ou ~/.zshrc)

```bash
# Adicionar ao final do arquivo
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc

# Recarregar o shell
source ~/.bashrc
```

## Passo 4: Instalar a versão do Node.js que você precisa

```bash
# Verificar qual versão você estava usando com fnm
# (você mencionou v22.15.0)

# Instalar Node.js v22.15.0 com nvm
nvm install 22.15.0

# Ou instalar a versão LTS mais recente
nvm install --lts

# Definir como versão padrão
nvm use 22.15.0
nvm alias default 22.15.0
```

## Passo 5: Habilitar corepack e preparar pnpm

```bash
# Habilitar corepack
corepack enable

# Preparar a versão do pnpm especificada no package.json
corepack prepare pnpm@10.12.1 --activate

# Verificar se está funcionando
which pnpm
pnpm --version
```

## Passo 6: Verificar caminhos

```bash
# Verificar caminho do Node.js
which node
# Deve retornar algo como: /home/usuario/.nvm/versions/node/v22.15.0/bin/node

# Verificar caminho do pnpm
which pnpm
# Deve retornar algo como: /home/usuario/.nvm/versions/node/v22.15.0/bin/pnpm

# Verificar caminho do corepack
which corepack
# Deve retornar algo como: /home/usuario/.nvm/versions/node/v22.15.0/bin/corepack
```

## Passo 7: Atualizar o ecosystem.config.cjs

Após verificar os caminhos, atualize o `ecosystem.config.cjs` para usar o caminho permanente do nvm:

```javascript
const path = require('path');

module.exports = {
    apps: [
        {
            name: "Blog",
            script: 'pnpm',
            args: 'start',
            interpreter: process.env.HOME + '/.nvm/versions/node/v22.15.0/bin/node',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production',
                PATH: process.env.HOME + '/.nvm/versions/node/v22.15.0/bin:' + process.env.PATH
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '1G'
        }
    ]
};
```

**Importante**: Substitua `v22.15.0` pela versão exata que você instalou no Passo 4.

## Passo 8: Reiniciar o PM2

```bash
# Parar todos os processos
pm2 stop all
pm2 delete all

# Iniciar com a nova configuração
pm2 start ecosystem.config.cjs

# Salvar a configuração
pm2 save

# Verificar se está funcionando
pm2 logs Blog
pm2 status
```

## Passo 9: (Opcional) Remover o fnm

Se quiser remover o fnm completamente:

```bash
# Remover do ~/.bashrc ou ~/.zshrc
# Edite o arquivo e remova as linhas relacionadas ao fnm

# Remover o diretório do fnm (se quiser)
rm -rf ~/.fnm
```

## Verificação Final

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do pnpm
pnpm --version

# Verificar se o PM2 está rodando
pm2 status

# Ver logs do PM2
pm2 logs Blog
```

## Troubleshooting

### Se o PM2 ainda não encontrar o pnpm:

1. Verifique o caminho exato:
   ```bash
   echo ~/.nvm/versions/node/v22.15.0/bin/pnpm
   ```

2. Use o caminho absoluto no `ecosystem.config.cjs`:
   ```javascript
   script: process.env.HOME + '/.nvm/versions/node/v22.15.0/bin/pnpm',
   args: 'start',
   ```

### Se o nvm não carregar no PM2:

Use um script wrapper simples:

```bash
# Criar script: scripts/start.sh
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /caminho/absoluto/do/projeto
exec pnpm start
```

E no `ecosystem.config.cjs`:
```javascript
script: path.join(__dirname, 'scripts', 'start.sh'),
interpreter: '/bin/bash',
```

