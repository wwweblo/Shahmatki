import {z} from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, {
        message: "Имя пользователя может содержать только буквы, цифры, подчеркивание и дефис"
    })
});

export { loginSchema, registerSchema };