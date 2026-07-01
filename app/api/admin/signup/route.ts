import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";



export async function POST(req:Request){
    try {
        const { name , email,password } =await req.json();

        if(!name || !email || !password){
            return NextResponse.json(
                {message : "All the fields are required"},
                {status : 400}
            )

        }

        const existing = await prisma.user.findUnique({
            where : {email}
        })

        if(existing){
            return NextResponse.json(
                {message : "User already exists"},
                {status : 400}
            )
        } 
        const hashedPassword = await bcrypt.hash(password,10);
        
        const user = await prisma.user.create({
            data : {
                name,
                email,
                password : hashedPassword
            }
        })
        return NextResponse.json(
            {user},
            {status : 201}
        )
    } catch (error) {
        return NextResponse.json(
            {message : "Internal Server Error"},
            {status : 500}
        )
    }
}