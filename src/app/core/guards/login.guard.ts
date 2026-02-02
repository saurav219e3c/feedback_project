import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const loginGuard: CanMatchFn = ():
  | boolean
  | UrlTree
  | import('rxjs').Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return true;
      }

      const redirect = getRoleHome(auth);
      return router.createUrlTree([redirect]);
    }),
  );
};

function getRoleHome(auth: AuthService): string {
  let primary: string = '/dashboard';

  const u = (auth as any)._user$?.getValue?.() ?? null;
  const roles: string[] = u?.roles ?? [];

  if (roles.includes('Admin')) return '/admin';
  if (roles.includes('Manager')) return '/manager';
  if (roles.includes('Employee')) return '/employee';
  return primary;
}
