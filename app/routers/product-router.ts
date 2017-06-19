import {productService} from "../services/product-service";
import {ProductInstance} from "../models/interfaces/product-interface";
import {Request, Response, Router} from "express";

export const router = Router();

router.post("/", (req: Request, res: Response) => {
  productService.createProduct(req.body).then((product: ProductInstance) => {
    return res.status(201).send(product);
  }).catch((error: Error) => {
    return res.status(409).send(error);
  });
});

router.get("/:name", (req: Request, res: Response) => {
  productService.retrieveProduct(req.params.name).then((product: ProductInstance) => {
    if (product) {
      return res.send(product);
    } else {
      return res.sendStatus(404);
    }
  }).catch((error: Error) => {
    return res.status(500).send(error);
  });
});

router.get("/", (req: Request, res: Response) => {
  productService.retrieveProducts().then((products: Array<ProductInstance>) => {
    return res.send(products);
  }).catch((error: Error) => {
    return res.status(500).send(error);
  });
});

router.post("/:name", (req: Request, res: Response) => {
  productService.updateProduct(req.params.name, req.body).then(() => {
    return res.sendStatus(200);
  }).catch((error: Error) => {
    return res.status(409).send(error);
  });
});

router.delete("/:name", (req: Request, res: Response) => {
  productService.deleteProduct(req.params.name).then(() => {
    return res.sendStatus(200);
  }).catch((error: Error) => {
    return res.status(500).send(error);
  });
});
