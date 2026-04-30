import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/auth/useLogout';

const Navbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/auth');
      },
    });
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/issues" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white font-bold">
            IT
          </div>
          <span className="text-lg font-semibold">Issue Tracker</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* New Issue */}
          <Link to="/issues/new">
            <Button size="sm" className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              New Issue
            </Button>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user?.name ?? 'Account'}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="cursor-pointer text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
