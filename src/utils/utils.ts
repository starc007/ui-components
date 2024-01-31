//BAD PRACTICE: NEVER STORE API KEYS IN THE FRONTEND, USE PROXY SERVER INSTEAD
//USING THIS JUST FOR DEMO PURPOSES
const API_KEY = "t-65b563ff612159001c16f8e1-63e70bbe8dac41a19fc9ea9d";

// Bad Practice: Never use any type, use proper types instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options: any = {
  method: "POST",
  headers: {
    "x-api-key": API_KEY,
  },
};

export const uploadData = async (data: FormData) => {
  const url = "https://api.tatum.io/v3/ipfs";
  try {
    // options.headers["content-type"] = "multipart/form-data";
    const response = await fetch(url, {
      ...options,
      body: data,
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const getIpfsData = async (id: string) => {
  const url = `https://api.tatum.io/v3/ipfs/${id}`;
  try {
    options.method = "GET";
    const response = await fetch(url, options);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};
