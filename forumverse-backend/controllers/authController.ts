import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../middlewares/validator'; 
import { Request, Response } from 'express';
import { sendEmail } from '../utils/sendEmail';

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {

  try {
    const {email, username, password} = registerSchema.parse(req.body)

    //check if user exists
    const existingUser = await prisma.user.findFirst({
        where: {OR: [{email}, {username}]}
    })

    if(existingUser){
        return res.status(401).json({error: "User already eists"})
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    //create user
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            // avatar:  username[0].toUpperCase()

        },
        select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            role: true,
            joinDate: true,
            reputation: true
        }
    })

    // generate JWT
    const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET!,
        {expiresIn: '7d'}
    )

    const verificationLink = `${process.env.BACKEND_BASE_URL}/api/auth/verify-email?token=${token}&email=${email}`;

    await sendEmail(email, 'Verify your email', `Click to verify: ${verificationLink}`);

    return res.status(201).json({ message: 'User registered. Please verify email.' });


  
    
  } catch (error) {
    console.error(error); // log Zod error details
  return res.status(400).json({ error: error instanceof Error ? error.message : 'Something went wrong' });
    
  }
};


export const verifyEmail = async (req: Request, res: Response) => {
    const email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email;
    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;

    if (typeof email !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token or email format' });
    }

    try {
        const user = await prisma.user.findFirst({
             where: {OR: [{email}, {token}]}
        })

     if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

        // mark email as verified
        await prisma.user.update({
            where: {id: user.id},
            data: {
                emailVerified: true,
                token: null,
                tokenExpiresAt: null
            }
        })
          // ✅ Redirect to frontend success page after verification
    return res.redirect(`${process.env.FRONTEND_URL}/verify-success`);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const resendVerificaionEmail = async (req: Request, res:Response) => {
    const {email} = req.body

    try {
        const user = await prisma.user.findFirst({
            where: {email}
        })

        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

         if (user.emailVerified) {
            return res.status(400).json({ error: 'Email is already verified.' });
        }

        // Generate a new token and expiry
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        user.token = verificationToken;
        user.tokenExpiresAt = tokenExpiresAt;
        await prisma.user.update({
            where: {id: user.id},
            data: {
                 token: verificationToken,
                tokenExpiresAt: tokenExpiresAt,
            }
        })

        const verificationLink = `${process.env.BACKEND_BASE_URL}/api/auth/verify-email?token=${verificationToken}&email=${email}`;
        await sendEmail(email, 'Verify your email', `Click to verify: ${verificationLink}`);

        res.json({ success: true, message: 'Verification email resent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Could not resend verification email' });
    }
   

}

export const login = async(req:Request, res:Response) => {
    try {
        const {email, password} = loginSchema.parse(req.body)

        //find user
        const user = await prisma.user.findUnique({
            where: { email },
            // include: {
            //     posts: true,
            //     comment: true,
            //     // optionally:
            //     savedPosts: true,
            //     votes: true,
            //     reports: true,
            // }
            });


        if(!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({error: 'Invalid credentials'})
        }

        if(!user.emailVerified) {
            return res.status(403).json({error: 'Please verify email before login'})
        }

         // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });

    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
}

export const logout = async (req:Request, res:Response) => {
    try {
        res.clearCookie('Authorization')
        res.status(200).json({message: 'Logged out successfully'});
        
    } catch (error) {
        console.log('Error during logout:', error);
        res.status(500).json({error: 'Internal server error'});
    }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};