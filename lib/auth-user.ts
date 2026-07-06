import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import userRepository from "@/repositories/user.repository";



export async function requireUser(){
    const session = await getServerSession(authOptions);
    if(!session?.user?.id){
        throw new Error("UNAUTHORIZED");
    }

    const user = await userRepository.findById(session.user.id);

    if(!user){
        throw new Error("USER_NOT_FOUND");
    }
    return user;
}