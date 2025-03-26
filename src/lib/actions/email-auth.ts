import { executeAction } from "@/lib/actions/execute";
import { schema } from "@/lib/schema";
import { prisma } from "@/lib/prisma";
// import bcrypt from 'bcrypt'; // Импортируем bcrypt для хеширования паролей

const signUp = async (formData: {email:string, password:string}) => {
    return executeAction({
        actionFN: async () => {
            const email = formData.email;
            const password = formData.password;

            // Проверяем, что email и password не равны null
            if (!email || !password) {
                throw new Error("Email and password are required");
            }

            const validatedCredentials = schema.parse({ email, password });

            // Хешируем пароль перед сохранением
            // const hashedPassword = await bcrypt.hash(validatedCredentials.password, 10);

            await prisma.user.create({
                data: {
                    email: validatedCredentials.email,
                    password: validatedCredentials.password
                    // password: hashedPassword, // Сохраняем хешированный пароль
                },
            });
        }
    });
};

export default signUp;