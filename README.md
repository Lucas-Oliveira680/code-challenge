# GitHub User Search

Aplicação web para busca de usuários do GitHub com visualização de perfil e repositórios.

## Demo

**[https://code-challenge-lucas.netlify.app](https://code-challenge-lucas.netlify.app)**

## Funcionalidades

- **Busca de usuários** - Campo de busca com sugestões em tempo real
- **Perfil do usuário** - Exibe nome, username, bio, localização, seguidores, seguindo e total de estrelas
- **Lista de repositórios** - Exibe repositórios do usuário com nome, descrição, linguagem e estrelas
- **Detalhes do repositório** - Página dedicada com informações completas (estrelas, forks, watchers, tópicos, datas)
- **Ordenação** - Ordena repositórios por nome (A-Z, Z-A) ou estrelas (crescente, decrescente)
- **Scroll infinito** - Carrega mais repositórios automaticamente ao rolar a página
- **Buscas recentes** - Acesso rápido aos últimos usuários pesquisados
- **Suporte offline** - Notificação de conexão perdida e acesso a dados em cache
- **Design responsivo** - Funciona em desktop, tablet e mobile

## Tecnologias

- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática
- **React Router 7** - Roteamento SPA
- **Sass (SCSS)** - Estilização com pré-processador CSS
- **Vite** - Build tool e dev server
- **Vitest** - Testes unitários
- **React Testing Library** - Testes de componentes
- **Cypress** - Testes E2E

## Estrutura do Projeto

```
src/
├── core/                    # Configurações core (router)
├── features/                # Funcionalidades da aplicação
│   ├── search/              # Página de busca
│   │   ├── components/      # SearchBar, UserSuggestions, RecentSearches
│   │   └── Search.tsx
│   ├── results/             # Página de resultados
│   │   ├── components/      # UserCard, RepositoryCard, RepositoryList, SortModal
│   │   └── Results.tsx
│   └── repository/          # Página de detalhes do repositório
│       └── RepositoryDetails.tsx
├── shared/                  # Código compartilhado
│   ├── components/          # Loading, Toast, OfflineBanner, Header
│   ├── hooks/               # useGitHubSearch, useGitHubUser, useOnlineStatus
│   ├── services/            # github.service, cache.service, network.service
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Funções utilitárias (validation, formatting)
├── routes/                  # Configuração de rotas
└── test/                    # Setup de testes
```

## Como Executar

### Pré-requisitos

- Node.js 18+
- Yarn

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd code-challenge

# Instalar dependências
yarn install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
yarn dev
```

Acesse [http://localhost:5173](http://localhost:5173)

### Build

```bash
# Gerar build de produção
yarn build

# Visualizar build localmente
yarn preview
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Inicia o servidor de desenvolvimento |
| `yarn build` | Gera build de produção |
| `yarn preview` | Visualiza o build localmente |
| `yarn lint` | Executa o ESLint |
| `yarn test` | Executa testes unitários (watch mode) |
| `yarn test:run` | Executa testes unitários uma vez |
| `yarn test:coverage` | Executa testes com relatório de cobertura |
| `yarn cy:open` | Abre o Cypress em modo interativo |
| `yarn cy:run` | Executa testes E2E em modo headless |
| `yarn e2e` | Inicia o servidor e executa testes E2E |
| `yarn e2e:open` | Inicia o servidor e abre o Cypress |

## Testes

### Testes Unitários

```bash
# Executar testes
yarn test

# Com cobertura
yarn test:coverage
```

### Testes E2E

```bash
# Modo interativo
yarn e2e:open

# Modo headless
yarn e2e
```

## API

A aplicação utiliza a [GitHub REST API](https://docs.github.com/en/rest) para:

- Buscar usuários: `GET /search/users`
- Detalhes do usuário: `GET /users/{username}`
- Repositórios do usuário: `GET /users/{username}/repos`
- Detalhes do repositório: `GET /repos/{owner}/{repo}`

**Nota:** A API do GitHub possui limite de 60 requisições/hora para requisições não autenticadas.

## Acessibilidade

A aplicação foi desenvolvida seguindo práticas de acessibilidade:

- Navegação por teclado
- Atributos ARIA apropriados
- Hierarquia de headings
- Labels em formulários
- Feedback para leitores de tela
- Contraste adequado

## Decisões Técnicas

- **Session Storage para cache** - Armazena buscas recentes e dados de usuários para acesso offline e performance
- **Intersection Observer** - Implementação de scroll infinito compatível com mobile
- **Feature-based architecture** - Organização por funcionalidades para melhor escalabilidade
- **CSS Modules com SCSS** - Estilos isolados por componente com variáveis compartilhadas
