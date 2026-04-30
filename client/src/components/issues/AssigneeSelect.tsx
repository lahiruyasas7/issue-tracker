import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { userService, type UserOption } from '@/api/user.api';

interface Props {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export function AssigneeSelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    staleTime: 1000 * 60 * 5, // users list changes rarely — cache for 5 min
  });

  const users = data?.data ?? [];
  const selectedUser = users.find((u) => u.id === value) ?? null;
 
  if (isLoading) {
    return <Skeleton className="h-10 w-full rounded-md" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'flex-1 justify-between border-zinc-200 hover:bg-zinc-50',
              'font-normal',
              !selectedUser && 'text-zinc-400',
            )}
          >
            {selectedUser ? (
              <span className="flex items-center gap-2">
                {/* Mini avatar */}
                <span
                  className="w-5 h-5 rounded-full bg-black text-white
                                  flex items-center justify-center text-xs
                                  font-medium shrink-0"
                >
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
                {selectedUser.name}
              </span>
            ) : (
              'Unassigned'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-zinc-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search users..."
              className="h-9 text-sm"
            />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user: UserOption) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`} // searched on both
                    onSelect={() => {
                      onChange(user.id === value ? null : user.id);
                      setOpen(false);
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    {/* Avatar */}
                    <span
                      className="w-6 h-6 rounded-full bg-black text-white
                                      flex items-center justify-center text-xs
                                      font-medium shrink-0"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>

                    {/* Name + email */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        {user.email}
                      </span>
                    </div>

                    {/* Check if selected */}
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0',
                        value === user.id
                          ? 'text-black opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear button — only shown when someone is assigned */}
      {selectedUser && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="text-zinc-400 hover:text-black px-2"
          aria-label="Clear assignee"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
