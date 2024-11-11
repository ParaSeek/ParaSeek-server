import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";

const getUser = async (userId) => {
    try {
        const user = await User.findById(userId);

        if(!user){
            throw new ApiError(400,"User not exist")
        }

        if(user.role === 'job_seeker'){
            return {
                firstName:user.firstName,
                lastName:user.lastName,
                phoneNumber:user.phoneNumber,
                email:user.email,
                username:user.username,
                gender:user.gender,
                role:user.role,
                location:user.location,
                profilePic:user.profilePic,
                jobPreferences:user.jobPreferences,
                qualification:user.qualification,
                applications:user.applications,
                resume:user.resume
            }
        }
        else{
            return {
                firstName:user.firstName,
                lastName:user.lastName,
                phoneNumber:user.phoneNumber,
                email:user.email,
                username:user.username,
                gender:user.gender,
                role:user.role,
                profilePic:user.profilePic,
                jobsPosted:user.jobsPosted,
            }
        }
    } catch (error) {
        throw new ApiError(400, "User id not present in the data base")
    }
}

export default getUser;