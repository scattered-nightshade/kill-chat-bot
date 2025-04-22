import { model, Schema, Document } from 'mongoose';

export interface IProfile extends Document {
    userID: string;
    deadChats: number;
}


const profileSchema = new Schema({
    userID: { type: Schema.Types.String, required: true, unique: true },
    deadChats: { type: Schema.Types.Int32, default: 0 },
}, { timestamps: true });

const ProfileModel = model<IProfile>('profiles', profileSchema);

class Profile {
    userID: string;
    deadChats: number;

    constructor(userID: string, deadChats: number) {
        this.userID = userID;
        this.deadChats = deadChats;
    }

    static async getAllProfiles(): Promise<IProfile[]> {
        return ProfileModel.find();
    }

    static async getProfileById(userID: string): Promise<IProfile> {
        return ProfileModel.findOneAndUpdate({ userID }, { }, { upsert: true, new: true });
    }

    static async getProfilesByUser(userID: string): Promise<IProfile[]> {
        return ProfileModel.find({ userID });
    }

    static async getProfilesByGuild(guildID: string): Promise<IProfile[]> {
        return ProfileModel.find({ guildID });
    }

    async save(): Promise<IProfile> {

        const profile = new ProfileModel({
            userID: this.userID,
        });

        return profile.save();
    }

    static async updateProfile(userID: string, update: Partial<IProfile>): Promise<IProfile | null> {
        return ProfileModel.findOneAndUpdate({ userID }, update, { upsert: true, new: true });
    }

    static async deleteProfile(userID: string): Promise<IProfile | null> {
        return ProfileModel.findOneAndDelete({ userID });
    }
}

export default Profile;