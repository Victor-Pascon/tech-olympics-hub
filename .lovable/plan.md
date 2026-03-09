

## Plano: Corrigir mapa bloqueado pelo Google

### Problema
O `maps.google.com` bloqueia embeds com `ERR_BLOCKED_BY_RESPONSE`. O Google Maps embed gratuito requer o dominio `www.google.com/maps/embed` com parametros especificos.

### Solucao em `src/pages/Index.tsx` (linhas 199-206)

Substituir o iframe atual por uma URL no formato correto do Google Maps Embed (sem API key):

```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.123!2d-37.4252!3d-10.6847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7131de9e1e11111%3A0x1234567890!2sInstituto+Federal+de+Sergipe+-+Campus+Itabaiana!5e0!3m2!1spt-BR!2sbr!4v1234567890
```

Alternativa mais confiavel: usar o formato `www.google.com/maps?q=...&output=embed` com o dominio `www.google.com` em vez de `maps.google.com`:

```
https://www.google.com/maps?q=-10.6847,-37.4252&z=16&output=embed
```

Usar coordenadas exatas do IFS Itabaiana (`-10.6847, -37.4252`) para garantir que o pin apareca no local correto. O link clicavel do endereco continua apontando para `https://maps.app.goo.gl/jWnVo1J8UMN5GVf59`.

### Alteracao
- Linha 201: trocar `src` do iframe para `https://www.google.com/maps?q=-10.6847,-37.4252&z=16&output=embed`

