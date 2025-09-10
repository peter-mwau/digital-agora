import { createThirdwebClient} from "thirdweb";


// You can configure your client here
export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID!,
  // Add any other config options if needed
});
