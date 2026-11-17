import { Router } from "express";
import type { ItemRepository } from "../../database/repositories/item-repository.js";
import { createItemsController } from "./items-controller.js";

export function createItemsRoutes(items: ItemRepository): Router {
  const router = Router();
  const controller = createItemsController(items);
  router.get("/items", controller.list);
  router.get("/items/:id", controller.detail);
  return router;
}
