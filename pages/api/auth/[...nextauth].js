import nextAuthModule from "next-auth";
import { authOptions } from "../../../lib/auth";

const NextAuth = nextAuthModule.default || nextAuthModule;

export default NextAuth(authOptions);
