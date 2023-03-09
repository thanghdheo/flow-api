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
  `mongodb+srv://thangc98:16112000%40Abc@thangc98.bfhoh5t.mongodb.net/test`
);

const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.post("/create-wallet", async (req, res) => {
  const { publicKey, signatureAlgorithm, hashAlgorithm, weight, name } =
    req.body;

  try {
    //localhost
    const data = await axios.post(
      "https://openapi.lilico.org/v1/address",
      {
        publicKey,
        hashAlgorithm,
        signatureAlgorithm,
        weight,
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
  const { publicKey } = req.query;
  console.log(publicKey)
  try {
    const wallets = await Modal.find();
    const data = wallets.find((item) => item.publicKey === publicKey);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(8080, () => {
  console.log("listen");
});
