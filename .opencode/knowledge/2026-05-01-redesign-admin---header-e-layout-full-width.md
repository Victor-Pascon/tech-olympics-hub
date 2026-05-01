# Pattern: Redesign Admin - Header e Layout Full-Width

## Data
01/05/2026, 00:11:00

## Categoria
pattern

## Descrição
Header.tsx refatorado para detectar admin via rota /admin + useAuth. Quando admin logado: (1) remove botoes Inicio/Sobre/Contato/Cadastre-se, (2) mostra header minimalista com logo + hamburger menu (Sheet), (3) hamburger exibe usuario (nome/email) primeiro, depois 12 modulos do admin, (4) botao Sair. Custom events admin-tab-change permitem navegar entre tabs via header. AdminDashboard agora usa layout full-width responsivo (max-w-[1600px]) com tabs de icones em telas pequenas. Build e testes OK.
