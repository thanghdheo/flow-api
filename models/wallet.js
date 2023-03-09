import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const WalletSchema = new Schema(
  {
    publicKey: String,
    address: String,
    name: String,
  },
);

WalletSchema.plugin(mongoosePaginate);

export default mongoose.model("wallet", WalletSchema);
