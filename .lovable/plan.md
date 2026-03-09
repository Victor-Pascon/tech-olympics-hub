

## Plano: Reformular cards de postagens na página inicial

### Problema
As postagens estão aparecendo em cards pequenos em grid de 3 colunas, com imagem quebrada e botão "Ler mais" desnecessario. O usuario quer cards grandes, retangulares, centralizados, mostrando todo o conteudo.

### Alteracoes em `src/pages/Index.tsx` (linhas 135-173)

- Substituir o grid `md:grid-cols-2 lg:grid-cols-3` por layout vertical (`flex flex-col gap-8`) com largura maxima centralizada (`max-w-3xl mx-auto`)
- Cada card sera grande e retangular, exibindo:
  - Imagem (se houver URL valida; caso contrario, ocultar em vez de mostrar placeholder quebrado)
  - Tags e categoria
  - Titulo em tamanho maior
  - Conteudo completo (sem truncamento/excerpt)
  - Data de publicacao
- Remover botao "Ler mais" e o `CardFooter` com o botao
- Remover a funcao `getExcerpt` (nao sera mais necessaria)
- Manter a data como informacao secundaria dentro do card

