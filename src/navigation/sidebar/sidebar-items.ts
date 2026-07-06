import {
  type LucideIcon,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Scale,
  Factory,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  ClipboardList,
  Truck,
  Warehouse,
  FileText,
  ShieldCheck,
  BarChart3,
  ListTodo,
  Gift,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Visão Geral",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Comercial",
    items: [
      {
        id: "vendas",
        title: "Vendas",
        icon: ShoppingBag,
        badge: "soon",
        disabled: true,
        url: "/dashboard",
      },
      {
        id: "crediario",
        title: "Crediário",
        url: "/dashboard",
        icon: Gift,
        badge: "soon",
        disabled: true,
      },
    ],
  },
  {
    id: 3,
    label: "Estoque",
    items: [
      {
        id: "produtos",
        title: "Produtos",
        url: "/dashboard",
        icon: Package,
        badge: "soon",
        disabled: true,
      },
      {
        id: "estoque",
        title: "Estoque",
        url: "/dashboard",
        icon: Warehouse,
        badge: "soon",
        disabled: true,
      },
    ],
  },
  {
    id: 4,
    label: "Produção",
    items: [
      {
        id: "ordens",
        title: "Ordens",
        url: "/dashboard",
        icon: FileText,
        badge: "soon",
        disabled: true,
      },
    ],
  },
  {
    id: 5,
    label: "Financeiro",
    items: [
      {
        id: "financeiro",
        title: "Financeiro",
        url: "/dashboard",
        icon: DollarSign,
        badge: "soon",
        disabled: true,
      },
    ],
  },
  {
    id: 6,
    label: "Administrativo",
    items: [
      {
        id: "usuarios",
        title: "Usuários",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "roles",
        title: "Cargos",
        url: "/dashboard/roles",
        icon: ShieldCheck,
      },
    ],
  },
];
