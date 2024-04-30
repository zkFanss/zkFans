import { createPublicClient, http } from "viem";
import { scrollSepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http(),
});
