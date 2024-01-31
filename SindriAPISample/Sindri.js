import axios from 'axios';
import toml from '@iarna/toml';
import Config from 'react-native-config';

// APIキーとURLの取得
const API_KEY = Config.SINDRI_API_KEY;
const API_URL_PREFIX = Config.SINDRI_API_URL || "https://sindri.app/api/";
const API_VERSION = "v1";
const API_URL = API_URL_PREFIX.concat(API_VERSION);

const headersJson = {
  Accept: "application/json",
  Authorization: `Bearer ${API_KEY}`
};

async function pollForStatus(endpoint, timeout = 20 * 60) {
  for (let i = 0; i < timeout; i++) {
    const response = await axios.get(API_URL + endpoint, {
      headers: headersJson,
      validateStatus: (status) => status === 200,
    });

    const status = response.data.status;
    if (["Ready", "Failed"].includes(status)) {
      console.log(`Poll exited after ${i} seconds with status: ${status}`);
      return response;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(`Polling timed out after ${timeout} seconds.`);
}

export async function generateProof() {
  try {
    const circuitId = "e98c114f-6b0d-4fe0-9379-4ee91a1c6963";
    console.log("Proving circuit...");
    const proofInput = toml.stringify({ input: 10 });
    const proveResponse = await axios.post(
      API_URL + `/circuit/${circuitId}/prove`,
      { proof_input: proofInput },
      { headers: headersJson, validateStatus: (status) => status === 201 },
    );
    const proofId = proveResponse.data.proof_id;

    const proofDetailResponse = await pollForStatus(`/proof/${proofId}/detail`);
    const proofDetailStatus = proveResponse.data.status;
    if (proofDetailStatus === "Failed") {
      throw new Error("Proving failed");
    }

    const proverTomlContent = proofDetailResponse.data.proof_input['Prover.toml'];
    const verifierTomlContent = proofDetailResponse.data.public['Verifier.toml'];

    console.log(proverTomlContent);
    console.log(verifierTomlContent);
    const publicOutput = verifierTomlContent;
    console.log(`Circuit proof output signal: ${publicOutput}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}
