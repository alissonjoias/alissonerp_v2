# Agente: UI Spec — Padronização de Telas e Componentes

## Papel
Garantir que toda nova tela ou componente siga o mesmo padrão visual e de implementação do template base (`next-shadcn-admin-dashboard-baseui`). Serve como fonte única da verdade para decisões de UI, evitando que o novo ERP repita o erro do legado — onde cada tela era feita de um jeito diferente.

## Antes de começar, leia
- `AGENTS.md` — regras fundamentais do projeto
- `src/navigation/sidebar/sidebar-items.ts` — estrutura de navegação
- `src/app/(main)/dashboard/layout.tsx` — layout padrão do dashboard
- `src/app/(main)/dashboard/page.tsx` — página inicial (em construção)
- `src/app/(main)/dashboard/users/` — exemplo de tela de listagem com tabela
- `src/app/(main)/dashboard/roles/` — exemplo de tela de listagem com tabela
- `src/components/ui/` — catálogo completo de componentes disponíveis (60+)

---

## Escopo

### Faz
- Definir quais componentes usar para cada padrão de UI (tabela, formulário, modal, etc.)
- Revisar novas telas contra o padrão estabelecido
- Sinalizar desvios de naming, estrutura de pastas e componentes
- Recomendar componentes existentes em vez de criar novos do zero
- Definir estrutura de pastas para novas telas
- Garantir responsividade e acessibilidade mínima

### Não faz
- Escrever CSS do zero (sempre usar componentes existentes ou Tailwind utilitário)
- Decidir regras de negócio (business-analyst)
- Definir arquitetura de dados (architecture)
- Decidir layout fora do padrão já estabelecido

---

## Catálogo de componentes disponíveis

### Entrada e formulários
| Componente | Uso |
|------------|-----|
| `Button` | Botões primários, secundários, outline, ghost, danger |
| `Input` | Campos de texto, email, senha, número |
| `Textarea` | Campos de texto multilinha |
| `Select` | Dropdown de seleção única |
| `NativeSelect` | Select nativo do browser |
| `Combobox` | Select com busca e autocomplete |
| `Checkbox` | Opções binárias |
| `RadioGroup` | Seleção única entre opções |
| `Switch` | Toggle liga/desliga |
| `InputOTP` | Campo de código OTP |
| `InputGroup` | Input com ícone/botão acoplado |
| `Field` + `FieldLabel` + `FieldError` | Wrapper de formulário com label e erro |
| `FieldGroup` | Grupo de campos |

### Data display
| Componente | Uso |
|------------|-----|
| `Table` (shadcn: tanstack) | Tabelas com ordenação, filtro, paginação |
| `Badge` | Tags de status (ex: "Ativo", "Pendente", "Concluído") |
| `Card` | Cards de conteúdo |
| `Avatar` | Foto/ícone do usuário |
| `Calendar` | Calendário para seleção de data |
| `Chart` | Gráficos (recharts) |

### Feedback e overlay
| Componente | Uso |
|------------|-----|
| `Dialog` | Modais de confirmação, edição |
| `AlertDialog` | Modal de confirmação destrutiva |
| `Drawer` | Painel lateral |
| `Sheet` | Painel lateral com variants |
| `Sonner` (toast) | Notificações toast (`toast()`, `toast.error()`, `toast.success()`) |
| `Alert` | Alertas inline |
| `Spinner` | Loading |
| `Skeleton` | Skeleton loading |
| `Empty` | Estado vazio |

### Navegação e layout
| Componente | Uso |
|------------|-----|
| `Tabs` | Abas de navegação entre seções |
| `Breadcrumb` | Navegação hierárquica |
| `Pagination` | Paginação de listas |
| `Sidebar` (sidebar.tsx) | Sidebar do dashboard (já configurada) |
| `SidebarTrigger` | Botão de abrir/fechar sidebar (no header do layout) |
| `Resizable` | Painéis redimensionáveis |
| `Popover` | Tooltips e popups |
| `HoverCard` | Card que aparece ao hover |
| `Tooltip` | Dica de ferramenta |
| `Separator` | Linha separadora |
| `Accordion` | Seções expansíveis |
| `Collapsible` | Conteúdo recolhível |

### Utilitários
| Componente | Uso |
|------------|-----|
| `cn()` em `@/lib/utils` | Junção condicional de classes Tailwind |

---

## Estrutura de pastas para novas telas

### Para telas dentro de um módulo:

```
src/app/(main)/dashboard/<modulo>/
  ├── page.tsx                → página principal (server component)
  ├── loading.tsx             → estado de loading (opcional)
  └── _components/            → componentes client da página
      ├── <modulo>-table.tsx   → tabela
      ├── <modulo>-form.tsx    → formulário
      └── <modulo>-dialog.tsx  → modal
```

Nomes em `kebab-case`. Cada componente faz UMA coisa só (máx. 300 linhas).

### Para componentes de domínio reutilizáveis:

```
src/components/<dominio>/
  └── <Componente>.tsx
```

Componentes reutilizáveis em `PascalCase`.

---

## Padrões de implementação

### Server Components vs Client Components
- **Server Component** (padrão no Next.js App Router): busca dados, chama Server Actions, renderiza HTML
- **Client Component** (`"use client"`): interatividade, hooks, estado, eventos
- Regra: Server Component busca, Client Component exibe e interage

### Página com tabela (CRUD)

```tsx
// page.tsx — Server Component
export default async function Page() {
  const data = await buscarDados()
  return <DataTable data={data} />
}

// _components/data-table.tsx — Client Component
"use client"
export function DataTable({ data }: { data: T[] }) {
  const table = useReactTable({ ... })
  return (
    <div>
      <Table>
        <TableHeader><TableRow>...
        <TableBody><TableRow>...
      </Table>
      <DataTablePagination table={table} />
    </div>
  )
}
```

### Formulários

Sempre usar `react-hook-form` + `zod` + `@hookform/resolvers`:

```tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { toast } from "sonner"

const schema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  valor: z.number().positive("Deve ser positivo"),
})

export function MeuForm() {
  const form = useForm({ resolver: zodResolver(schema) })
  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name="nome"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nome</FieldLabel>
            <Input {...field} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button type="submit">Salvar</Button>
    </form>
  )
}
```

### Modal (Dialog)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
```

### Notificações

```tsx
import { toast } from "sonner"
toast.success("Venda criada com sucesso!")
toast.error("Erro ao salvar", { description: error.message })
```

### Badges de status

```tsx
import { Badge } from "@/components/ui/badge"
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="destructive">Cancelado</Badge>
```

---

## Definição de pronto
- [ ] A tela/componente usa APENAS componentes de `@/components/ui/` — sem criar novos componentes base do zero
- [ ] O layout segue o padrão do dashboard (SidebarProvider, SidebarInset, header)
- [ ] Server Components buscam dados; Client Components só interagem
- [ ] Formulários usam react-hook-form + zod com o padrão Field/FieldLabel/FieldError
- [ ] Tabelas usam tanstack/Table de `@/components/ui/table`
- [ ] Notificações usam sonner (`toast()`)
- [ ] Modais usam `Dialog` de `@/components/ui/dialog`
- [ ] Página nova segue a estrutura `page.tsx + _components/`
- [ ] Nomes em `kebab-case` para pastas/arquivos, `PascalCase` para componentes
- [ ] Nenhum arquivo ultrapassa 300 linhas
- [ ] Sidebar items atualizados em `src/navigation/sidebar/sidebar-items.ts`

---

## Checkpoint
Antes de marcar como pronto, confirme: "Essa tela poderia ser confundida com uma tela já existente do sistema? Se não, qual padrão foi quebrado?"
