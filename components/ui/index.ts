// Punto de entrada de components/ui — primitivos shadcn/ui base (sección
// 5.4/14.6). Se generan únicamente los componentes que un módulo ya
// implementado necesita (ver README.md de esta carpeta) — hasta ahora, los
// requeridos por el módulo Dashboard.

export { Button, buttonVariants, type ButtonProps } from "./Button";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar";
export { Avatar, type AvatarProps } from "./Avatar";
export { Skeleton } from "./Skeleton";
export { Badge, type BadgeProps } from "./Badge";
export { Loading, type LoadingProps } from "./Loading";
export { StatusPanel, type StatusPanelProps } from "./StatusPanel";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { ErrorState, type ErrorStateProps } from "./ErrorState";
export { ForbiddenState, type ForbiddenStateProps } from "./ForbiddenState";
export { UnauthorizedState, type UnauthorizedStateProps } from "./UnauthorizedState";
export { NotFoundState, type NotFoundStateProps } from "./NotFoundState";
export { Select, selectVariants, type SelectProps } from "./Select";
export { Textarea, textareaVariants, type TextareaProps } from "./Textarea";
export { Dialog, type DialogProps } from "./Dialog";
