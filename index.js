import * as fcl from "@onflow/fcl";
import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Modal from "./models/wallet.js";

fcl.config().put("accessNode.api", "https://rest-mainnet.onflow.org");

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  `mongodb://mongo:OzYGemzCkuA2y64S1qbJ@containers-us-west-199.railway.app:7051`
);

const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});



const createAddress = async (publicKey) => {
  const data = await axios.post(
    "https://openapi.lilico.org/v1/address",
    {
      publicKey,
      hashAlgorithm: "SHA3_256",
      signatureAlgorithm: "ECDSA_secp256k1",
      weight: 1000,
    },
    {
      headers: {
        Authorization: "lilico:sF60s3wughJBmNh2",
      },
    }
  );

  const transaction = await fcl.tx(data.data.data.txId).onceSealed();

  const address = transaction?.events?.find(
    (item) => item.type === "flow.AccountCreated"
  )?.data?.address;

  return address;
};

// requests will never reach this route
app.get('/', function (req, res) {
  res.send('Welcome to API')
})

app.post("/create-wallet", async (req, res) => {
  const { publicKey, name } = req.body;

  try {
    //localhost

    const address = await createAddress(publicKey);

    const walletData = new Modal({
      publicKey,
      address,
      name,
    });

    const dataToSave = await walletData.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/restore-wallet", async (req, res) => {
  const { publicKey, name } = req.query;
  try {
    let data;
    const wallets = await Modal.find();
    data = wallets.find((item) => item.publicKey === publicKey);

    if (!data) {
      const address = await createAddress(publicKey);
      
      const walletData = new Modal({
        publicKey,
        address,
        name,
      });

      data = await walletData.save();
    }
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log("listen");
});
