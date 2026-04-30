import type { ReactNode } from 'react';

interface MetaRowProps {
  label: string;
  children: ReactNode;
}

export function MetaRow({ label, children }: MetaRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {label}
      </span>
      <div className="text-sm text-black">{children}</div>
    </div>
  );
}

interface AvatarProps {
  name: string;
  email: string;
}

export function UserAvatar({ name, email }: AvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full bg-black text-white flex
                      items-center justify-center text-xs font-medium shrink-0"
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-black">{name}</span>
        <span className="text-xs text-zinc-400">{email}</span>
      </div>
    </div>
  );
}
