import { Router } from 'express';
import { EventRoutes } from '../modules/event/event.route';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
  {
    path: '/events',
    route: EventRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
