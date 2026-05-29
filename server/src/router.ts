import { Router } from "express";
import usersRouter from "./controllers/Users";
import addressesRouter from "./controllers/Addresses";

const apiRouter = Router();

apiRouter.get("/bonjour", (_, res) => {
  res.json({ message: "Bonjour !" });
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/addresses", addressesRouter);

export default apiRouter;
