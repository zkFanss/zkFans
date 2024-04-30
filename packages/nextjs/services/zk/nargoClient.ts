import circuit from "../../../zk/circuits/target/circuits.json";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { InputMap } from "@noir-lang/noirc_abi";
import { ProofData } from "@noir-lang/types";

class NargoClient {
  private backend;
  private noir;
  static client: NargoClient;

  constructor(circuit: any) {
    this.backend = new BarretenbergBackend(circuit);
    this.noir = new Noir(circuit, this.backend);
  }

  public static getInstance() {
    if (!NargoClient.client) {
      NargoClient.client = new NargoClient(circuit);
    }

    return NargoClient.client;
  }

  public async applyProof(input: InputMap) {
    const proof = await this.noir.generateFinalProof(input);

    return proof;
  }

  public async verifyProof(input: ProofData) {
    const result = await this.noir.verifyFinalProof(input);

    return result;
  }
}

const nargoInstance = NargoClient.getInstance();

export default nargoInstance;
