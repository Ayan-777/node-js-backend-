import mongoose, {Schema} from "mongoose";
import { type } from "os";

const tweetSchema = new Schema({
    constent: {
        type: String,
        required: ture
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: ture})

export const Tweet = mongoose.model("Tweet",tweetSchema)