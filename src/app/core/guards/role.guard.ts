// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Role } from '../models/role.model';

/**
 * Route role guard.
 *
 * Reads required roles from `route.data.roles` (e.g. `data: { roles: ['Admin'] }`).
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = (route.data?.['roles'] ?? []) as Role[];
  if (!required.length) return true;

  return auth.roles$.pipe(
    take(1),
    map((roles) => {
      const ok = required.some((r) => roles.includes(r));
      if (ok) return true;
      router.navigate(['/auth/login-page']);
      return false;
    })
  );
};