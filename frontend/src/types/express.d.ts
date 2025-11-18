import { User } from "@tpfinal/types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
