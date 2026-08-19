'use client';

export { Button } from './Button';
export { Input } from './Input';
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export { Badge } from './Badge';
export { Modal } from './Modal';
export { ToastProvider, useToast, Toast } from './Toast';
export type { ToastItem } from './Toast';
export { Skeleton } from './Skeleton';
export { Spinner } from './Spinner';
export { Tooltip } from './Tooltip';

export default {
  Button: () => import('./Button'),
  Input: () => import('./Input'),
  Card: () => import('./Card'),
  Badge: () => import('./Badge'),
  Modal: () => import('./Modal'),
  Toast: () => import('./Toast'),
  Skeleton: () => import('./Skeleton'),
  Spinner: () => import('./Spinner'),
  Tooltip: () => import('./Tooltip'),
};
