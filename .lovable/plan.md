
## Plano: Reformulação Visual Premium com Fundo Matrix

### Visão Geral
Transformar o site com uma identidade visual premium, moderna e minimalista usando o fundo estilo matrix/cyberpunk enviado, efeitos de hover com bordas verdes brilhantes, e fundo predominante azul escuro/preto.

### 1. Adicionar imagem de fundo Matrix
- Copiar a imagem `user-uploads://image-5.png` para `public/matrix-bg.jpg`
- Usar como background da seção Hero com overlay escuro para legibilidade

### 2. Reformular variáveis CSS (cores e efeitos)
- **Background**: Azul muito escuro puxado pro preto (`220 40% 4%`)
- **Card background**: Fundo escuro com transparência para efeito glassmorphism
- **Primary**: Verde cyberpunk mais vibrante
- Adicionar variáveis para glow effects

### 3. Novos efeitos de hover e transição
Criar classes utilitárias em `src/index.css`:
- `.btn-cyber`: Botão com borda verde brilhante no hover, sombra glow
- `.card-premium`: Card com borda animada verde no hover, sombra difusa
- `.glow-border`: Borda com efeito de brilho pulsante
- Transições suaves (300ms) em todos elementos interativos

### 4. Atualizar componentes
- **Index.tsx**: Hero com background matrix + overlay, cards com classe `.card-premium`
- **Header.tsx**: Glassmorphism mais forte, botões com hover glow
- **Footer.tsx**: Fundo mais escuro, elementos com hover sutil
- **Cadastro.tsx, Login.tsx, AdminLogin.tsx**: Fundo escuro consistente

### 5. Efeitos específicos
- Botões: `box-shadow` verde no hover, scale sutil
- Cards: Borda verde luminosa no hover, sombra difusa
- Links: Underline animado + cor verde no hover
- Inputs: Borda verde glow no focus

### Arquivos a modificar
1. `public/matrix-bg.jpg` (copiar imagem)
2. `src/index.css` (cores, classes utilitárias, animações)
3. `src/pages/Index.tsx` (fundo hero, classes dos cards)
4. `src/components/Header.tsx` (hover effects)
5. `src/components/Footer.tsx` (visual consistente)
